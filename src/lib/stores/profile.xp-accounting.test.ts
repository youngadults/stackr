// XP accounting scenarios — stack bonus scoping and complete/uncomplete symmetry
// Covers: multi-habit sequences within one stack, cross-stack sequences,
// cross-stack isolation (no bonus for other stacks), symmetric uncomplete,
// backfilled (past-date) completions, and empty-stack edge cases.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	updateProfileOnComplete,
	updateProfileOnUncomplete,
	calculateCompletionXP,
	calculateUncompletionXP,
	checkIfFullStackToday,
	isStackCompleteOnDate
} from './profile';
import type { Stack, Habit, Completion, Profile } from '$lib/types';
import { today, daysAgo } from '$lib/utils/helpers';

vi.mock('$lib/services/db', () => ({
	saveProfile: vi.fn(),
	saveAchievement: vi.fn()
}));

const T = today();

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
		id: 'user1', xp: 100, level: 2, streak_days: 0, longest_streak: 5,
		total_completions: 20, theme: 'default',
		created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

/** Simulates a real toggle sequence through the public profile API.
 *  `date` is always passed explicitly (module-level T) so a midnight
 *  rollover mid-run can never silently change the completion date. */
async function completeSequence(
	profile: Profile,
	stacks: Stack[],
	habits: Habit[],
	habitIds: string[],
	initialCompletions: Completion[] = [],
	date: string = T
): Promise<{ profile: Profile; deltas: number[] }> {
	let completions = [...initialCompletions];
	let current = profile;
	const deltas: number[] = [];
	for (const habitId of habitIds) {
		completions = [...completions, makeCompletion(habitId, date)];
		const xpBefore = current.xp;
		current = await updateProfileOnComplete(current, completions, stacks, habits, habitId, date);
		deltas.push(current.xp - xpBefore);
	}
	return { profile: current, deltas };
}

async function uncompleteSequence(
	profile: Profile,
	stacks: Stack[],
	habits: Habit[],
	habitIds: string[],
	allCompletions: Completion[],
	date: string = T
): Promise<{ profile: Profile; deltas: number[] }> {
	let completions = [...allCompletions];
	let current = profile;
	const deltas: number[] = [];
	for (const habitId of habitIds) {
		completions = completions.filter(c => c.habit_id !== habitId || c.completed_at !== date);
		const xpBefore = current.xp;
		current = await updateProfileOnUncomplete(current, completions, stacks, habits, habitId, date);
		deltas.push(current.xp - xpBefore);
	}
	return { profile: current, deltas };
}

describe('XP scenario (a): 3 habits in ONE stack completed in a row', () => {
	it('awards +25 exactly once, on the last habit', async () => {
		const stacks = [makeStack('s1')];
		const habits = [makeHabit('h1', 's1'), makeHabit('h2', 's1'), makeHabit('h3', 's1')];
		const { profile, deltas } = await completeSequence(
			makeProfile(), stacks, habits, ['h1', 'h2', 'h3'], [], T
		);
		// h1: 10 + 5 streak (first of day) | h2: 10 | h3: 10 + 25 stack bonus
		expect(deltas).toEqual([15, 10, 35]);
		expect(profile.xp).toBe(100 + 60);
	});
});

describe('XP scenario (b): habits in a row across TWO stacks', () => {
	it('each stack bonus fires exactly once, when that stack completes', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		const { profile, deltas } = await completeSequence(
			makeProfile(), stacks, habits, ['a1', 'a2', 'b1', 'b2'], [], T
		);
		// a1: 10 + 5 streak | a2: 10 + 25 (s1 completes) | b1: 10 ONLY (s1 already full — old bug gave +25 here) | b2: 10 + 25 (s2 completes)
		expect(deltas).toEqual([15, 35, 10, 35]);
		expect(profile.xp).toBe(100 + 95);
	});

	it('stack bonus fires when the SECOND stack completes regardless of order', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		const { deltas } = await completeSequence(
			makeProfile(), stacks, habits, ['b1', 'a1', 'b2', 'a2'], [], T
		);
		// b1: 10 + 5 streak | a1: 10 | b2: 10 + 25 (s2 completes) | a2: 10 + 25 (s1 completes)
		expect(deltas).toEqual([15, 10, 35, 35]);
	});
});

describe('XP scenario (c): completing a habit while a DIFFERENT stack is fully complete', () => {
	it('awards NO stack bonus for a habit whose own stack is not complete', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		// Stack s1 is fully complete; now completing b1 whose stack s2 is not
		const completions = [makeCompletion('a1', T), makeCompletion('a2', T), makeCompletion('b1', T)];
		const gain = calculateCompletionXP(completions, stacks, habits, 2, 'b1');
		expect(gain.stackBonus).toBe(0);
		expect(gain.total).toBe(10);
	});

	it('awards the bonus exactly when the own stack completes afterwards', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		// s1 full; b1 done too — completing b2 now makes s2 full
		const completions = [
			makeCompletion('a1', T), makeCompletion('a2', T),
			makeCompletion('b1', T), makeCompletion('b2', T)
		];
		const gain = calculateCompletionXP(completions, stacks, habits, 2, 'b2');
		expect(gain.stackBonus).toBe(25);
	});
});

describe('XP scenario (d): symmetric uncomplete', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('breaking ONE of two full stacks deducts its own bonus (other full stack is irrelevant)', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		const all = [
			makeCompletion('a1', T), makeCompletion('a2', T),
			makeCompletion('b1', T), makeCompletion('b2', T)
		];
		// Both stacks full; uncomplete a2 → s1 breaks, s2 remains full
		const { deltas } = await uncompleteSequence(makeProfile({ xp: 200 }), stacks, habits, ['a2'], all, T);
		// -10 base - 25 stack (s1's bonus) — NOT suppressed by s2 still being full (old bug)
		expect(deltas).toEqual([-35]);
	});

	it('uncomplete of a habit whose stack never completed deducts base only', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		// s2 full; s1 not full (only a1 done). Uncomplete a1 → s1 was never full → no stack deduction
		const all = [makeCompletion('a1', T), makeCompletion('b1', T), makeCompletion('b2', T)];
		const { deltas } = await uncompleteSequence(makeProfile({ xp: 200 }), stacks, habits, ['a1'], all, T);
		expect(deltas).toEqual([-10]);
	});

	it('complete → uncomplete for a single habit nets exactly zero (incl. its stack bonus)', async () => {
		const stacks = [makeStack('s1')];
		const habits = [makeHabit('h1', 's1'), makeHabit('h2', 's1')];
		const c1 = makeCompletion('h1', T);

		let profile = makeProfile({ xp: 100 });
		profile = await updateProfileOnComplete(profile, [c1], stacks, habits, 'h1', T); // 10 + 5 streak
		const afterComplete = profile.xp;
		profile = await updateProfileOnComplete(profile, [c1, makeCompletion('h2', T)], stacks, habits, 'h2', T); // 10 + 25
		profile = await updateProfileOnUncomplete(profile, [c1], stacks, habits, 'h2', T); // -10 - 25
		profile = await updateProfileOnUncomplete(profile, [], stacks, habits, 'h1', T); // -10 - 5 streak

		expect(profile.xp).toBe(100);
		expect(afterComplete).toBe(115);
	});

	it('re-completing a broken stack re-awards its bonus symmetrically', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		const all = [
			makeCompletion('a1', T), makeCompletion('a2', T),
			makeCompletion('b1', T), makeCompletion('b2', T)
		];
		let profile = makeProfile({ xp: 200 });

		// Break s1, then restore it: -35 then +35
		const broken = await uncompleteSequence(profile, stacks, habits, ['a2'], all, T);
		expect(broken.deltas).toEqual([-35]);
		profile = broken.profile;

		// State after the break: a1, b1, b2 still completed
		const afterBreak = all.filter(c => c.habit_id !== 'a2');
		const restored = await completeSequence(profile, stacks, habits, ['a2'], afterBreak, T);
		expect(restored.deltas).toEqual([35]); // 10 base + 25 stack, no extra streak (not first of day)
	});

	it('streak bonus deducts exactly once when the last completion of the day is removed', async () => {
		// First completion of the day awarded streak once; removing completions
		// one by one deducts the streak only on the final removal
		const stacks = [makeStack('s1')];
		const habits = [makeHabit('h1', 's1'), makeHabit('h2', 's1')];
		const all = [makeCompletion('h1', T), makeCompletion('h2', T)];
		let profile = makeProfile({ xp: 100 });

		const completed = await completeSequence(profile, stacks, habits, ['h1', 'h2'], [], T);
		expect(completed.deltas).toEqual([15, 35]); // streak bonus awarded exactly once
		profile = completed.profile;

		const removed = await uncompleteSequence(profile, stacks, habits, ['h2', 'h1'], all, T);
		// h2 removal: -10 - 25 (h2's stack bonus), streak kept (h1 remains)
		// h1 removal: -10 - 5 streak (last today completion)
		expect(removed.deltas).toEqual([-35, -15]);
		expect(removed.profile.xp).toBe(100);
	});

	it('uncompleting a habit from another full stack does not double-deduct', async () => {
		const stacks = [makeStack('s1'), makeStack('s2')];
		const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];
		const all = [
			makeCompletion('a1', T), makeCompletion('a2', T),
			makeCompletion('b1', T), makeCompletion('b2', T)
		];
		// Break both stacks one after another: each habit deducts its own stack bonus once
		const { deltas, profile } = await uncompleteSequence(
			makeProfile({ xp: 200 }), stacks, habits, ['a2', 'b2'], all, T
		);
		expect(deltas).toEqual([-35, -35]);
		expect(profile.xp).toBe(130);
	});
});

describe('calculateUncompletionXP scoping (unit)', () => {
	const stacks = [makeStack('s1'), makeStack('s2')];
	const habits = [makeHabit('a1', 's1'), makeHabit('a2', 's1'), makeHabit('b1', 's2'), makeHabit('b2', 's2')];

	it('no deduction when the removed habit never completed a stack', () => {
		const remaining = [
			makeCompletion('a1', T),
			makeCompletion('b1', T),
			makeCompletion('b2', T)
		];
		const loss = calculateUncompletionXP(remaining, stacks, habits, 0, 'a1', T);
		expect(loss.total).toBe(-10);
	});

	it('deduction fires exactly when the removed completion breaks its own stack', () => {
		const remaining = [makeCompletion('a1', T), makeCompletion('b1', T), makeCompletion('b2', T)];
		const loss = calculateUncompletionXP(remaining, stacks, habits, 0, 'a2', T);
		expect(loss.total).toBe(-35);
	});
});

describe('XP backfill path: completing for a PAST date (Y = yesterday)', () => {
	const Y = daysAgo(1);
	const stacks = [makeStack('s1')];
	const habits = [makeHabit('h1', 's1'), makeHabit('h2', 's1')];

	it('awards stack bonus with ZERO streak bonus on the backfilled completion', async () => {
		// h1 was completed on Y (stack not full on Y yet); backfilling h2 with
		// date=Y completes the stack on Y — 10 base + 25 stack, no streak bonus
		const initial = [makeCompletion('h1', Y)];
		const { deltas, profile } = await completeSequence(makeProfile(), stacks, habits, ['h2'], initial, Y);
		expect(deltas).toEqual([35]);
		expect(profile.xp).toBe(100 + 35);
	});

	it('uncompleting the backfilled completion deducts symmetrically (-35)', async () => {
		const all = [makeCompletion('h1', Y), makeCompletion('h2', Y)];
		const { deltas, profile } = await uncompleteSequence(
			makeProfile({ xp: 135 }), stacks, habits, ['h2'], all, Y
		);
		expect(deltas).toEqual([-35]);
		expect(profile.xp).toBe(100);
	});

	it("TODAY's fullness must not affect the Y-dated result", async () => {
		// The stack is ALSO fully complete today (separate completions); the
		// Y-dated backfill must behave purely date-scoped
		const initial = [makeCompletion('h1', Y), makeCompletion('h1', T), makeCompletion('h2', T)];
		const completed = await completeSequence(makeProfile(), stacks, habits, ['h2'], initial, Y);
		expect(completed.deltas).toEqual([35]); // stack bonus on Y, none of today's state

		// Symmetric: removing the Y completion while today's completions stay intact
		const all = [...initial, makeCompletion('h2', Y)];
		const removed = await uncompleteSequence(completed.profile, stacks, habits, ['h2'], all, Y);
		expect(removed.deltas).toEqual([-35]);
		expect(removed.profile.xp).toBe(completed.profile.xp - 35);
	});

	it('backfill of a lone habit never awards the once-per-day streak bonus', async () => {
		// Completing the first habit with date=Y: base only (stack not full and
		// not today — no streak bonus on past dates)
		const { deltas } = await completeSequence(makeProfile(), stacks, habits, ['h1'], [], Y);
		expect(deltas).toEqual([10]);
	});
});

describe('XP empty-stack edge case', () => {
	it('a stack with 0 habits is never complete — no bonus, full-stack check false', () => {
		const stacks = [makeStack('s1')];
		const habits: Habit[] = [];
		expect(isStackCompleteOnDate('s1', habits, [], T)).toBe(false);
		expect(checkIfFullStackToday(stacks, habits, [])).toBe(false);
	});

	it('awards no stack bonus when the completed habit has no stack backing it', () => {
		// Degenerate data: completion exists but the habits list is empty, so
		// the habit's stack can never be satisfied — base XP only
		const gain = calculateCompletionXP([makeCompletion('hx', T)], [makeStack('s1')], [], 1, 'hx', T);
		expect(gain.stackBonus).toBe(0);
		expect(gain.base).toBe(10);
	});
});
