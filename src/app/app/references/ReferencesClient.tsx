'use client';

import { useState } from 'react';
import { useQuery, useConvexClient, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import PageError from '@/lib/components/PageError';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function ReferencesClient({ 
	initialDemo, 
	initialAuthed 
}: { 
	initialDemo: any; 
	initialAuthed: any; 
}) {
	const { isSignedIn } = useUser();
	const client = useConvexClient();
	const createConference = useMutation(api.authed.conferences.create);

	// -------------------------------------------------------
	// 1. Client-side authed Convex query (real-time reactive)
	// -------------------------------------------------------
	const authedDemo = useQuery(api.authed.demo.authedDemoQuery, {});

	// -------------------------------------------------------
	// 2. Client-side authed Convex mutation
	// -------------------------------------------------------
	const [mutationResult, setMutationResult] = useState<string | null>(null);
	const [mutationLoading, setMutationLoading] = useState(false);

	async function runClientMutation() {
		setMutationLoading(true);
		setMutationResult(null);
		try {
			const id = await createConference({
				name: `Test Conf ${Date.now()}`,
				location: 'Localhost',
				startDate: Date.now(),
				endDate: Date.now() + 86400000,
				description: 'Created from references page'
			});
			setMutationResult(`Created conference: ${id}`);
		} catch (err) {
			setMutationResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setMutationLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-stone-50 font-sans text-stone-900">
			<header className="border-b border-stone-200 bg-white">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<Link href="/app" className="text-sm text-stone-400 transition-colors hover:text-stone-600">
							&larr; Back
						</Link>
						<h1 className="text-lg font-semibold tracking-tight">Pattern References</h1>
					</div>
					{isSignedIn && <UserButton afterSignOutUrl="/" />}
				</div>
			</header>

			<main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
				{/* Section 1: Client authed query */}
				<section className="rounded-lg border border-stone-200 bg-white p-5">
					<h2 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
						1. Client Authed Query
					</h2>
					<p className="mt-1 text-sm text-stone-500">
						Real-time reactive query via <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">useQuery(api.authed.demo.authedDemoQuery, {'{}'})</code>
					</p>
					<div className="mt-3 rounded-md bg-stone-50 p-3 overflow-x-auto">
						{authedDemo === undefined ? (
							<p className="text-sm text-stone-400">Loading...</p>
						) : authedDemo ? (
							<pre className="text-sm text-stone-700">{JSON.stringify(authedDemo, null, 2)}</pre>
						) : (
							<p className="text-sm text-stone-400">No data (are you signed in?)</p>
						)}
					</div>
					<details className="mt-3">
						<summary className="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600">How it works</summary>
						<div className="mt-2 space-y-1 text-xs text-stone-500">
							<p>
								<code className="rounded bg-stone-100 px-1 py-0.5">useQuery</code> from 
								<code className="rounded bg-stone-100 px-1 py-0.5">convex/react</code> subscribes to a Convex query over WebSocket.
							</p>
							<p>
								Auth is handled via <code className="rounded bg-stone-100 px-1 py-0.5">ConvexProviderWithClerk</code>.
							</p>
							<p>
								The query handler uses <code className="rounded bg-stone-100 px-1 py-0.5">authedQuery</code> which calls 
								<code className="rounded bg-stone-100 px-1 py-0.5">ctx.auth.getUserIdentity()</code> and throws if null.
							</p>
						</div>
					</details>
				</section>

				{/* Section 2: Client authed mutation */}
				<section className="rounded-lg border border-stone-200 bg-white p-5">
					<h2 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
						2. Client Authed Mutation
					</h2>
					<p className="mt-1 text-sm text-stone-500">
						Imperative mutation via <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">useMutation()</code>
					</p>
					<div className="mt-3 flex items-center gap-3">
						<button
							onClick={runClientMutation}
							disabled={mutationLoading}
							className="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
						>
							{mutationLoading ? 'Creating...' : 'Create Test Conference'}
						</button>
						{mutationResult && (
							<p className="text-sm text-stone-500">{mutationResult}</p>
						)}
					</div>
					<details className="mt-3">
						<summary className="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600">How it works</summary>
						<div className="mt-2 space-y-1 text-xs text-stone-500">
							<p>
								<code className="rounded bg-stone-100 px-1 py-0.5">useMutation()</code> returns a function to call the mutation.
							</p>
							<p>
								Auth is handled identically to queries.
							</p>
						</div>
					</details>
				</section>

				{/* Section 3: Server remote function (private backend query) */}
				<section className="rounded-lg border border-stone-200 bg-white p-5">
					<h2 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
						3. Private Backend Query (Server Action)
					</h2>
					<p className="mt-1 text-sm text-stone-500">
						Server-side Convex call via Effect &rarr; <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">ConvexPrivateService</code>
					</p>
					<div className="mt-3 rounded-md bg-stone-50 p-3 overflow-x-auto">
						{initialDemo.error ? (
							<PageError error={initialDemo.error} />
						) : (
							<pre className="text-sm text-stone-700">{JSON.stringify(initialDemo.data, null, 2)}</pre>
						)}
					</div>
					<details className="mt-3">
						<summary className="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600">How it works</summary>
						<div className="mt-2 space-y-1 text-xs text-stone-500">
							<p>
								Defined in <code className="rounded bg-stone-100 px-1 py-0.5">@/lib/remote/demo.ts</code> 
								as a Next.js Server Action with the <code className="rounded bg-stone-100 px-1 py-0.5">&apos;use server&apos;</code> directive.
							</p>
							<p>
								Uses an Effect generator to call <code className="rounded bg-stone-100 px-1 py-0.5">ConvexPrivateService.query()</code> 
								which uses <code className="rounded bg-stone-100 px-1 py-0.5">ConvexHttpClient</code> + API key auth.
							</p>
						</div>
					</details>
				</section>

				{/* Section 4: Server authed remote function */}
				<section className="rounded-lg border border-stone-200 bg-white p-5">
					<h2 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
						4. Authed Server Action (Server-side Clerk Validation)
					</h2>
					<p className="mt-1 text-sm text-stone-500">
						Server-side auth via Effect &rarr; <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">ClerkService.validateAuth()</code>
					</p>
					<div className="mt-3 rounded-md bg-stone-50 p-3 overflow-x-auto">
						{initialAuthed.error ? (
							<PageError error={initialAuthed.error} />
						) : (
							<pre className="text-sm text-stone-700">{JSON.stringify(initialAuthed.data, null, 2)}</pre>
						)}
					</div>
					<details className="mt-3">
						<summary className="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600">How it works</summary>
						<div className="mt-2 space-y-1 text-xs text-stone-500">
							<p>
								Uses Clerk&apos;s <code className="rounded bg-stone-100 px-1 py-0.5">auth()</code> and 
								<code className="rounded bg-stone-100 px-1 py-0.5">currentUser()</code> helpers in a server action.
							</p>
						</div>
					</details>
				</section>

				{/* Section 5: Error handling patterns */}
				<section className="rounded-lg border border-stone-200 bg-white p-5">
					<h2 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
						5. Error Handling Patterns
					</h2>
					<p className="mt-1 text-sm text-stone-500">How errors flow through the stack.</p>
					<div className="mt-3 space-y-3 text-xs text-stone-600">
						<div className="rounded-md border border-stone-200 p-3">
							<h3 className="font-semibold text-stone-700">Client-side (Convex)</h3>
							<p className="mt-1">
								Convex hooks throw standard JS errors. Wrap them in try/catch.
							</p>
						</div>
						<div className="rounded-md border border-stone-200 p-3">
							<h3 className="font-semibold text-stone-700">Server-side (Effect + Server Actions)</h3>
							<p className="mt-1">
								<code className="rounded bg-stone-100 px-1 py-0.5">effectRunner</code> catches failures 
								and returns a structured <code className="rounded bg-stone-100 px-1 py-0.5">{`{ data, error }`}</code> object.
							</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
