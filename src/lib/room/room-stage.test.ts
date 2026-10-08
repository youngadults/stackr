import { describe, it, expect } from 'vitest';
import {
	STAGE_THRESHOLDS,
	MAX_STAGE,
	stageFromXp,
	stageProgress,
	isNightHour,
	isSleepyStreak,
	deriveRoomMood
} from './room-stage';

describe('stageFromXp', () => {
	it('clamps to stage 1 for zero and negative XP', () => {
		expect(stageFromXp(0)).toBe(1);
		expect(stageFromXp(-5)).toBe(1);
	});

	it('maps boundary XP values to the expected stage', () => {
		// 149 -> 1, 150 -> 2
		expect(stageFromXp(149)).toBe(1);
		expect(stageFromXp(150)).toBe(2);
		// 399 -> 2, 400 -> 3
		expect(stageFromXp(399)).toBe(2);
		expect(stageFromXp(400)).toBe(3);
		// 799 -> 3, 800 -> 4
		expect(stageFromXp(799)).toBe(3);
		expect(stageFromXp(800)).toBe(4);
		// 1399 -> 4, 1400 -> 5
		expect(stageFromXp(1399)).toBe(4);
		expect(stageFromXp(1400)).toBe(5);
		// 2199 -> 5, 2200 -> 6
		expect(stageFromXp(2199)).toBe(5);
		expect(stageFromXp(2200)).toBe(6);
		// far beyond max stays at max
		expect(stageFromXp(2201)).toBe(6);
		expect(stageFromXp(999999)).toBe(MAX_STAGE);
	});

	it('caps at the declared max stage', () => {
		expect(STAGE_THRESHOLDS).toHaveLength(MAX_STAGE);
	});
});

describe('stageProgress', () => {
	it('is 0% at the very start', () => {
		expect(stageProgress(0)).toEqual({ stage: 1, stageStart: 0, nextAt: 150, percent: 0 });
	});

	it('is 100% at max stage with no next stage', () => {
		const p = stageProgress(2200);
		expect(p).toEqual({ stage: 6, stageStart: 2200, nextAt: null, percent: 100 });
		expect(stageProgress(5000).percent).toBe(100);
	});

	it('computes mid-stage percent', () => {
		// 75 XP of 150 -> 50%
		expect(stageProgress(75).percent).toBe(50);
		// 275 XP in stage 2 (150-400) -> (275-150)/250 = 50%
		expect(stageProgress(275).percent).toBe(50);
	});

	it('clamps percent within stage bounds', () => {
		expect(stageProgress(149).percent).toBe(99);
		expect(stageProgress(150).percent).toBe(0);
		expect(stageProgress(399).percent).toBe(99);
		expect(stageProgress(400).percent).toBe(0);
	});
});

describe('isNightHour', () => {
	it('marks 19:00-23:00 and 00:00-05:59 as night', () => {
		for (const h of [19, 20, 23, 0, 3, 5]) {
			expect(isNightHour(h)).toBe(true);
		}
	});

	it('marks 06:00-18:00 as day', () => {
		for (const h of [6, 8, 12, 18]) {
			expect(isNightHour(h)).toBe(false);
		}
	});
});

describe('isSleepyStreak', () => {
	it('is sleepy with no completions at all', () => {
		expect(isSleepyStreak(null, '2026-10-08')).toBe(true);
	});

	it('is not sleepy when the last completion was today, yesterday or 2 days ago', () => {
		expect(isSleepyStreak('2026-10-08', '2026-10-08')).toBe(false);
		expect(isSleepyStreak('2026-10-07', '2026-10-08')).toBe(false);
		expect(isSleepyStreak('2026-10-06', '2026-10-08')).toBe(false);
	});

	it('is sleepy at exactly 3 idle days', () => {
		expect(isSleepyStreak('2026-10-05', '2026-10-08')).toBe(true);
		expect(isSleepyStreak('2026-10-01', '2026-10-08')).toBe(true);
	});

	it('treats invalid dates as sleepy', () => {
		expect(isSleepyStreak('not-a-date', '2026-10-08')).toBe(true);
	});

	it('spans month boundaries using local dates', () => {
		expect(isSleepyStreak('2026-09-30', '2026-10-01')).toBe(false);
		expect(isSleepyStreak('2026-09-28', '2026-10-01')).toBe(true);
	});
});

describe('deriveRoomMood', () => {
	it('is night at 20:00 with an active streak', () => {
		expect(deriveRoomMood(20, '2026-10-08', '2026-10-08')).toEqual({ period: 'night', sleepy: false });
	});

	it('is day at noon with an active streak', () => {
		expect(deriveRoomMood(12, '2026-10-08', '2026-10-08')).toEqual({ period: 'day', sleepy: false });
	});

	it('flags sleepy after 3 idle days regardless of hour', () => {
		expect(deriveRoomMood(12, '2026-10-05', '2026-10-08')).toEqual({ period: 'day', sleepy: true });
		expect(deriveRoomMood(22, '2026-10-05', '2026-10-08')).toEqual({ period: 'night', sleepy: true });
	});

	it('a fresh profile with no completions is sleepy', () => {
		expect(deriveRoomMood(12, null, '2026-10-08')).toEqual({ period: 'day', sleepy: true });
	});
});