// Svelte stores for app state management
// Uses runes ($state) for Svelte 5 reactivity
// Local-only mode — all data in IndexedDB, no auth/sync

import type { Stack, Habit, Completion, Achievement, Profile } from '$lib/types';
import * as db from '$lib/services/db';
import { calculateStreak } from '$lib/utils/gamification';
import { generateId, today } from '$lib/utils/helpers';
import {
	updateProfileOnComplete as doUpdateProfileComplete,
	updateProfileOnUncomplete as doUpdateProfileUncomplete,
	checkAndUnlockAchievements as doCheckAchievements,
	checkIfFullStackToday
} from './profile';

const LOCAL_USER_ID_KEY = 'stackr_local_user_id';

// App state using Svelte 5 runes
let stacks = $state<Stack[]>([]);
let habits = $state<Habit[]>([]);
let completions = $state<Completion[]>([]);
let achievements = $state<Achievement[]>([]);
let profile = $state<Profile | null>(null);
let userId = $state<string | null>(null);
let isLoading = $state(true);

export function getAppState() {
	return {
		get stacks() { return stacks; },
		get habits() { return habits; },
		get completions() { return completions; },
		get achievements() { return achievements; },
		get profile() { return profile; },
		get userId() { return userId; },
		get isLoading() { return isLoading; },
	};
}

function getLocalUserId(): string {
	let id = localStorage.getItem(LOCAL_USER_ID_KEY);
	if (!id) {
		id = 'local_' + generateId();
		localStorage.setItem(LOCAL_USER_ID_KEY, id);
	}
	return id;
}

// Initialize app state — always local mode
// Migrates any existing data from old auth user IDs to local user ID
export async function initializeState(): Promise<void> {
	const uid = getLocalUserId();
	userId = uid;
	isLoading = true;

	try {
		// One-time migration: re-key any data from Supabase auth user to local user
		await db.migrateFromOldUserId(uid);

		const [dbStacks, dbHabits, dbCompletions, dbProfile, dbAchievements] = await Promise.all([
			db.getAllStacks(uid),
			db.getAllHabitsByUser(uid),
			db.getCompletionsByUser(uid),
			db.getProfile(uid),
			db.getAchievementsByUser(uid)
		]);

		stacks = dbStacks;
		habits = dbHabits;
		completions = dbCompletions;
		achievements = dbAchievements;

		if (dbProfile) {
			profile = dbProfile;
		} else {
			const newProfile: Profile = {
				id: uid, xp: 0, level: 0, streak_days: 0,
				longest_streak: 0, total_completions: 0, theme: 'default',
				created_at: new Date().toISOString(), updated_at: new Date().toISOString()
			};
			await db.saveProfile(newProfile);
			profile = newProfile;
		}
	} finally {
		isLoading = false;
	}
}

export function resetState(): void {
	localStorage.removeItem(LOCAL_USER_ID_KEY);
	stacks = [];
	habits = [];
	completions = [];
	achievements = [];
	profile = null;
	userId = null;
	isLoading = true;
	db.resetDB();
}

// ============ STACK OPERATIONS ============

export async function createStack(name: string, trigger: string, color: string, icon: string): Promise<Stack> {
	if (!userId) throw new Error('Not initialized');
	const stack: Stack = {
		id: generateId(), user_id: userId, name, trigger, color, icon,
		sort_order: stacks.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
	};
	await db.saveStack(stack);
	stacks = [...stacks, stack];
	return stack;
}

export async function updateStack(stack: Stack): Promise<void> {
	const updated = { ...stack, updated_at: new Date().toISOString() };
	await db.saveStack(updated);
	stacks = stacks.map(s => s.id === updated.id ? updated : s);
}

export async function removeStack(id: string): Promise<void> {
	await db.deleteStack(id);
	stacks = stacks.filter(s => s.id !== id);
	habits = habits.filter(h => h.stack_id !== id);
}

// ============ REORDER OPERATIONS ============

export async function reorderStacks(stackIds: string[]): Promise<void> {
	if (!userId) throw new Error('Not initialized');
	const reordered = stackIds
		.map((id, index) => {
			const stack = stacks.find(s => s.id === id);
			if (!stack) return null;
			return { ...stack, sort_order: index };
		})
		.filter((s): s is Stack => s !== null);
	for (const stack of reordered) {
		await db.saveStack(stack);
	}
	stacks = reordered;
}

export async function reorderHabits(stackId: string, habitIds: string[]): Promise<void> {
	if (!userId) throw new Error('Not initialized');
	const reordered = habitIds
		.map((id, index) => {
			const habit = habits.find(h => h.id === id && h.stack_id === stackId);
			if (!habit) return null;
			return { ...habit, sort_order: index };
		})
		.filter((h): h is Habit => h !== null);
	for (const habit of reordered) {
		await db.saveHabit(habit);
	}
	habits = habits.map(h => {
		const updated = reordered.find(r => r.id === h.id);
		return updated ?? h;
	});
}

// ============ HABIT OPERATIONS ============

export async function createHabit(stackId: string, name: string, description?: string): Promise<Habit> {
	if (!userId) throw new Error('Not initialized');
	const stackHabits = habits.filter(h => h.stack_id === stackId);
	const habit: Habit = {
		id: generateId(), stack_id: stackId, user_id: userId, name, description,
		sort_order: stackHabits.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
	};
	await db.saveHabit(habit);
	habits = [...habits, habit];
	return habit;
}

export async function updateHabit(habit: Habit): Promise<void> {
	const updated = { ...habit, updated_at: new Date().toISOString() };
	await db.saveHabit(updated);
	habits = habits.map(h => h.id === updated.id ? updated : h);
}

export async function removeHabit(id: string): Promise<void> {
	await db.deleteHabit(id);
	habits = habits.filter(h => h.id !== id);
	completions = completions.filter(c => c.habit_id !== id);
}

// ============ COMPLETION OPERATIONS ============

export async function toggleCompletion(habitId: string, date?: string): Promise<boolean> {
	if (!userId) throw new Error('Not initialized');

	const completedDate = date ?? today();
	const existing = completions.find(c => c.habit_id === habitId && c.completed_at === completedDate);

	if (existing) {
		await db.deleteCompletion(existing.id);
		completions = completions.filter(c => c.id !== existing.id);
		if (profile) {
			profile = await doUpdateProfileUncomplete(
				profile, completions, stacks, habits, habitId, completedDate
			);
		}
		return false;
	}

	const completion: Completion = {
		id: generateId(), habit_id: habitId, user_id: userId,
		completed_at: completedDate, created_at: new Date().toISOString()
	};
	await db.saveCompletion(completion);
	completions = [...completions, completion];

	if (profile) {
		profile = await doUpdateProfileComplete(
			profile, completions, stacks, habits, habitId, completedDate
		);
		// Check for new achievements
		const result = await doCheckAchievements(
			profile, achievements, stacks, userId!, checkIfFullStackToday(stacks, habits, completions)
		);
		if (result.newAchievements.length > 0) {
			achievements = [...achievements, ...result.newAchievements];
		}
	}

	return true;
}

export async function checkAndUnlockAchievements(): Promise<string[]> {
	if (!profile || !userId) return [];
	const result = await doCheckAchievements(
		profile, achievements, stacks, userId, checkIfFullStackToday(stacks, habits, completions)
	);
	if (result.newAchievements.length > 0) {
		achievements = [...achievements, ...result.newAchievements];
	}
	return result.badgeKeys;
}