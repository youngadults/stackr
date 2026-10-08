// Cozy-room stage derivation for the Rewards page hero.
// Pure functions — unit-tested in room-stage.test.ts.

export const MAX_STAGE = 6;

/** Stage N becomes reachable at CUMULATIVE profile XP of STAGE_THRESHOLDS[N - 1]. */
export const STAGE_THRESHOLDS: readonly number[] = [0, 150, 400, 800, 1400, 2200];

/** Human names for each stage, shown under the hero. */
export const STAGE_NAMES: readonly string[] = [
	'Floor Days',
	'First Desk',
	'Green Corner',
	'Proper Pad',
	'Lived In',
	'Sanctuary'
];

/**
 * Map cumulative XP to a room stage (1..6). Negative or missing XP clamps to 1.
 * Boundaries: 149 -> 1, 150 -> 2, 399 -> 2, 400 -> 3, 799 -> 3,
 * 800 -> 4, 1399 -> 4, 1400 -> 5, 2199 -> 5, 2200 -> 6.
 */
export function stageFromXp(xp: number): number {
	const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
	let stage = 1;
	for (let i = 1; i < STAGE_THRESHOLDS.length; i++) {
		if (safeXp >= STAGE_THRESHOLDS[i]) stage = i + 1;
	}
	return Math.min(stage, MAX_STAGE);
}

export interface StageProgress {
	stage: number;
	/** XP where the current stage starts. */
	stageStart: number;
	/** XP where the next stage starts, or null at max stage. */
	nextAt: number | null;
	/** 0-100 progress toward the next stage; 100 at max stage. */
	percent: number;
}

/** Progress of the visible stage bar toward the next reveal. */
export function stageProgress(xp: number): StageProgress {
	const stage = stageFromXp(xp);
	const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
	const stageStart = STAGE_THRESHOLDS[stage - 1];
	if (stage >= MAX_STAGE) {
		return { stage, stageStart, nextAt: null, percent: 100 };
	}
	const nextAt = STAGE_THRESHOLDS[stage];
	const span = nextAt - stageStart;
	// floor keeps the bar below 100% until the reveal actually unlocks
	const percent = Math.max(0, Math.min(100, Math.floor(((safeXp - stageStart) / span) * 100)));
	return { stage, stageStart, nextAt, percent };
}

export type RoomPeriod = 'day' | 'night';

export interface RoomMood {
	/** Daytime brightens the room; night adds lamp glow, rain and film grain. */
	period: RoomPeriod;
	/** True when there were no habit completions in the last 3 days. */
	sleepy: boolean;
}

/** Night hours are 19:00-06:00 local. */
export function isNightHour(hour: number): boolean {
	return hour >= 19 || hour < 6;
}

/**
 * Sleepy = no habit completions in the last 3 days (or never completed one).
 * `lastCompletionDate` is a YYYY-MM-DD string or null; local dates only.
 */
export function isSleepyStreak(lastCompletionDate: string | null, todayStr: string): boolean {
	if (!lastCompletionDate) return true;
	const a = new Date(lastCompletionDate + 'T12:00:00');
	const b = new Date(todayStr + 'T12:00:00');
	if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return true;
	// getFullYear/getMonth/getDate comparison keeps both dates in local time
	const aLocal = new Date(a.getFullYear(), a.getMonth(), a.getDate());
	const bLocal = new Date(b.getFullYear(), b.getMonth(), b.getDate());
	const days = Math.floor((bLocal.getTime() - aLocal.getTime()) / 86400000);
	if (!Number.isFinite(days)) return true;
	return days >= 3;
}

/**
 * Mood of the room: night/day by local hour, with a sleepy flag when the
 * habit streak has gone quiet for 3+ days. Sleepy never regresses stage.
 */
export function deriveRoomMood(
	hour: number,
	lastCompletionDate: string | null,
	todayStr: string
): RoomMood {
	return {
		period: isNightHour(hour) ? 'night' : 'day',
		sleepy: isSleepyStreak(lastCompletionDate, todayStr)
	};
}