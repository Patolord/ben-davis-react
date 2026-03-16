'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { SignIn, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AppPage() {
	const { isLoaded, isSignedIn, user } = useUser();
	const conferences = useQuery(api.authed.conferences.list, {});
	const createConference = useMutation(api.authed.conferences.create);
	const updateConference = useMutation(api.authed.conferences.update);
	const removeConference = useMutation(api.authed.conferences.remove);

	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<Id<'conferences'> | null>(null);
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [description, setDescription] = useState('');

	function resetForm() {
		setName('');
		setLocation('');
		setStartDate('');
		setEndDate('');
		setDescription('');
		setEditingId(null);
		setShowForm(false);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const start = new Date(startDate).getTime();
		const end = new Date(endDate).getTime();

		if (editingId) {
			await updateConference({
				id: editingId,
				name,
				location,
				startDate: start,
				endDate: end,
				description: description || undefined
			});
		} else {
			await createConference({
				name,
				location,
				startDate: start,
				endDate: end,
				description: description || undefined
			});
		}
		resetForm();
	}

	function startEdit(conf: any) {
		setEditingId(conf._id);
		setName(conf.name);
		setLocation(conf.location);
		setStartDate(new Date(conf.startDate).toISOString().split('T')[0]);
		setEndDate(new Date(conf.endDate).toISOString().split('T')[0]);
		setDescription(conf.description ?? '');
		setShowForm(true);
	}

	async function handleDelete(id: Id<'conferences'>) {
		await removeConference({ id });
	}

	function formatDate(ts: number) {
		return new Date(ts).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function conferenceStatus(start: number, end: number) {
		const now = Date.now();
		if (now < start) return 'upcoming';
		if (now > end) return 'past';
		return 'active';
	}

	if (!isLoaded) {
		return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">Loading...</div>;
	}

	if (!isSignedIn) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-stone-50">
				<SignIn />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-stone-50 font-sans text-stone-900">
			<header className="border-b border-stone-200 bg-white">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
					<h1 className="text-lg font-semibold tracking-tight">Conferences</h1>
					<div className="flex items-center gap-3">
						<Link
							href="/app/references"
							className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
						>
							References
						</Link>
						<button
							onClick={() => {
								resetForm();
								setShowForm(!showForm);
							}}
							className="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
						>
							{showForm ? 'Cancel' : '+ New'}
						</button>
						<UserButton afterSignOutUrl="/" />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-6 py-8">
				{showForm && (
					<form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-stone-200 bg-white p-5">
						<h2 className="mb-4 text-sm font-semibold tracking-wide text-stone-500 uppercase">
							{editingId ? 'Edit Conference' : 'New Conference'}
						</h2>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<label htmlFor="name" className="mb-1 block text-sm font-medium text-stone-700">Name</label>
								<input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
									placeholder="React Conf 2026"
								/>
							</div>
							<div className="sm:col-span-2">
								<label htmlFor="location" className="mb-1 block text-sm font-medium text-stone-700">Location</label>
								<input
									id="location"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									required
									className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
									placeholder="San Francisco, CA"
								/>
							</div>
							<div>
								<label htmlFor="startDate" className="mb-1 block text-sm font-medium text-stone-700">Start Date</label>
								<input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									required
									className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
								/>
							</div>
							<div>
								<label htmlFor="endDate" className="mb-1 block text-sm font-medium text-stone-700">End Date</label>
								<input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									required
									className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
								/>
							</div>
							<div className="sm:col-span-2">
								<label htmlFor="description" className="mb-1 block text-sm font-medium text-stone-700">
									Description <span className="text-stone-400">(optional)</span>
								</label>
								<textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={2}
									className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
									placeholder="Brief description..."
								></textarea>
							</div>
						</div>

						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={resetForm}
								className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="rounded-md bg-stone-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
							>
								{editingId ? 'Update' : 'Add'}
							</button>
						</div>
					</form>
				)}

				{!conferences ? (
					<p className="text-sm text-stone-400">Loading...</p>
				) : conferences.length === 0 ? (
					<div className="py-20 text-center">
						<p className="text-stone-400">No conferences yet.</p>
						<button
							onClick={() => setShowForm(true)}
							className="mt-2 text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900"
						>
							Add your first one
						</button>
					</div>
				) : (
					<ul className="space-y-3">
						{conferences.map((conf) => {
							const status = conferenceStatus(conf.startDate, conf.endDate);
							return (
								<li
									key={conf._id}
									className="group rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-sm"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<h3 className="truncate text-sm font-semibold">{conf.name}</h3>
												<span
													className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
														status === 'active'
															? 'bg-emerald-100 text-emerald-700'
															: status === 'upcoming'
																? 'bg-blue-100 text-blue-700'
																: 'bg-stone-100 text-stone-500'
													}`}
												>
													{status}
												</span>
											</div>
											<p className="mt-1 text-sm text-stone-500">
												{conf.location} &middot; {formatDate(conf.startDate)} &ndash; {formatDate(conf.endDate)}
											</p>
											{conf.description && (
												<p className="mt-1.5 text-sm text-stone-400">{conf.description}</p>
											)}
										</div>
										<div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
											<button
												onClick={() => startEdit(conf)}
												className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
												aria-label={`Edit ${conf.name}`}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
													<path d="m15 5 4 4" />
												</svg>
											</button>
											<button
												onClick={() => handleDelete(conf._id)}
												className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
												aria-label={`Delete ${conf.name}`}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M3 6h18" />
													<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
													<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
												</svg>
											</button>
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</main>
		</div>
	);
}
