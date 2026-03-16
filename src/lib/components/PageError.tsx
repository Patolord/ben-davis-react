'use client';

import { type PublicError } from '$lib/runtime';

export default function PageError({ error }: { error: unknown }) {
	const parsedError = error as PublicError;

	if (!parsedError || !parsedError.message) {
		console.error(error);
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4">
				<h1 className="text-red-800 font-semibold">Unknown error</h1>
				<p className="text-red-600 text-sm mt-1">An unexpected error occurred.</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-red-200 bg-red-50 p-4">
			<h1 className="text-red-800 font-semibold">{parsedError.message}</h1>
			<p className="text-red-600 text-sm mt-1">Kind: {parsedError.kind}</p>
			<p className="text-red-400 text-xs mt-2">
				{new Date(parsedError.timestamp).toLocaleString()}
			</p>
			{parsedError.traceId && (
				<p className="text-red-400 text-xs mt-1">
					Send to support if you see this: {parsedError.traceId}
				</p>
			)}
		</div>
	);
}
