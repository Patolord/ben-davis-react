import { createClerkClient, type User } from '@clerk/backend';
import { auth as getAuth, currentUser as getCurrentUser } from '@clerk/nextjs/server';
import { Data, Effect, Layer, ServiceMap } from 'effect';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;
const PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export class ClerkError extends Data.TaggedError('ClerkError')<{
	readonly message: string;
	readonly kind: string;
	readonly traceId: string;
	readonly timestamp: number;
	readonly cause?: unknown;
}> {}

interface ClerkDef {
	validateAuth: () => Effect.Effect<User, ClerkError>;
}

export class ClerkService extends ServiceMap.Service<ClerkService, ClerkDef>()('ClerkService') {
	static readonly layer = Layer.sync(ClerkService, () => {
		const clerk = createClerkClient({
			secretKey: CLERK_SECRET_KEY,
			publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY
		});

		const validateAuth = () =>
			Effect.gen(function* () {
				const user = yield* Effect.tryPromise({
					try: () => getCurrentUser(),
					catch: (e) =>
						new ClerkError({
							message: e instanceof Error ? e.message : 'Unknown error',
							kind: 'AuthenticationError',
							traceId: crypto.randomUUID(),
							timestamp: Date.now(),
							cause: e
						})
				});

				if (!user) {
					return yield* Effect.fail(
						new ClerkError({
							message: 'Unauthorized',
							kind: 'AuthenticationError',
							traceId: crypto.randomUUID(),
							timestamp: Date.now(),
							cause: new Error('Unauthorized')
						})
					);
				}

				return user as unknown as User;
			});

		return {
			validateAuth
		};
	});
}
