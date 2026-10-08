import { describe, it, expect } from 'vitest';
import { ROOM_ITEMS, ROOM_GRID } from './layout';
import { MAX_STAGE } from './room-stage';

const RUG_IDS = ['rug-tl', 'rug-t', 'rug-tr', 'rug-l', 'rug-c', 'rug-r', 'rug-bl', 'rug-b', 'rug-br'];

describe('ROOM_ITEMS', () => {
	it('keeps every item inside the 20x25 grid', () => {
		for (const item of ROOM_ITEMS) {
			expect(item.x).toBeGreaterThanOrEqual(0);
			expect(item.x + item.w).toBeLessThanOrEqual(ROOM_GRID.cols);
			expect(item.y).toBeGreaterThanOrEqual(0);
			expect(item.y + item.h).toBeLessThanOrEqual(ROOM_GRID.rows);
		}
	});

	it('gates every item between stage 1 and MAX_STAGE', () => {
		for (const item of ROOM_ITEMS) {
			expect(item.stage).toBeGreaterThanOrEqual(1);
			expect(item.stage).toBeLessThanOrEqual(MAX_STAGE);
		}
	});

	it('forms a contiguous 3x3 rug at rows 14-16', () => {
		const rug = ROOM_ITEMS.filter((item) => RUG_IDS.includes(item.id));
		expect(rug).toHaveLength(9);
		for (const tile of rug) {
			expect([14, 15, 16]).toContain(tile.y);
			expect([8, 9, 10]).toContain(tile.x);
		}
		// nine unique grid spots = the full block
		expect(new Set(rug.map((t) => `${t.y}:${t.x}`)).size).toBe(9);
	});

	it('places the pet on the rug middle row', () => {
		expect(ROOM_ITEMS.find((item) => item.id === 'pet')?.y).toBe(15.2);
	});
});