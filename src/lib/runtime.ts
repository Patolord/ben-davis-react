import { randomUUID } from 'node:crypto';
import { Cause, Data, Effect, Exit, Layer, ManagedRuntime } from 'effect';
import { NodeServices } from '@effect/platform-node';
import { ConvexError, ConvexPrivateService } from './services/convex';
import { ClerkError, ClerkService } from './services/clerk';

const appLayer = Layer.mergeAll(NodeServices.layer, ConvexPrivateService.layer, ClerkService.layer);

export const runtime = ManagedRuntime.make(appLayer);

export class GenericError extends Data.TaggedError('GenericError')<{
	readonly message: string;
	readonly status: number;
	readonly kind: string;
	readonly timestamp: number;
	readonly traceId: string;
	readonly cause?: unknown;
}> {}

export const createGenericError = ({
	message,
	status,
	kind,
	cause
}: {
	message: string;
	status: number;
	kind: string;
	cause?: unknown;
}) =>
	new GenericError({
		message,
		status,
		kind,
		timestamp: Date.now(),
		traceId: randomUUID(),
		cause
	});

const serializeUnknown = (value: unknown): unknown => {
	if (value instanceof Error) {
		return {
			name: value.name,
			message: value.message,
			stack: value.stack,
			cause: value.cause === undefined ? undefined : serializeUnknown(value.cause)
		};
	}

	if (
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		value === null ||
		value === undefined
	) {
		return value;
	}

	if (value && typeof value === 'object' && 'toString' in value) {
		try {
			return JSON.parse(JSON.stringify(value));
		} catch {
			return String(value);
		}
	}
	return String(value);
};

export type PublicError = {
	message: string;
	kind: string;
	timestamp: number;
	traceId: string;
	status: number;
};

const toPublicError = (
	errorValue: GenericError | ConvexError | ClerkError
): PublicError => ({
	message: errorValue.message,
	kind: errorValue.kind,
	timestamp: errorValue.timestamp,
	traceId: errorValue.traceId,
	status: errorValue instanceof GenericError ? errorValue.status : (errorValue instanceof ClerkError ? 401 : 500)
});

const logTaggedError = (errorValue: GenericError | ConvexError | ClerkError) => {
	if (errorValue instanceof ConvexError) {
		console.error('Convex error', {
			traceId: errorValue.traceId,
			kind: errorValue.kind,
			timestamp: errorValue.timestamp,
			operation: errorValue.operation,
			functionName: errorValue.functionName,
			componentPath: errorValue.componentPath,
			message: errorValue.message,
			cause: serializeUnknown(errorValue.cause)
		});

		return;
	}

	if (errorValue instanceof ClerkError) {
		console.error('Clerk error', {
			traceId: errorValue.traceId,
			kind: errorValue.kind,
			timestamp: errorValue.timestamp,
			message: errorValue.message,
			cause: serializeUnknown(errorValue.cause)
		});

		return;
	}

	console.error('Application error', {
		traceId: errorValue.traceId,
		kind: errorValue.kind,
		timestamp: errorValue.timestamp,
		status: errorValue.status,
		message: errorValue.message,
		cause: serializeUnknown(errorValue.cause)
	});
};

export const effectRunner = async <T>(
	effect: Effect.Effect<
		T,
		GenericError | ConvexError | ClerkError,
		NodeServices.NodeServices | ConvexPrivateService | ClerkService
	>
): Promise<{ data: T; error: null } | { data: null; error: PublicError }> => {
	const exit = await runtime.runPromiseExit(effect);

	if (Exit.isFailure(exit)) {
		const cause = exit.cause;

		// logging step
		for (const reason of cause.reasons) {
			if (Cause.isFailReason(reason)) {
				if (
					reason.error instanceof GenericError ||
					reason.error instanceof ConvexError ||
					reason.error instanceof ClerkError
				) {
					logTaggedError(reason.error);
				} else {
					console.error('Unhandled effect error', {
						error: serializeUnknown(reason.error)
					});
				}
			} else if (Cause.isDieReason(reason)) {
				console.error('Effect defect', {
					defect: serializeUnknown(reason.defect)
				});
			} else if (Cause.isInterruptReason(reason)) {
				console.error('Effect interrupted', {
					fiberId: reason.fiberId
				});
			}
		}

		// send down the first error to the client
		const firstError = Cause.findErrorOption(cause);
		if (firstError._tag === 'Some') {
			if (
				firstError.value instanceof ConvexError ||
				firstError.value instanceof ClerkError ||
				firstError.value instanceof GenericError
			) {
				return { data: null, error: toPublicError(firstError.value) };
			}
		}

		const unknownError = createGenericError({
			message: 'An unknown error occurred',
			status: 500,
			kind: 'unknown_error',
			cause
		});

		logTaggedError(unknownError);

		return { data: null, error: toPublicError(unknownError) };
	}

	return { data: exit.value, error: null };
};
