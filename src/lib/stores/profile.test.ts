import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	checkIfFullStackToday,
	updateProfileOnComplete,
	updateProfileOnUncomplete,
	checkAndUnlockAchievements
} from './profile';
import type { Stack, Habit, Completion, Achievement, Profile } from '$lib/types';
import * as db from '$lib/services/db';
import * as sync from '$lib/services/sync';

// Mock db and sync modules
vi.mock('$lib/services/db', () => ({
	saveProfile: vi.fn(),
	saveAchievement: vi.fn(),
	addToSyncQueue: vi.fn(),
}));

vi.mock('$lib/services/sync', () => ({
	pushToSyncQueue: vi.fn(),
}));

// Helper factories
function makeStack(id: string): Stack {
	return {
		id, user_id: 'user1', name: `Stack ${id}`, trigger: 'after trigger',
		color: 'indigo', icon: '☕', sort_order: 0,
		created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z'
	};
}

function makeHabit(id: string, stackId: string): Habit {
	return {
		id, stack_id: stackId, user_id: 'user1', name: `Habit ${id}`,
		sort_order: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z'
	};
}

function makeCompletion(habitId: string, date: string): Completion {
	return {
		id: `c-${habitId}-${date}`, habit_id: habitId, user_id: 'user1',
		completed_at: date, created_at: '2024-01-01T00:00:00Z'
	};
}

function makeProfile(overrides: Partial<Profile> = {}): Profile {
	return {
		id: 'user1', xp: 100, level: 2, streak_days: 3, longest_streak: 5,
		total_completions: 20, theme: 'default',
		created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

describe('checkIfFullStackToday', () => {
	it('returns false when there are no stacks', () => {
		expect(checkIfFullStackToday([], [], [])).toBe(false);
	});

	it('returns false when a stack has no habits', () => {
		const stack = makeStack('s1');
		expect(checkIfFullStackToday([stack], [], [])).toBe(false);
	});

	it('returns false when habits exist but none completed today', () => {
		const stack = makeStack('s1');
		const habit = makeHabit('h1', 's1');
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const completion = makeCompletion('h1', yesterday.toISOString().slice(0, 10));

		expect(checkIfFullStackToday([stack], [habit], [completion])).toBe(false);
	});

	it('returns true when all habits in a stack are completed today', () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const c1 = makeCompletion('h1', today);
		const c2 = makeCompletion('h2', today);

		expect(checkIfFullStackToday([stack], [h1, h2], [c1, c2])).toBe(true);
	});

	it('returns false when only some habits in a stack are completed today', () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const c1 = makeCompletion('h1', today);

		expect(checkIfFullStackToday([stack], [h1, h2], [c1])).toBe(false);
	});

	it('returns true if any stack is fully complete, even if others are not', () => {
		const s1 = makeStack('s1');
		const s2 = makeStack('s2');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's2');
		const today = new Date().toISOString().slice(0, 10);
		const c2 = makeCompletion('h2', today);

		expect(checkIfFullStackToday([s1, s2], [h1, h2], [c2])).toBe(true);
	});

	it('ignores completions from other habits not in the stack', () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const wrongCompletion = makeCompletion('h_other', today);

		expect(checkIfFullStackToday([stack], [h1], [wrongCompletion])).toBe(false);
	});

	it('handles multiple stacks correctly', () => {
		const s1 = makeStack('s1');
		const s2 = makeStack('s2');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's2');
		const today = new Date().toISOString().slice(0, 10);
		const c1 = makeCompletion('h1', today);
		const c2 = makeCompletion('h2', today);

		expect(checkIfFullStackToday([s1, s2], [h1, h2], [c1, c2])).toBe(true);
	});
});

describe('updateProfileOnComplete', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('increments total_completions', async () => {
		const profile = makeProfile({ total_completions: 10 });
		const result = await updateProfileOnComplete(profile, [], [], []);
		expect(result.total_completions).toBe(11);
	});

	it('adds 10 XP base per completion', async () => {
		const profile = makeProfile({ xp: 100 });
		const result = await updateProfileOnComplete(profile, [], [], []);
		expect(result.xp).toBe(110);
	});

	it('saves profile to db', async () => {
		const profile = makeProfile();
		await updateProfileOnComplete(profile, [], [], []);
		expect(db.saveProfile).toHaveBeenCalled();
	});

	it('pushes to sync queue', async () => {
		const profile = makeProfile();
		await updateProfileOnComplete(profile, [], [], []);
		expect(sync.pushToSyncQueue).toHaveBeenCalled();
	});

	it('updates longest_streak when current streak exceeds it', async () => {
		const today = new Date().toISOString().slice(0, 10);
		const d1 = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().slice(0, 10);
		const d2 = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
		const completions = [
			makeCompletion('h1', d1),
			makeCompletion('h1', d2),
			makeCompletion('h1', today)
		];
		const profile = makeProfile({ longest_streak: 2, streak_days: 3 });
		const result = await updateProfileOnComplete(profile, completions, [], []);
		expect(result.longest_streak).toBeGreaterThanOrEqual(3);
	});

	it('awards stack bonus when stack is fully complete', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const completions = [makeCompletion('h1', today), makeCompletion('h2', today)];
		const profile = makeProfile({ xp: 100 });
		const result = await updateProfileOnComplete(profile, completions, [stack], [h1, h2]);
		// 10 base + 25 stack bonus = 35
		expect(result.xp).toBe(135);
	});

	it('does not award stack bonus when stack is not complete', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const completions = [makeCompletion('h1', today)]; // only 1 of 2 habits
		const profile = makeProfile({ xp: 100 });
		const result = await updateProfileOnComplete(profile, completions, [stack], [h1, h2]);
		// 10 base + 5 streak (1-day streak from today) = 15, no stack bonus
		expect(result.xp).toBe(115);
	});

	it('awards streak bonus on first completion of the day', async () => {
		const today = new Date().toISOString().slice(0, 10);
		const completions = [makeCompletion('h1', today)];
		const profile = makeProfile({ xp: 100, streak_days: 3 });
		const result = await updateProfileOnComplete(profile, completions, [], []);
		// 10 base + min(1*5, 50) streak (streak is 1 since only today) = 15
		expect(result.xp).toBe(115);
	});

	it('does not award streak bonus on second completion of the day', async () => {
		const today = new Date().toISOString().slice(0, 10);
		const completions = [makeCompletion('h1', today), makeCompletion('h2', today)];
		const profile = makeProfile({ xp: 100, streak_days: 3 });
		// Second completion: no streak bonus, just base 10
		const result = await updateProfileOnComplete(profile, completions, [], []);
		// Only 10 base, no streak bonus (not first of day)
		expect(result.xp).toBe(110);
	});
});

describe('updateProfileOnUncomplete', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('decrements total_completions', async () => {
		const profile = makeProfile({ total_completions: 10 });
		const result = await updateProfileOnUncomplete(profile, [], [], []);
		expect(result.total_completions).toBe(9);
	});

	it('deducts 10 XP base with no bonuses', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const remaining = [makeCompletion('h1', today)]; // stack still complete
		const profile = makeProfile({ xp: 100, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1]);
		// -10 base only (stack still complete, still has today completion)
		expect(result.xp).toBe(90);
	});

	it('does not go below 0 XP', async () => {
		const profile = makeProfile({ xp: 5 });
		const result = await updateProfileOnUncomplete(profile, [], [], []);
		expect(result.xp).toBe(0);
	});

	it('does not go below 0 completions', async () => {
		const profile = makeProfile({ total_completions: 0 });
		const result = await updateProfileOnUncomplete(profile, [], [], []);
		expect(result.total_completions).toBe(0);
	});

	it('recalculates level from XP', async () => {
		// level 1 threshold is 50 XP
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const remaining = [makeCompletion('h1', today)]; // stack still complete
		const profile = makeProfile({ xp: 60, level: 1, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1]);
		expect(result.xp).toBe(50);
		expect(result.level).toBe(1);
	});

	it('can derank if XP drops below threshold', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const today = new Date().toISOString().slice(0, 10);
		const remaining = [makeCompletion('h1', today)]; // stack still complete
		const profile = makeProfile({ xp: 55, level: 1, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1]);
		expect(result.xp).toBe(45);
		expect(result.level).toBe(0);
	});

	it('saves profile to db', async () => {
		const profile = makeProfile();
		await updateProfileOnUncomplete(profile, [], [], []);
		expect(db.saveProfile).toHaveBeenCalled();
	});

	it('pushes to sync queue', async () => {
		const profile = makeProfile();
		await updateProfileOnUncomplete(profile, [], [], []);
		expect(sync.pushToSyncQueue).toHaveBeenCalled();
	});

	it('deducts stack bonus when uncompleting breaks a full stack', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const today = new Date().toISOString().slice(0, 10);
		// After uncompleting h2, only h1 remains → stack not complete
		const remaining = [makeCompletion('h1', today)];
		const profile = makeProfile({ xp: 145 }); // was awarded 10 base + 25 stack = 35
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1, h2]);
		// 145 - 10 base - 25 stack = 110
		expect(result.xp).toBe(110);
	});

	it('does not deduct stack bonus when stack is still complete', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const h3 = makeHabit('h3', 's1');
		const today = new Date().toISOString().slice(0, 10);
		// After uncompleting h3, h1 and h2 remain → stack still complete (2 of 2 in another stack? No, all 3 in same stack)
		// Actually with 3 habits, only 2 complete means stack is NOT fully complete
		// Let's use 2 stacks: uncomplete one in stack2, stack1 still complete
		const stack2 = makeStack('s2');
		const h2b = makeHabit('h2', 's2');
		const remaining = [makeCompletion('h1', today)];
		const profile = makeProfile({ xp: 120 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1]);
		// Only base 10 deducted, no stack bonus deducted (stack wasn't fully complete anyway)
		expect(result.xp).toBe(110);
	});

	it('deducts streak bonus when last completion of the day is removed', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		// Profile had streak_days=3, so streak bonus of 15 was awarded on first completion
		const profile = makeProfile({ xp: 125, streak_days: 3 });
		// No remaining completions today → stack not complete, streak bonus deducted
		const result = await updateProfileOnUncomplete(profile, [], [stack], [h1]);
		// -10 base - 25 stack (not full) - 15 streak (no completions today) = -50
		// 125 - 50 = 75
		expect(result.xp).toBe(75);
	});

	it('XP farming exploit: toggling on/off does not net positive', async () => {
		// Simulate: complete (gain 10), uncomplete (lose 10) → net 0
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const today = new Date().toISOString().slice(0, 10);

		let profile = makeProfile({ xp: 100, streak_days: 0, longest_streak: 0, total_completions: 0 });

		// Complete
		const completion = makeCompletion('h1', today);
		profile = await updateProfileOnComplete(profile, [completion], [stack], [h1]);
		const xpAfterComplete = profile.xp;

		// Uncomplete
		profile = await updateProfileOnUncomplete(profile, [], [stack], [h1]);
		const xpAfterUncomplete = profile.xp;

		// Should end up at or below where we started (100), not above
		expect(xpAfterUncomplete).toBeLessThanOrEqual(100);
		expect(xpAfterComplete).toBeGreaterThan(100); // XP did go up
	});

	it('XP farming exploit: stack bonus toggle does not net positive', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const today = new Date().toISOString().slice(0, 10);

		let profile = makeProfile({ xp: 100, streak_days: 0, longest_streak: 0, total_completions: 0 });

		// Complete both habits → full stack → bonus
		const c1 = makeCompletion('h1', today);
		const c2 = makeCompletion('h2', today);

		profile = await updateProfileOnComplete(profile, [c1], [stack], [h1, h2]);
		profile = await updateProfileOnComplete(profile, [c1, c2], [stack], [h1, h2]);
		const xpAfterComplete = profile.xp;

		// Uncomplete h2 → stack no longer complete → should lose stack bonus
		profile = await updateProfileOnUncomplete(profile, [c1], [stack], [h1, h2]);

		// XP should be: 100 + 10 (first completion) - nothing = should be <= initial + just one completion
		expect(profile.xp).toBeLessThanOrEqual(xpAfterComplete - 25); // lost the stack bonus
	});
});

describe('checkAndUnlockAchievements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns empty for a new user with no activity', async () => {
		const profile = makeProfile({ streak_days: 0, total_completions: 0, level: 0, longest_streak: 0 });
		const result = await checkAndUnlockAchievements(profile, [], [], 'user1', false);
		expect(result.newAchievements).toHaveLength(0);
		expect(result.badgeKeys).toHaveLength(0);
	});

	it('unlocks first_habit and first_stack', async () => {
		const profile = makeProfile({ total_completions: 1, streak_days: 0, level: 0 });
		const stacks = [makeStack('s1')];
		const result = await checkAndUnlockAchievements(profile, [], stacks, 'user1', false);
		expect(result.badgeKeys).toContain('first_habit');
		expect(result.badgeKeys).toContain('first_stack');
	});

	it('does not re-unlock already earned badges', async () => {
		const profile = makeProfile({ total_completions: 1, streak_days: 0, level: 0 });
		const existingAchievement: Achievement = {
			id: 'a1', user_id: 'user1', badge_key: 'first_habit', unlocked_at: '2024-01-01T00:00:00Z'
		};
		const stacks = [makeStack('s1')];
		const result = await checkAndUnlockAchievements(profile, [existingAchievement], stacks, 'user1', false);
		expect(result.badgeKeys).not.toContain('first_habit');
		expect(result.badgeKeys).toContain('first_stack'); // still unlocks this one
	});

	it('unlocks streak badges', async () => {
		const profile = makeProfile({ total_completions: 10, streak_days: 7, level: 1, longest_streak: 7 });
		const result = await checkAndUnlockAchievements(profile, [], [], 'user1', false);
		expect(result.badgeKeys).toContain('streak_3');
		expect(result.badgeKeys).toContain('streak_7');
	});

	it('saves new achievements to db', async () => {
		const profile = makeProfile({ total_completions: 1, streak_days: 0, level: 0 });
		const stacks = [makeStack('s1')];
		await checkAndUnlockAchievements(profile, [], stacks, 'user1', false);
		expect(db.saveAchievement).toHaveBeenCalled();
	});

	it('pushes new achievements to sync queue', async () => {
		const profile = makeProfile({ total_completions: 1, streak_days: 0, level: 0 });
		const stacks = [makeStack('s1')];
		await checkAndUnlockAchievements(profile, [], stacks, 'user1', false);
		expect(sync.pushToSyncQueue).toHaveBeenCalled();
	});
});