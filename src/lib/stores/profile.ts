// Profile and achievement logic — pure functions that operate on state
// Called from the main app store which holds all $state variables
// Local-only mode — no sync queue

import type { Stack, Habit, Completion, Achievement, Profile } from '$lib/types';
import * as db from '$lib/services/db';
import { calculateStreak, levelFromXp } from '$lib/utils/gamification';
import { generateId, today } from '$lib/utils/helpers';
import { checkAllAchievements } from '$lib/utils/badges';

const XP_PER_HABIT = 10;
const XP_STACK_BONUS = 25;
const XP_STREAK_PER_DAY = 5;
const MAX_STREAK_BONUS = 50;

/** All habits in the given stack have a completion on `dateStr` in `completions`.
 *  Exported for badge/garden mapping (stack stage) and tests. */
export function isStackCompleteOnDate(
	stackId: string,
	habits: Habit[],
	completions: Completion[],
	dateStr: string,
	extra?: { habit_id: string }
): boolean {
	const done = new Set(
		completions.filter(c => c.completed_at === dateStr).map(c => c.habit_id)
	);
	if (extra) done.add(extra.habit_id);
	const stackHabits = habits.filter(h => h.stack_id === stackId);
	if (stackHabits.length === 0) return false;
	return stackHabits.every(h => done.has(h.id));
}

/** The stack a habit belongs to, or null if habit/stack is unknown. */
function ownStackOf(habitId: string, stacks: Stack[], habits: Habit[]): Stack | null {
	const habit = habits.find(h => h.id === habitId);
	if (!habit) return null;
	return stacks.find(s => s.id === habit.stack_id) ?? null;
}

export function checkIfFullStackToday(
	stacks: Stack[],
	habits: Habit[],
	completions: Completion[]
): boolean {
	// "Any stack is fully complete today" — used only for badge flags, never XP.
	const todayStr = today();
	return stacks.some(s => isStackCompleteOnDate(s.id, habits, completions, todayStr));
}

/**
 * Calculate the XP to award for completing a habit.
 * - Always 10 base XP
 * - +25 stack bonus ONLY when this completion makes the habit's OWN stack
 *   fully complete on `date` (the stack must not have been complete with the
 *   other completions alone — never "any stack is full")
 * - +streak bonus (5 per streak day, max 50) once per day, on the first
 *   completion of TODAY only
 *
 * `completions` must be the full set INCLUDING the just-added completion;
 * `habitId` identifies the habit that was completed.
 */
export function calculateCompletionXP(
	completions: Completion[],
	stacks: Stack[],
	habits: Habit[],
	streakDays: number,
	habitId: string,
	date: string = today()
): { base: number; stackBonus: number; streakBonus: number; total: number } {
	const base = XP_PER_HABIT;

	// Stack bonus: scoped to this habit's own stack — fires only on the
	// transition from incomplete → complete caused by this completion
	const stack = ownStackOf(habitId, stacks, habits);
	const completeWithoutThis = stack !== null && isStackCompleteOnDate(
		stack.id,
		habits,
		completions.filter(c => !(c.habit_id === habitId && c.completed_at === date)),
		date
	);
	const completeWithThis = stack !== null && isStackCompleteOnDate(stack.id, habits, completions, date);
	const stackBonus = completeWithThis && !completeWithoutThis ? XP_STACK_BONUS : 0;

	// Streak bonus: once per day — only a completion dated today counts,
	// and only the first one
	const todayStr = today();
	const todayCompletions = completions.filter(c => c.completed_at === todayStr);
	const streakBonus = date === todayStr && todayCompletions.length === 1
		? Math.min(streakDays * XP_STREAK_PER_DAY, MAX_STREAK_BONUS)
		: 0;

	return { base, stackBonus, streakBonus, total: base + stackBonus + streakBonus };
}

/**
 * Calculate the XP to deduct for uncompleting a habit — the exact symmetric
 * inverse of calculateCompletionXP for the same habit/date:
 * - Always -10 base
 * - -25 ONLY if the habit's own stack WAS fully complete on `date` including
 *   this completion, and is no longer complete without it
 * - -streak bonus only if the removed completion was today's first (i.e. no
 *   completions remain today), so the once-per-day bonus revokes at most once
 *
 * `remainingCompletions` is the full set AFTER the removal; `habitId` and
 * `date` identify the removed completion.
 */
export function calculateUncompletionXP(
	remainingCompletions: Completion[],
	stacks: Stack[],
	habits: Habit[],
	previousStreakDays: number,
	habitId: string,
	date: string = today()
): { base: number; stackBonus: number; streakBonus: number; total: number } {
	const base = -XP_PER_HABIT;

	// Stack bonus: deduct only when removing this completion breaks the
	// habit's OWN stack (other stacks being full/full-again is irrelevant)
	const stack = ownStackOf(habitId, stacks, habits);
	const wasComplete = stack !== null && isStackCompleteOnDate(
		stack.id,
		habits,
		remainingCompletions,
		date,
		{ habit_id: habitId }
	);
	const isCompleteNow = stack !== null && isStackCompleteOnDate(stack.id, habits, remainingCompletions, date);
	const stackBonus = wasComplete && !isCompleteNow ? -XP_STACK_BONUS : 0;

	// Streak bonus: deduct if the removed completion was today's and no
	// completions remain today (meaning the once-per-day bonus was awarded)
	const todayStr = today();
	const streakBonus = date === todayStr && remainingCompletions.every(c => c.completed_at !== todayStr)
		? -Math.min(previousStreakDays * XP_STREAK_PER_DAY, MAX_STREAK_BONUS)
		: 0;

	return { base, stackBonus, streakBonus, total: base + stackBonus + streakBonus };
}

export async function updateProfileOnComplete(
	profile: Profile,
	completions: Completion[],
	stacks: Stack[],
	habits: Habit[],
	habitId: string,
	date: string = today()
): Promise<Profile> {
	const newTotal = profile.total_completions + 1;
	const habitDates = completions.map(c => c.completed_at);
	const newStreak = calculateStreak(habitDates);
	const newLongest = Math.max(profile.longest_streak, newStreak);

	const xpGain = calculateCompletionXP(completions, stacks, habits, newStreak, habitId, date);
	const newXp = profile.xp + xpGain.total;
	const newLevel = levelFromXp(newXp);

	const updated: Profile = {
		...profile,
		xp: newXp,
		level: newLevel,
		streak_days: newStreak,
		longest_streak: newLongest,
		total_completions: newTotal,
		updated_at: new Date().toISOString()
	};

	await db.saveProfile(updated);
	return updated;
}

export async function updateProfileOnUncomplete(
	profile: Profile,
	remainingCompletions: Completion[],
	stacks: Stack[],
	habits: Habit[],
	habitId: string,
	date: string = today()
): Promise<Profile> {
	const habitDates = remainingCompletions.map(c => c.completed_at);
	const newStreak = calculateStreak(habitDates);
	const newLongest = Math.max(profile.longest_streak, newStreak);

	// Use the profile's current streak_days as "previous streak" for streak bonus deduction
	const xpLoss = calculateUncompletionXP(remainingCompletions, stacks, habits, profile.streak_days, habitId, date);
	const newXp = Math.max(0, profile.xp + xpLoss.total);
	const newLevel = levelFromXp(newXp);

	const updated: Profile = {
		...profile,
		xp: newXp,
		level: newLevel,
		streak_days: newStreak,
		longest_streak: newLongest,
		total_completions: Math.max(0, profile.total_completions - 1),
		updated_at: new Date().toISOString()
	};

	await db.saveProfile(updated);
	return updated;
}

export async function checkAndUnlockAchievements(
	profile: Profile,
	achievements: Achievement[],
	stacks: Stack[],
	userId: string,
	fullStackToday: boolean
): Promise<{ newAchievements: Achievement[]; badgeKeys: string[] }> {
	const results = checkAllAchievements(
		profile.longest_streak,
		profile.total_completions,
		profile.level,
		stacks.length,
		fullStackToday
	);

	const newAchievements: Achievement[] = [];
	const badgeKeys: string[] = [];

	for (const result of results) {
		if (result.shouldUnlock) {
			const existing = achievements.find(a => a.badge_key === result.badgeKey);
			if (!existing) {
				const achievement: Achievement = {
					id: generateId(),
					user_id: userId,
					badge_key: result.badgeKey,
					unlocked_at: new Date().toISOString()
				};
				await db.saveAchievement(achievement);
				newAchievements.push(achievement);
				badgeKeys.push(result.badgeKey);
			}
		}
	}

	return { newAchievements, badgeKeys };
}