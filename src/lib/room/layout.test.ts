import { describe, it, expect } from 'vitest';
import { ROOM_ITEMS, ROOM_GRID } from './layout';
import { MAX_STAGE } from './room-stage';

const rugPieces = ROOM_ITEMS.filter((item) => item.id.startsWith('rug-'));

describe('ROOM_ITEMS', () => {
	it('keeps every item inside the 10x10 grid', () => {
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

	it('forms a contiguous 6x5 carpet in the lower half of the floor', () => {
		expect(rugPieces).toHaveLength(30);
		for (const tile of rugPieces) {
			expect([2, 3, 4, 5, 6, 7]).toContain(tile.x);
			expect([4.75, 5.75, 6.75, 7.75, 8.75]).toContain(tile.y);
			expect(tile.w).toBe(1);
		}
		// thirty unique grid spots = the full carpet block
		expect(new Set(rugPieces.map((t) => `${t.y}:${t.x}`)).size).toBe(30);
	});

	it('places the pet on the carpet', () => {
		const pet = ROOM_ITEMS.find((item) => item.id === 'pet');
		expect(pet?.x).toBe(4.55);
		expect(pet?.y).toBe(6.85);
	});
});