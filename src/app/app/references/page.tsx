import { remoteAuthedDemoQuery, remoteDemoQuery } from '@/lib/remote/demo';
import ReferencesClient from './ReferencesClient';

export default async function ReferencesPage() {
	const demoRes = await remoteDemoQuery();
	const authedRes = await remoteAuthedDemoQuery();

	return (
		<ReferencesClient 
			initialDemo={demoRes} 
			initialAuthed={authedRes} 
		/>
	);
}
