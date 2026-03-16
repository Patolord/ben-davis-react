'use server';

import { ConvexPrivateService } from '$lib/services/convex';
import { Effect } from 'effect';
import { api } from '../../../convex/_generated/api';
import { ClerkService } from '$lib/services/clerk';
import { effectRunner } from '$lib/runtime';

const demoRemote = Effect.gen(function* () {
	const convex = yield* ConvexPrivateService;

	const res = yield* convex.query({
		func: api.private.demo.privateDemoQuery,
		args: {
			username: 'hello there'
		}
	});

	return res;
});

export const remoteDemoQuery = async () => {
	const res = await effectRunner(demoRemote);
	return res;
};

const demoAuthed = Effect.gen(function* () {
	const clerk = yield* ClerkService;

	const user = yield* clerk.validateAuth();

	return user;
});

export const remoteAuthedDemoQuery = async () => {
	const res = await effectRunner(demoAuthed);

	if (res.error) {
		return res;
	}

	return {
		data: {
			user: {
				id: res.data.id,
				email: res.data.primaryEmailAddress?.emailAddress ?? null
			}
		},
		error: null
	};
};
