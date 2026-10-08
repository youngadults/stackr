import { describe, it, expect } from 'vitest';
import { ROOM_ITEMS, ROOM_PLACEMENTS, ROOM_GRID, LAMP_SPOT, WINDOW_SPOT, resolveItem } from './layout';
import { kindOf, footprintH } from './catalog';
import { validatePlacements, overlaps, rectOf } from './placement';
import { MAX_STAGE } from './room-stage';

describe('ROOM_PLACEMENTS', () => {
	it('uses unique placement ids', () => {
		const ids = ROOM_PLACEMENTS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('resolves every placement through a known kind', () => {
		for (const p of ROOM_PLACEMENTS) {
			expect(() => kindOf(p.kindId)).not.toThrow();
			expect(() => resolveItem(p)).not.toThrow();
		}
	});

	it('gates every scripted item between stage 1 and MAX_STAGE', () => {
		for (const item of ROOM_ITEMS) {
			expect(item.stage).toBeGreaterThanOrEqual(1);
			expect(item.stage).toBeLessThanOrEqual(MAX_STAGE);
		}
	});
});

describe('ROOM_ITEMS (kind-resolved)', () => {
	it('carries the kind sprite, size and alt text', () => {
		for (const item of ROOM_ITEMS) {
			const kind = kindOf(item.kindId);
			expect(item.src).toBe(kind.sprite);
			expect(item.src.length).toBeGreaterThan(0);
			expect(item.alt).toBe(kind.alt);
			expect(item.w).toBe(kind.footprintW);
		}
	});

	it('keeps every item inside the 10x10 grid', () => {
		for (const item of ROOM_ITEMS) {
			expect(item.x).toBeGreaterThanOrEqual(0);
			expect(item.x + item.w).toBeLessThanOrEqual(ROOM_GRID.cols);
			expect(item.y).toBeGreaterThanOrEqual(0);
			expect(item.y + item.h).toBeLessThanOrEqual(ROOM_GRID.rows);
		}
	});

	it('keeps the rendered height true to the sprite aspect', () => {
		for (const item of ROOM_ITEMS) {
			const kind = kindOf(item.kindId);
			expect(item.h).toBeCloseTo(footprintH(kind), 9);
			expect(item.h).toBeCloseTo((item.w * kind.spritePx.h) / kind.spritePx.w, 9);
		}
	});
});

describe('default layout vs the placement engine', () => {
	it('has no bounds, zone, stack or collision issues', () => {
		expect(validatePlacements(ROOM_PLACEMENTS)).toEqual([]);
	});

	it('paints stacks and tucks over their surfaces in painter order', () => {
		const idx = (id: string) => ROOM_PLACEMENTS.findIndex((p) => p.id === id);
		expect(idx('speaker')).toBeGreaterThan(idx('shelf-media'));
		expect(idx('sprout')).toBeGreaterThan(idx('desk'));
		expect(idx('chair')).toBeGreaterThan(idx('desk'));
		expect(idx('pet')).toBeGreaterThan(idx('rug'));
		// the crate renders after the lamp so its front edge occludes the base
		expect(idx('crate')).toBeGreaterThan(idx('lamp'));
	});
});

describe('composed one-sprite objects', () => {
	it('hangs two windows in the wall band', () => {
		const windows = ROOM_PLACEMENTS.filter((p) => p.kindId === 'window');
		expect(windows.map((p) => p.id).sort()).toEqual(['window', 'window-left']);
		for (const w of windows) {
			expect(w.y).toBe(0.08);
			expect(w.y + footprintH(kindOf('window'))).toBeLessThanOrEqual(ROOM_GRID.wallRows);
		}
	});

	it('lays the rug as one composed 6x5 sprite in the lower half of the floor', () => {
		const rug = ROOM_ITEMS.find((item) => item.id === 'rug');
		expect(rug).toBeTruthy();
		expect(rug!.kindId).toBe('rug');
		expect(rug!.x).toBe(2);
		expect(rug!.y).toBe(4.75);
		expect(rug!.w).toBe(6);
		expect(rug!.h).toBe(5);
		expect(rug!.src.length).toBeGreaterThan(0);
	});

	it('places the pet on the carpet', () => {
		const pet = ROOM_ITEMS.find((item) => item.id === 'pet');
		const rug = ROOM_ITEMS.find((item) => item.id === 'rug');
		expect(pet?.x).toBe(4.55);
		expect(pet?.y).toBe(6.85);
		expect(pet && rug).toBeTruthy();
		expect(overlaps(rectOf(pet!), rectOf(rug!))).toBe(true);
	});

	it('derives the lamp glow and night rain anchors from the placements', () => {
		// raw floats; the component rounds at the 4dp CSS boundary
		expect(LAMP_SPOT.x).toBeCloseTo(9.445, 12);
		expect(LAMP_SPOT.y).toBeCloseTo(8.695, 12);
		expect(WINDOW_SPOT).toEqual({ x: 6.95, y: 0.08, w: 0.85, h: 0.85 });
	});
});