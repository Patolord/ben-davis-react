import { remoteDemoQuery } from '$lib/remote/demo';
import Link from 'next/link';

export default async function Page() {
	const res = await remoteDemoQuery();

	return (
		<div className="p-8 font-sans">
			<h1 className="text-2xl font-bold mb-4 text-stone-900">Welcome to Next.js</h1>
			<p className="mb-4 text-stone-600">This has been migrated from SvelteKit.</p>
			<div className="bg-stone-50 p-4 rounded-md mb-4 font-mono text-sm border border-stone-200 overflow-x-auto">
				<pre>{JSON.stringify(res, null, 2)}</pre>
			</div>
			<Link href="/app" className="text-blue-600 hover:underline font-medium">
				Go to App Dashboard &rarr;
			</Link>
		</div>
	);
}
