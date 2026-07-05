// IndexedDB service for offline-first data storage
// Uses idb library for clean async API
// Local-only mode — no sync queue needed

import { openDB, type IDBPDatabase } from 'idb';
import type { Stack, Habit, Completion, Achievement, Profile } from '$lib/types';

const DB_NAME = 'stackr';
const DB_VERSION = 3;

interface StackrDB {
	stacks: Stack;
	habits: Habit;
	completions: Completion;
	achievements: Achievement;
	profile: Profile;
}

let dbInstance: IDBPDatabase<StackrDB> | null = null;

async function getDB(): Promise<IDBPDatabase<StackrDB>> {
	if (dbInstance) return dbInstance;

	dbInstance = await openDB<StackrDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion, _newVersion, transaction) {
			if (oldVersion < 1) {
				const stackStore = db.createObjectStore('stacks', { keyPath: 'id' });
				stackStore.createIndex('user_id', 'user_id');
				stackStore.createIndex('sort_order', 'sort_order');

				const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
				habitStore.createIndex('stack_id', 'stack_id');
				habitStore.createIndex('user_id', 'user_id');

				const completionStore = db.createObjectStore('completions', { keyPath: 'id' });
				completionStore.createIndex('habit_id', 'habit_id');
				completionStore.createIndex('completed_at', 'completed_at');
				completionStore.createIndex('user_id', 'user_id');
				completionStore.createIndex('habit_date', ['habit_id', 'completed_at'], { unique: true });

				db.createObjectStore('profile', { keyPath: 'id' });

				// Legacy sync queue store (kept for DB version compatibility)
				if (!db.objectStoreNames.contains('syncQueue')) {
					const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
					syncStore.createIndex('table', 'table');
				}
			}

			if (oldVersion < 2) {
				if (!db.objectStoreNames.contains('achievements')) {
					db.createObjectStore('achievements', { keyPath: 'id' });
				}
			}

			// v3: add user_id index to achievements (was missing in v2)
			if (oldVersion > 0 && oldVersion < 3 && transaction) {
				const store = transaction.objectStore('achievements');
				if (!store.indexNames.contains('user_id')) {
					store.createIndex('user_id', 'user_id');
				}
			}
		},
	});

	return dbInstance;
}

// Reset DB (for sign out / local reset)
export async function resetDB(): Promise<void> {
	dbInstance = null;
	await deleteDB();
}

async function deleteDB(): Promise<void> {
	try {
		const dbs = await indexedDB.databases();
		const exists = dbs.some(db => db.name === DB_NAME);
		if (exists) {
			await new Promise<void>((resolve, reject) => {
				const request = indexedDB.deleteDatabase(DB_NAME);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		}
	} catch {
		// Fallback: try direct delete
		indexedDB.deleteDatabase(DB_NAME);
	}
}

// ============ MIGRATION ============

// Migrate data from an old user ID (e.g. Supabase auth user) to the local user ID.
// Called on first launch after removing auth — finds any orphaned data and re-keys it.
export async function migrateFromOldUserId(newUserId: string): Promise<boolean> {
	const database = await getDB();

	// Check if new user already has data
	const existingStacks = await database.getAllFromIndex('stacks', 'user_id', newUserId);
	if (existingStacks.length > 0) return false; // Already has data, skip migration

	// Find any existing profile (there should be at most one)
	const allProfiles: Profile[] = await database.getAll('profile');
	const oldProfile = allProfiles.find(p => p.id !== newUserId);

	if (!oldProfile) {
		// No existing data at all — fresh start
		return false;
	}

	const oldUserId = oldProfile.id;

	// Re-key profile
	const newProfile: Profile = { ...oldProfile, id: newUserId };
	await database.put('profile', newProfile);
	await database.delete('profile', oldUserId);

	// Migrate stacks
	const oldStacks: Stack[] = await database.getAllFromIndex('stacks', 'user_id', oldUserId);
	for (const stack of oldStacks) {
		stack.user_id = newUserId;
		await database.put('stacks', stack);
	}

	// Migrate habits
	const oldHabits: Habit[] = await database.getAllFromIndex('habits', 'user_id', oldUserId);
	for (const habit of oldHabits) {
		habit.user_id = newUserId;
		await database.put('habits', habit);
	}

	// Migrate completions
	const oldCompletions: Completion[] = await database.getAllFromIndex('completions', 'user_id', oldUserId);
	for (const completion of oldCompletions) {
		completion.user_id = newUserId;
		await database.put('completions', completion);
	}

	// Migrate achievements — use getAll() since user_id index may not exist yet on v2 DBs
	const allAchievements: Achievement[] = await database.getAll('achievements');
	const oldAchievements = allAchievements.filter(a => a.user_id === oldUserId);
	for (const achievement of oldAchievements) {
		achievement.user_id = newUserId;
		await database.put('achievements', achievement);
	}

	return true;
}

// ============ STACK OPERATIONS ============

export async function getAllStacks(userId: string): Promise<Stack[]> {
	const db = await getDB();
	return db.getAllFromIndex('stacks', 'user_id', userId);
}

export async function getStack(id: string): Promise<Stack | undefined> {
	const db = await getDB();
	return db.get('stacks', id);
}

export async function saveStack(stack: Stack): Promise<void> {
	const db = await getDB();
	await db.put('stacks', stack);
}

export async function deleteStack(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('stacks', id);
}

// ============ HABIT OPERATIONS ============

export async function getHabitsByStack(stackId: string): Promise<Habit[]> {
	const db = await getDB();
	return db.getAllFromIndex('habits', 'stack_id', stackId);
}

export async function getHabit(id: string): Promise<Habit | undefined> {
	const db = await getDB();
	return db.get('habits', id);
}

export async function saveHabit(habit: Habit): Promise<void> {
	const db = await getDB();
	await db.put('habits', habit);
}

export async function getAllHabitsByUser(userId: string): Promise<Habit[]> {
	const db = await getDB();
	return db.getAllFromIndex('habits', 'user_id', userId);
}

export async function deleteHabit(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('habits', id);
}

// ============ COMPLETION OPERATIONS ============

export async function getCompletionsByHabit(habitId: string): Promise<Completion[]> {
	const db = await getDB();
	return db.getAllFromIndex('completions', 'habit_id', habitId);
}

export async function getCompletionsByDate(userId: string, date: string): Promise<Completion[]> {
	const db = await getDB();
	return db.getAllFromIndex('completions', 'completed_at', date);
}

export async function getCompletionsByUser(userId: string): Promise<Completion[]> {
	const db = await getDB();
	return db.getAllFromIndex('completions', 'user_id', userId);
}

export async function saveCompletion(completion: Completion): Promise<void> {
	const db = await getDB();
	await db.put('completions', completion);
}

export async function deleteCompletion(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('completions', id);
}

export async function getCompletionForHabitDate(habitId: string, date: string): Promise<Completion | undefined> {
	const db = await getDB();
	return db.getFromIndex('completions', 'habit_date', [habitId, date]);
}

// ============ PROFILE OPERATIONS ============

export async function getProfile(userId: string): Promise<Profile | undefined> {
	const db = await getDB();
	return db.get('profile', userId);
}

export async function saveProfile(profile: Profile): Promise<void> {
	const db = await getDB();
	await db.put('profile', profile);
}

// ============ ACHIEVEMENT OPERATIONS ============

export async function getAchievementsByUser(userId: string): Promise<Achievement[]> {
	const db = await getDB();
	// Use getAll + filter since user_id index may not exist on v2 DBs
	const all: Achievement[] = await db.getAll('achievements');
	return all.filter(a => a.user_id === userId);
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
	const db = await getDB();
	await db.put('achievements', achievement);
}