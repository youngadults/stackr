// Profile and achievement logic — pure functions that operate on state
// Called from the main app store which holds all $state variables

import type { Stack, Habit, Completion, Achievement, Profile } from '$lib/types';
import * as db from '$lib/services/db';
import * as sync from '$lib/services/sync';
import { calculateStreak, levelFromXp } from '$lib/utils/gamification';
import { generateId, today } from '$lib/utils/helpers';
import { checkAllAchievements } from '$lib/utils/badges';

const XP_PER_HABIT = 10;
const XP_STACK_BONUS = 25;
const XP_STREAK_PER_DAY = 5;
const MAX_STREAK_BONUS = 50;

export function checkIfFullStackToday(
	stacks: Stack[],
	habits: Habit[],
	completions: Completion[]
): boolean {
	const todayStr = today();
	for (const stack of stacks) {
		const stackHabits = habits.filter(h => h.stack_id === stack.id);
		if (stackHabits.length === 0) continue;
		const allComplete = stackHabits.every(h =>
			completions.some(c => c.habit_id === h.id && c.completed_at === todayStr)
		);
		if (allComplete) return true;
	}
	return false;
}

/**
 * Calculate the XP to award for completing a habit.
 * - Always 10 base XP per habit
 * - +25 stack bonus if this completion makes a stack fully complete
 * - +streak bonus (5 per streak day, max 50) on the first completion of the day
 */
export function calculateCompletionXP(
	completions: Completion[],
	stacks: Stack[],
	habits: Habit[],
	streakDays: number
): { base: number; stackBonus: number; streakBonus: number; total: number } {
	const base = XP_PER_HABIT;

	// Stack bonus: only if completing this habit makes a full stack
	const isFullStack = checkIfFullStackToday(stacks, habits, completions);
	const stackBonus = isFullStack ? XP_STACK_BONUS : 0;

	// Streak bonus: only on the first completion of the day
	const todayStr = today();
	const todayCompletions = completions.filter(c => c.completed_at === todayStr);
	const streakBonus = todayCompletions.length === 1
		? Math.min(streakDays * XP_STREAK_PER_DAY, MAX_STREAK_BONUS)
		: 0;

	return { base, stackBonus, streakBonus, total: base + stackBonus + streakBonus };
}

/**
 * Calculate the XP to deduct for uncompleting a habit.
 * This is the symmetric inverse of calculateCompletionXP:
 * - Always -10 base
 * - -25 stack bonus if removing this completion breaks a full stack
 * - -streak bonus if this was the last completion of the day
 */
export function calculateUncompletionXP(
	remainingCompletions: Completion[],
	stacks: Stack[],
	habits: Habit[],
	previousStreakDays: number
): { base: number; stackBonus: number; streakBonus: number; total: number } {
	const base = -XP_PER_HABIT;

	// Stack bonus: deduct if removing this habit breaks the full stack
	// Only deduct if there ARE stacks (meaning a stack bonus could have been awarded)
	const isStillFullStack = stacks.length > 0 && checkIfFullStackToday(stacks, habits, remainingCompletions);
	const stackBonus = isStillFullStack ? 0 : -XP_STACK_BONUS;

	// Streak bonus: deduct if no completions remain today
	// (meaning the first-completion bonus was awarded and is now being removed)
	const todayStr = today();
	const todayCompletions = remainingCompletions.filter(c => c.completed_at === todayStr);
	const streakBonus = todayCompletions.length === 0
		? -Math.min(previousStreakDays * XP_STREAK_PER_DAY, MAX_STREAK_BONUS)
		: 0;

	return { base, stackBonus, streakBonus, total: base + stackBonus + streakBonus };
}

export async function updateProfileOnComplete(
	profile: Profile,
	completions: Completion[],
	stacks: Stack[],
	habits: Habit[]
): Promise<Profile> {
	const newTotal = profile.total_completions + 1;
	const habitDates = completions.map(c => c.completed_at);
	const newStreak = calculateStreak(habitDates);
	const newLongest = Math.max(profile.longest_streak, newStreak);

	const xpGain = calculateCompletionXP(completions, stacks, habits, newStreak);
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
	await sync.pushToSyncQueue('profiles', 'update', updated as unknown as Record<string, unknown>);
	return updated;
}

export async function updateProfileOnUncomplete(
	profile: Profile,
	remainingCompletions: Completion[],
	stacks: Stack[],
	habits: Habit[]
): Promise<Profile> {
	const habitDates = remainingCompletions.map(c => c.completed_at);
	const newStreak = calculateStreak(habitDates);
	const newLongest = Math.max(profile.longest_streak, newStreak);

	// Use the profile's current streak_days as "previous streak" for streak bonus deduction
	const xpLoss = calculateUncompletionXP(remainingCompletions, stacks, habits, profile.streak_days);
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
	await sync.pushToSyncQueue('profiles', 'update', updated as unknown as Record<string, unknown>);
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
				await sync.pushToSyncQueue('achievements', 'insert', achievement as unknown as Record<string, unknown>);
				newAchievements.push(achievement);
				badgeKeys.push(result.badgeKey);
			}
		}
	}

	return { newAchievements, badgeKeys };
}