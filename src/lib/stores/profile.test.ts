import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	checkIfFullStackToday,
	updateProfileOnComplete,
	updateProfileOnUncomplete,
	checkAndUnlockAchievements
} from './profile';
import type { Stack, Habit, Completion, Achievement, Profile } from '$lib/types';
import * as db from '$lib/services/db';
import { today, daysAgo } from '$lib/utils/helpers';

// Mock db module
vi.mock('$lib/services/db', () => ({
	saveProfile: vi.fn(),
	saveAchievement: vi.fn(),
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
		const completion = makeCompletion('h1', daysAgo(1));

		expect(checkIfFullStackToday([stack], [habit], [completion])).toBe(false);
	});

	it('returns true when all habits in a stack are completed today', () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const todayStr = today();
		const c1 = makeCompletion('h1', todayStr);
		const c2 = makeCompletion('h2', todayStr);

		expect(checkIfFullStackToday([stack], [h1, h2], [c1, c2])).toBe(true);
	});

	it('returns false when only some habits in a stack are completed today', () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const todayStr = today();
		const c1 = makeCompletion('h1', todayStr);

		expect(checkIfFullStackToday([stack], [h1, h2], [c1])).toBe(false);
	});

	it('returns true if any stack is fully complete, even if others are not', () => {
		const s1 = makeStack('s1');
		const s2 = makeStack('s2');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's2');
		const todayStr = today();
		const c2 = makeCompletion('h2', todayStr);

		expect(checkIfFullStackToday([s1, s2], [h1, h2], [c2])).toBe(true);
	});

	it('ignores completions from other habits not in the stack', () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const todayStr = today();
		const wrongCompletion = makeCompletion('h_other', todayStr);

		expect(checkIfFullStackToday([stack], [h1], [wrongCompletion])).toBe(false);
	});

	it('handles multiple stacks correctly', () => {
		const s1 = makeStack('s1');
		const s2 = makeStack('s2');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's2');
		const todayStr = today();
		const c1 = makeCompletion('h1', todayStr);
		const c2 = makeCompletion('h2', todayStr);

		expect(checkIfFullStackToday([s1, s2], [h1, h2], [c1, c2])).toBe(true);
	});
});

describe('updateProfileOnComplete', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('increments total_completions', async () => {
		const profile = makeProfile({ total_completions: 10 });
		const result = await updateProfileOnComplete(profile, [], [], [], 'h_none');
		expect(result.total_completions).toBe(11);
	});

	it('adds 10 XP base per completion', async () => {
		const profile = makeProfile({ xp: 100 });
		const result = await updateProfileOnComplete(profile, [], [], [], 'h_none');
		expect(result.xp).toBe(110);
	});

	it('saves profile to db', async () => {
		const profile = makeProfile();
		await updateProfileOnComplete(profile, [], [], [], 'h_none');
		expect(db.saveProfile).toHaveBeenCalled();
	});

	it('updates longest_streak when current streak exceeds it', async () => {
		const todayStr = today();
		const d1 = daysAgo(2);
		const d2 = daysAgo(1);
		const completions = [
			makeCompletion('h1', d1),
			makeCompletion('h1', d2),
			makeCompletion('h1', todayStr)
		];
		const profile = makeProfile({ longest_streak: 2, streak_days: 3 });
		const result = await updateProfileOnComplete(profile, completions, [], [], 'h1');
		expect(result.longest_streak).toBeGreaterThanOrEqual(3);
	});

	it('awards stack bonus when stack is fully complete', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const todayStr = today();
		const completions = [makeCompletion('h1', todayStr), makeCompletion('h2', todayStr)];
		const profile = makeProfile({ xp: 100 });
		const result = await updateProfileOnComplete(profile, completions, [stack], [h1, h2], 'h2');
		// 10 base + 25 stack bonus (h2's completion completes the stack) = 35
		expect(result.xp).toBe(135);
	});

	it('does not award stack bonus when stack is not complete', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const todayStr = today();
		const completions = [makeCompletion('h1', todayStr)]; // only 1 of 2 habits
		const profile = makeProfile({ xp: 100 });
		const result = await updateProfileOnComplete(profile, completions, [stack], [h1, h2], 'h1');
		// 10 base + 5 streak (1-day streak from today) = 15, no stack bonus
		expect(result.xp).toBe(115);
	});

	it('awards streak bonus on first completion of the day', async () => {
		const todayStr = today();
		const completions = [makeCompletion('h1', todayStr)];
		const profile = makeProfile({ xp: 100, streak_days: 3 });
		const result = await updateProfileOnComplete(profile, completions, [], [], 'h1');
		// 10 base + min(1*5, 50) streak (streak is 1 since only today) = 15
		expect(result.xp).toBe(115);
	});

	it('does not award streak bonus on second completion of the day', async () => {
		const todayStr = today();
		const completions = [makeCompletion('h1', todayStr), makeCompletion('h2', todayStr)];
		const profile = makeProfile({ xp: 100, streak_days: 3 });
		// Second completion: no streak bonus, just base 10
		const result = await updateProfileOnComplete(profile, completions, [], [], 'h2');
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
		const result = await updateProfileOnUncomplete(profile, [], [], [], 'h_none');
		expect(result.total_completions).toBe(9);
	});

	it('deducts 10 XP base only when the removed habit\'s own stack was not full', async () => {
		// Stack has 4 habits, h4 was never completed; removing h3 (stack was 3/4) → no stack bonus involved
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const h3 = makeHabit('h3', 's1');
		const h4 = makeHabit('h4', 's1');
		const todayStr = today();
		const remaining = [makeCompletion('h1', todayStr), makeCompletion('h2', todayStr)];
		const profile = makeProfile({ xp: 100, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1, h2, h3, h4], 'h3');
		// -10 base only (stack was not full before removal and is not full after)
		expect(result.xp).toBe(90);
	});

	it('does not go below 0 XP', async () => {
		const profile = makeProfile({ xp: 5 });
		const result = await updateProfileOnUncomplete(profile, [], [], [], 'h_none');
		expect(result.xp).toBe(0);
	});

	it('does not go below 0 completions', async () => {
		const profile = makeProfile({ total_completions: 0 });
		const result = await updateProfileOnUncomplete(profile, [], [], [], 'h_none');
		expect(result.total_completions).toBe(0);
	});

	it('recalculates level from XP', async () => {
		// level 1 threshold is 50 XP
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const h3 = makeHabit('h3', 's1');
		const h4 = makeHabit('h4', 's1');
		const todayStr = today();
		const remaining = [makeCompletion('h1', todayStr), makeCompletion('h2', todayStr)];
		const profile = makeProfile({ xp: 60, level: 1, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1, h2, h3, h4], 'h3');
		expect(result.xp).toBe(50);
		expect(result.level).toBe(1);
	});

	it('can derank if XP drops below threshold', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const h3 = makeHabit('h3', 's1');
		const h4 = makeHabit('h4', 's1');
		const todayStr = today();
		const remaining = [makeCompletion('h1', todayStr), makeCompletion('h2', todayStr)];
		const profile = makeProfile({ xp: 55, level: 1, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1, h2, h3, h4], 'h3');
		expect(result.xp).toBe(45);
		expect(result.level).toBe(0);
	});

	it('saves profile to db', async () => {
		const profile = makeProfile();
		await updateProfileOnUncomplete(profile, [], [], [], 'h_none');
		expect(db.saveProfile).toHaveBeenCalled();
	});

	it('deducts stack bonus when uncompleting breaks a full stack', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const todayStr = today();
		// After uncompleting h2, only h1 remains → stack not complete
		const remaining = [makeCompletion('h1', todayStr)];
		const profile = makeProfile({ xp: 145 }); // was awarded 10 base + 25 stack = 35
		const result = await updateProfileOnUncomplete(profile, remaining, [stack], [h1, h2], 'h2');
		// 145 - 10 base - 25 stack = 110
		expect(result.xp).toBe(110);
	});

	it('does not deduct stack bonus when the removed habit\'s own stack was never full (even if another stack is)', async () => {
		// Stack s2 is fully complete today; h2 belongs to s1 which was NOT complete
		// before removal (h1 only, h5 never completed) → s1 never earned a bonus.
		const s1 = makeStack('s1');
		const s2 = makeStack('s2');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const h5 = makeHabit('h5', 's1');
		const h3 = makeHabit('h3', 's2');
		const h4 = makeHabit('h4', 's2');
		const todayStr = today();
		// After uncompleting h2: s1 still not full (h5 missing); s2 remains full
		const remaining = [
			makeCompletion('h1', todayStr),
			makeCompletion('h3', todayStr),
			makeCompletion('h4', todayStr)
		];
		const profile = makeProfile({ xp: 120, streak_days: 0 });
		const result = await updateProfileOnUncomplete(profile, remaining, [s1, s2], [h1, h2, h5, h3, h4], 'h2');
		// h2's own stack never got the bonus → only -10 base (no -25)
		expect(result.xp).toBe(110);
	});

	it('deducts streak bonus when last completion of the day is removed', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		// Profile had streak_days=3, so streak bonus of 15 was awarded on first completion
		const profile = makeProfile({ xp: 125, streak_days: 3 });
		// No remaining completions today → stack not complete, streak bonus deducted
		const result = await updateProfileOnUncomplete(profile, [], [stack], [h1], 'h1');
		// -10 base - 25 stack (not full) - 15 streak (no completions today) = -50
		// 125 - 50 = 75
		expect(result.xp).toBe(75);
	});

	it('XP farming exploit: toggling on/off does not net positive', async () => {
		// Simulate: complete (gain 10 + 25 + streak 5), uncomplete (exact inverse) → net 0
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const todayStr = today();

		let profile = makeProfile({ xp: 100, streak_days: 0, longest_streak: 0, total_completions: 0 });

		// Complete (single-habit stack → completes it)
		const completion = makeCompletion('h1', todayStr);
		profile = await updateProfileOnComplete(profile, [completion], [stack], [h1], 'h1');
		const xpAfterComplete = profile.xp;

		// Uncomplete
		profile = await updateProfileOnUncomplete(profile, [], [stack], [h1], 'h1');
		const xpAfterUncomplete = profile.xp;

		// Exact symmetric inverse: net zero
		expect(xpAfterComplete).toBe(140); // 10 base + 25 stack + 5 streak
		expect(xpAfterUncomplete).toBe(100);
	});

	it('XP farming exploit: stack bonus toggle does not net positive', async () => {
		const stack = makeStack('s1');
		const h1 = makeHabit('h1', 's1');
		const h2 = makeHabit('h2', 's1');
		const todayStr = today();

		let profile = makeProfile({ xp: 100, streak_days: 0, longest_streak: 0, total_completions: 0 });

		// Complete both habits → full stack → bonus
		const c1 = makeCompletion('h1', todayStr);
		const c2 = makeCompletion('h2', todayStr);

		profile = await updateProfileOnComplete(profile, [c1], [stack], [h1, h2], 'h1');
		expect(profile.xp).toBe(115); // 10 base + 5 streak (first of day), no stack bonus
		profile = await updateProfileOnComplete(profile, [c1, c2], [stack], [h1, h2], 'h2');
		const xpAfterComplete = profile.xp;
		expect(xpAfterComplete).toBe(150); // + 10 base + 25 stack bonus

		// Uncomplete h2 → stack no longer complete → lose the stack bonus
		profile = await updateProfileOnUncomplete(profile, [c1], [stack], [h1, h2], 'h2');

		// Net = exactly h1's still-awarded XP (100 + 10 + 5)
		expect(profile.xp).toBe(115);
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
});