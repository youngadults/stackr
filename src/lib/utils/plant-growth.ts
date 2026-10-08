// Garden growth mapping — stack activity → plant/machine stage + progress.
// Pure functions so the Rewards tab logic is unit-testable.

import type { Stack, Habit, Completion } from '$lib/types';
import { calculateStreak } from '$lib/utils/gamification';
import { isStackCompleteOnDate } from '$lib/stores/profile';
import { today } from './helpers';

export const GROWTH_STAGES = ['seed', 'sprout', 'growing', 'blooming', 'mature'] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];

/** Assembly parts of the machine theme — one part per full-stack day. */
export const MACHINE_PARTS = [
	'case',
	'speaker grill',
	'tuning dial',
	'knobs',
	'antenna',
	'glow'
] as const;

export interface PlantProgress {
	stage: number; // 0-4 → GROWTH_STAGES
	wilting: boolean;
	progress: number; // 0-1 toward next stage
	nextLabel: string;
	streak: number;
	completeToday: boolean;
	stageName: GrowthStage;
}

export interface MachineProgress {
	stepsBuilt: number; // 0-6 → MACHINE_PARTS.length
	progress: number; // 0-1 toward the next part
	nextLabel: string;
}

function pluralDays(n: number): string {
	return `${n} day${n === 1 ? '' : 's'}`;
}

function stackActivityDates(stackId: string, habits: Habit[], completions: Completion[]): string[] {
	const stackHabitIds = new Set(habits.filter(h => h.stack_id === stackId).map(h => h.id));
	return [...new Set(completions.filter(c => stackHabitIds.has(c.habit_id)).map(c => c.completed_at))];
}

/**
 * Stage mapping (garden prototype language):
 * - seed      new stack (no activity at all)
 * - sprout    1-2 day streak
 * - growing   3+ day streak
 * - blooming  stack fully complete today (celebrates the day; stays below mature)
 * - mature    14+ day streak (never wilts)
 * - wilting   modifier: 3+ day streak NOT completed today (droop + desaturate)
 */
export function computePlantProgress(
	stackId: string,
	habits: Habit[],
	completions: Completion[]
): PlantProgress {
	const dates = stackActivityDates(stackId, habits, completions);
	const streak = calculateStreak(dates);
	const completeToday = isStackCompleteOnDate(stackId, habits, completions, today());

	let stage: number;
	let wilting = false;

	if (streak >= 14) {
		stage = 4;
	} else if (completeToday) {
		stage = 3;
	} else if (streak >= 3) {
		stage = 2;
		wilting = true; // at risk — water it today
	} else if (streak >= 1) {
		stage = 1;
	} else {
		stage = 0;
	}

	let progress = 0;
	let nextLabel: string;

	if (stage === 0) {
		if (dates.length === 0) {
			nextLabel = 'New stack — complete a habit to sprout';
		} else {
			nextLabel = 'Streak broke — water it today';
		}
	} else if (stage === 1) {
		progress = (streak - 1) / 2;
		nextLabel = `${pluralDays(3 - streak)} to grow`;
	} else if (stage === 2) {
		progress = (streak - 3) / 11;
		nextLabel = `${pluralDays(14 - streak)} to mature`;
	} else if (stage === 3) {
		progress = streak / 14;
		nextLabel = streak === 0 ? 'Full bloom today!' : `${pluralDays(14 - streak)} to mature`;
	} else {
		progress = 1;
		nextLabel = 'Fully grown 🌳';
	}

	return {
		stage,
		wilting,
		progress: Math.max(0, Math.min(1, progress)),
		nextLabel,
		streak,
		completeToday,
		stageName: GROWTH_STAGES[stage]
	};
}

/**
 * Machine theme: every day the whole stack was completed assembles one more
 * part (case → speaker grill → tuning dial → knobs → antenna → glow).
 */
export function machineBuildState(
	stackId: string,
	habits: Habit[],
	completions: Completion[]
): MachineProgress {
	const total = MACHINE_PARTS.length;
	if (habits.filter(h => h.stack_id === stackId).length === 0) {
		return { stepsBuilt: 0, progress: 0, nextLabel: 'Add habits to start building' };
	}

	const dates = stackActivityDates(stackId, habits, completions);
	let fullDays = 0;
	for (const date of dates) {
		if (isStackCompleteOnDate(stackId, habits, completions, date)) fullDays++;
	}

	const stepsBuilt = Math.min(total, fullDays);
	const nextLabel =
		stepsBuilt >= total
			? 'Radio complete — broadcasting! 📻'
			: stepsBuilt === 0
				? `Complete a full day → ${MACHINE_PARTS[0]}`
				: `${pluralDays(total - stepsBuilt)} → ${MACHINE_PARTS[stepsBuilt]}`;

	return { stepsBuilt, progress: stepsBuilt / total, nextLabel };
}