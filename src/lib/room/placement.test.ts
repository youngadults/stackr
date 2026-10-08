import { describe, it, expect } from 'vitest';
import {
	cellsOf,
	coexistsWith,
	overlaps,
	rectOf,
	snapToGrid,
	stackSatisfied,
	canPlace,
	validatePlacements,
	occupancy
} from './placement';
import { ROOM_PLACEMENTS } from './layout';
import { kindOf } from './catalog';

const at = (kindId: string, x: number, y: number) => ({ kindId, x, y });

describe('rectOf / cellsOf', () => {
	it('rects take the kind footprint with aspect-derived height', () => {
		expect(rectOf(at('desk', 6.4, 1.55))).toEqual({ x: 6.4, y: 1.55, w: 2.6, h: 1.3 });
		expect(rectOf(at('bed', 0.35, 1.55))).toEqual({ x: 0.35, y: 1.55, w: 1.6, h: 3.2 });
		const crate = rectOf(at('crate', 8.95, 8.9));
		expect(crate.h).toBeCloseTo(15 / 14, 9);
	});

	it('claims the cells whose square the rect touches', () => {
		expect(cellsOf({ x: 2, y: 2, w: 1, h: 1 })).toEqual([{ cx: 2, cy: 2 }]);
		// a fractional square straddling four cells claims all four
		expect(cellsOf({ x: 4.55, y: 6.85, w: 0.9, h: 0.9 })).toEqual([
			{ cx: 4, cy: 6 },
			{ cx: 5, cy: 6 },
			{ cx: 4, cy: 7 },
			{ cx: 5, cy: 7 }
		]);
		// exact boundary-touching stays outside the claim (rug's clean right edge)
		const cxCells = cellsOf({ x: 2, y: 4.75, w: 6, h: 5 }).map((c) => c.cx);
		expect(cxCells).toContain(7);
		expect(cxCells).not.toContain(8);
	});

	it('snaps coordinates onto the integer grid', () => {
		expect(snapToGrid(6.95)).toBe(7);
		expect(snapToGrid(0.08)).toBe(0);
	});

	it('detects area sharing and boundary touching', () => {
		expect(overlaps({ x: 0, y: 0, w: 1, h: 1 }, { x: 0.5, y: 0.5, w: 1, h: 1 })).toBe(true);
		expect(overlaps({ x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 })).toBe(false);
		expect(overlaps({ x: 0, y: 0, w: 1, h: 1 }, { x: 0, y: 2, w: 1, h: 1 })).toBe(false);
	});
});

describe('stack rules', () => {
	const defaultSprout = ROOM_PLACEMENTS.find((p) => p.id === 'sprout')!;
	const defaultDesk = at('desk', 6.4, 1.55);

	it('satisfies declared rules in the scripted layout', () => {
		expect(stackSatisfied(defaultSprout, ROOM_PLACEMENTS)).toBe(true);
	});

	it('requires the declared surface', () => {
		expect(stackSatisfied(defaultSprout, [defaultDesk])).toBe(true);
		// hovering over empty floor: no desk square under the pot's bottom edge
		expect(stackSatisfied(at('sprout', 7.35, 5.1), [defaultDesk])).toBe(false);
		// wrong surface kind
		expect(stackSatisfied(at('sprout', 1, 1.6), [at('nightstand', 2, 2)])).toBe(false);
	});
});

describe('stage windows', () => {
	it('a retiring placement never coexists with its successor', () => {
		// floor bed is visible stages 1-3, the proper bed from stage 4 on
		const floorbed = { kindId: 'floorbed', x: 0.45, y: 2.9, stage: 1, until: 4 };
		const bed = { kindId: 'bed', x: 0.35, y: 1.55, stage: 4 };
		expect(coexistsWith(floorbed, bed)).toBe(false);
	});
});

describe('canPlace', () => {
	it('accepts a legal floor spot', () => {
		expect(canPlace(at('bed', 0.35, 1.55), []).ok).toBe(true);
	});

	it('keeps wall art in the wall band and furniture on the floor', () => {
		const deskInWall = canPlace(at('desk', 7, 0.6), []);
		expect(deskInWall.ok).toBe(false);
		const windowOnFloor = canPlace(at('window', 7, 2), []);
		expect(windowOnFloor.ok).toBe(false);
		expect(canPlace(at('window', 0.3, 0.08), []).ok).toBe(true);
	});

	it('accepts a stage-widowed spot: bed replaces the retired floor bed', () => {
		const rest = ROOM_PLACEMENTS.filter((p) => p.id !== 'bed');
		expect(canPlace({ kindId: 'bed', x: 0.35, y: 1.55, stage: 4 }, rest).ok).toBe(true);
	});

	it('rejects a duplicate of a live placement', () => {
		const live = { kindId: 'nightstand', x: 2, y: 2, stage: 4 };
		const res = canPlace(at('nightstand', 2, 2), [live]);
		expect(res.ok).toBe(false);
	});

	it('walkable decor never blocks placement', () => {
		// a chair dropped mid-rug is fine — the rug sits under furniture
		expect(canPlace(at('chair', 3, 6), ROOM_PLACEMENTS).ok).toBe(true);
	});

	it('keeps chair tucking soft (front-of-desk is compositional, not mandatory)', () => {
		expect(canPlace({ kindId: 'chair', x: 7.25, y: 2.7, stage: 2 }, [at('desk', 6.4, 1.55)]).ok).toBe(
			true
		);
	});

	it('rejects on-surface kinds without their surface', () => {
		const res = canPlace(at('lamp', 9.07, 8.32), ROOM_PLACEMENTS.filter((p) => p.id !== 'crate'));
		expect(res.ok).toBe(false);
	});

	it('names the blocker on collision', () => {
		const res = canPlace(at('desk', 1.5, 1.8), [{ kindId: 'nightstand', x: 2, y: 2, id: 'nightstand' }]);
		expect(res.ok).toBe(false);
		if (!res.ok) expect(res.reason).toBe('blocked by nightstand');
	});
});

describe('validatePlacements', () => {
	it('clears the scripted layout', () => {
		expect(validatePlacements(ROOM_PLACEMENTS)).toEqual([]);
	});

	it('flags unknown kinds and collisions', () => {
		const issues = validatePlacements([
			{ kindId: 'ghost', x: 0, y: 0, id: 'g' },
			{ kindId: 'desk', x: 2.5, y: 3, id: 'd1' },
			{ kindId: 'desk', x: 5, y: 3, id: 'd2' }
		]);
		expect(issues.some((i) => i.kindId === 'ghost')).toBe(true);
		expect(issues.some((i) => /overlaps placement d2/.test(i.message ?? ''))).toBe(true);
	});
});

describe('occupancy', () => {
	it('maps claimed cells for UI highlight', () => {
		const map = occupancy([
			{ kindId: 'nightstand', x: 2, y: 2, id: 'nightstand' },
			{ kindId: 'pet', x: 4.55, y: 6.85, id: 'pet' }
		]);
		expect(map.get('2,2')).toEqual(['nightstand']);
		expect(map.get('4,6')).toEqual(['pet']);
		expect(map.get('4,7')).toEqual(['pet']);
	});
});

describe('kindOf', () => {
	it('rejects unknown ids loudly', () => {
		expect(() => kindOf('ghost')).toThrow(/Unknown room item kind/);
	});
});

describe('phase-2 contract: user placements', () => {
	it('floor kinds with declared stack rules stay soft in validation', () => {
		// a chair parked free of any desk must not fail validation (parity fix)
		expect(validatePlacements([{ kindId: 'chair', x: 3, y: 6, id: 'c1' }])).toEqual([]);
	});

	it('a user placement ignores stage gates but not live or future items', () => {
		// the proper bed reveals at stage 4: conservatively blocked even before,
		// because the later reveal would collide with the saved item
		const res = canPlace(
			{ kindId: 'nightstand', x: 1, y: 3, source: 'user' },
			[{ kindId: 'bed', x: 0.35, y: 1.55, stage: 4 }]
		);
		expect(res.ok).toBe(false);
	});

	it('a retired scripted placement stops blocking once its stage has passed', () => {
		const floorbed = { kindId: 'floorbed', x: 0.45, y: 2.9, stage: 1, until: 4 };
		// the floorbed's old sliver frees up the moment its stage passes
		expect(canPlace(at('crate', 2, 3), [floorbed], { atStage: 4 }).ok).toBe(true);
		expect(canPlace(at('crate', 2, 3), [floorbed], { atStage: 2 }).ok).toBe(false);
		expect(canPlace(at('crate', 2, 3), [floorbed]).ok).toBe(false);
	});

	it('moving an existing placement by id ignores its old ghost spot', () => {
		const moved = canPlace(
			{ id: 'desk', kindId: 'desk', x: 6.3, y: 2 },
			[{ id: 'desk', kindId: 'desk', x: 6.4, y: 1.55, stage: 2 }]
		);
		expect(moved.ok).toBe(true);
		// without the id, the old twin phantom-blocks
		const ghosted = canPlace(
			at('desk', 6.3, 2),
			[{ id: 'desk', kindId: 'desk', x: 6.4, y: 1.55, stage: 2 }]
		);
		expect(ghosted.ok).toBe(false);
	});

	it('inside mode pins pet-in-carpet geometry', () => {
		expect(stackSatisfied(at('pet', 4.55, 6.85), [at('rug', 2, 4.75)])).toBe(true);
		expect(stackSatisfied(at('pet', 8.5, 5.2), [at('rug', 2, 4.75)])).toBe(false);
	});
});