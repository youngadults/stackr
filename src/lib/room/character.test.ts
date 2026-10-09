import { describe, expect, it } from 'vitest';
import {
	characterState,
	sleepSpotForStage,
	type CharacterState,
	walkPath,
	walkableCells
} from './character';
import type { RoomMood } from './room-stage';

const mood = (period: RoomMood['period']): RoomMood => ({ period, sleepy: false });

const DAY = new Date(2026, 9, 9, 12, 30, 0);
const NIGHT = new Date(2026, 9, 9, 21, 30, 0);

describe('characterState — night', () => {
	it('sleeps on the floor bed at stages 1-3', () => {
		for (const stage of [1, 2, 3]) {
			const s = characterState(stage, mood('night'), NIGHT);
			expect(s.pose).toBe('sleep');
			expect(s.activity).toContain('floor bed');
			expect(s.zzzAt).toBeDefined();
		}
	});

	it('sleeps in the proper bed from stage 4 on', () => {
		for (const stage of [4, 5, 6]) {
			const s = characterState(stage, mood('night'), NIGHT);
			expect(s.pose).toBe('sleep');
			expect(s.activity).toContain('in the bed');
		}
	});

	it('night state ignores the wall-clock minute', () => {
		const a = characterState(4, mood('night'), new Date(2026, 9, 9, 20, 1, 0));
		const b = characterState(4, mood('night'), new Date(2026, 9, 9, 23, 59, 0));
		expect(a).toEqual(b);
	});
});

describe('characterState — day', () => {
	it('is deterministic for identical inputs', () => {
		const a = characterState(4, mood('day'), DAY, 'resident');
		const b = characterState(4, mood('day'), DAY, 'resident');
		expect(a).toEqual(b);
	});

	it('stays at spots away from slot boundaries', () => {
		// DAY is 12:30 — slot boundary checks: minutes 0-5 are walk windows of
		// the 19:xx/xx-hour slots; 12:30 is mid-slot so he must be standing.
		const s = characterState(4, mood('day'), DAY);
		expect(s.pose).toBe('stand');
	});

	it('respects stage gating — stage 1 never sits at the desk or lounges on the rug', () => {
		const seen = new Set<string>();
		for (let minute = 0; minute < 1440; minute += 3) {
			const s = characterState(1, mood('day'), new Date(2026, 9, 9, 12, minute));
			seen.add(s.activity);
		}
		expect([...seen].join(' ')).not.toContain('desk');
		expect([...seen].join(' ')).not.toContain('rug');
	});

	it('stage 2+ can work at the desk', () => {
		const seen = new Set<string>();
		for (let minute = 0; minute < 1440; minute += 2) {
			const s = characterState(2, mood('day'), new Date(2026, 9, 9, 12, minute));
			seen.add(s.activity);
		}
		expect([...seen].some((a) => a.includes('desk'))).toBe(true);
	});

	it('every slot change ends at a legal stand spot', { timeout: 20000 }, () => {
		for (const stage of [1, 2, 3, 4, 5, 6]) {
			for (let minute = 0; minute < 1440; minute += 1) {
				const s = characterState(stage, mood('day'), new Date(2026, 9, 9, 12, minute));
				expect(s.x).toBeGreaterThanOrEqual(0);
				expect(s.y).toBeGreaterThanOrEqual(0);
				expect(s.x).toBeLessThan(10);
				expect(s.y).toBeLessThan(10);
				expect(['stand', 'walk']).toContain(s.pose);
			}
		}
	});
});

describe('walkPath — routes around furniture', () => {
	it('returns an empty path when already at the goal', () => {
		expect(walkPath({ x: 2, y: 4 }, { x: 2, y: 4 }, 1)).toEqual([]);
	});

	it('finds a clear path on open floor', () => {
		const path = walkPath({ x: 3, y: 5 }, { x: 3, y: 8 }, 4);
		expect(path).not.toBeNull();
		expect(path!.every((c) => c.y >= 1.5)).toBe(true);
	});

	it('never crosses a furniture footprint (bed rect at stage 4)', () => {
		// bed spans 0.35-1.95 x 1.55-4.75; route from left of it to below it
		const path = walkPath({ x: 0.05, y: 5 }, { x: 0.05, y: 2 }, 4);
		expect(path).not.toBeNull();
		for (const c of path!) {
			const insideBed = c.x > 0.34 && c.x < 1.96 && c.y > 1.54 && c.y < 4.76;
			expect(insideBed).toBe(false);
		}
	});

	it('walk reaches the desk-sit approach cell (clear route exists)', () => {
		// desk-sit's approach (8,3) is a clear floor cell beside the desk/chair;
		// the walk routes there and the tail glide snaps him into the tucked spot
		const path = walkPath({ x: 5, y: 2.5 }, { x: 8, y: 3 }, 3);
		expect(path).not.toBeNull();
		expect(path!.length).toBeGreaterThan(1);
	});

	it('walkable cells exclude the wall band', () => {
		const cells = walkableCells(1);
		expect(cells.every((c) => c.y >= 1.5)).toBe(true);
		expect(cells.length).toBeGreaterThan(100);
	});
});

describe('state shape', () => {
	it('always carries a human activity label', () => {
		const s = characterState(6, mood('day'), DAY);
		expect(s.activity.length).toBeGreaterThan(3);
	});

	it('poses stay in the documented set', () => {
		const known: CharacterState['pose'][] = ['stand', 'walk', 'sleep'];
		for (const stage of [1, 3, 6]) {
			const s = characterState(stage, mood('night'), NIGHT);
			expect(known).toContain(s.pose);
		}
	});
});

describe('sleep spots', () => {
	it('resolve for every stage', () => {
		for (const stage of [1, 2, 3, 4, 5, 6]) {
			const s = sleepSpotForStage(stage);
			expect(s.period).toBe('night');
		}
	});
});

describe('walk window', () => {
	it('walk pose ends on arrival — no in-place striding', { timeout: 20000 }, () => {
		// 19s into a 20s walk window: every real route (tens of half-cells at
		// most in a 10x10 room) has finished, so he must already be standing.
		// Regression pin for the walk-pose-held-at-destination bug.
		for (const stage of [1, 2, 3, 4, 5, 6]) {
			for (let minute = 0; minute < 1440; minute += 1) {
				const s = characterState(stage, mood('day'), new Date(2026, 9, 9, 12, minute, 19));
				expect(s.pose).toBe('stand');
			}
		}
	});
});
