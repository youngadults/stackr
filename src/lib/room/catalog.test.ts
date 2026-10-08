import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { KIND_LIST } from './catalog';

const ROOM_ASSETS = resolve(process.cwd(), 'src/lib/assets/room');

// The aspect-derived-height system rests on hand-typed spritePx — this pins
// them to the real PNG headers (IHDR: width at byte 16, height at byte 20),
// so a wrong pixel size fails loudly instead of drifting into the renderer.
describe('catalog spritePx', () => {
	it('matches the true IHDR dimensions of every sprite file', () => {
		for (const kind of KIND_LIST) {
			const png = readFileSync(resolve(ROOM_ASSETS, basename(kind.sprite)));
			expect(png.readUInt32BE(16), kind.id).toBe(kind.spritePx.w);
			expect(png.readUInt32BE(20), kind.id).toBe(kind.spritePx.h);
		}
	});
});