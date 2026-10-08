// Plant renderer — determinism, geometry dedupe, progress clamping, and
// bloom↔branch-tip alignment (tips are recorded before branch-state pops).
import { describe, it, expect } from 'vitest';
import { buildPlantArt } from './plant-renderer';

// Sample seeds across stages/productions — covers every seeded variant
const SAMPLE_SEEDS = [
	'st_morning',
	'st_evening',
	'st_reading',
	'stack-alpha',
	'stack-beta',
	'stack-gamma',
	'stack-delta',
	'garden-one',
	'garden-two',
	'garden-three'
];
const SAMPLES: { seed: string; stage: number; progress: number }[] = SAMPLE_SEEDS.flatMap(
	seed =>
		[1, 2, 3, 4].map(stage => ({
			seed,
			stage,
			progress: stage === 3 ? 1 : 0.5 // stage 3 = blooming → dense blooms
		}))
);

describe('buildPlantArt', () => {
	describe('determinism', () => {
		it('same seed+stage+progress produce identical output', () => {
			for (const { seed, stage, progress } of SAMPLES) {
				const first = buildPlantArt(seed, stage, progress, false);
				const second = buildPlantArt(seed, stage, progress, false);
				expect(second).toEqual(first);
			}
		});

		it('same inputs with wilting produce identical output', () => {
			const first = buildPlantArt('st_morning', 3, 0.75, true);
			const second = buildPlantArt('st_morning', 3, 0.75, true);
			expect(second).toEqual(first);
		});
	});

	describe('dedupe regression', () => {
		it('no two rendered polylines share identical points', () => {
			for (const { seed, stage, progress } of SAMPLES) {
				const art = buildPlantArt(seed, stage, progress, false);
				const pts = art.lines.map(l => l.pts);
				expect(new Set(pts).size, `${seed}/${stage}`).toBe(pts.length);
			}
		});

		it('leaf and bloom coordinates stay unique (each-block content keys)', () => {
			for (const { seed, stage, progress } of SAMPLES) {
				const art = buildPlantArt(seed, stage, progress, false);
				const leaves = art.leaves.map(l => `${l.x},${l.y},${l.rot},${l.size},${l.color}`);
				const blooms = art.blooms.map(b => `${b.x},${b.y}`);
				expect(new Set(leaves).size, `leaves ${seed}/${stage}`).toBe(leaves.length);
				expect(new Set(blooms).size, `blooms ${seed}/${stage}`).toBe(blooms.length);
			}
		});
	});

	describe('progress clamping', () => {
		it('progress below 0 and above 1 does not throw and matches clamped results', () => {
			for (const { seed, stage } of SAMPLES) {
				expect(() => buildPlantArt(seed, stage, -0.5, false)).not.toThrow();
				expect(() => buildPlantArt(seed, stage, 1.5, false)).not.toThrow();
				const low = buildPlantArt(seed, stage, -0.5, false);
				const high = buildPlantArt(seed, stage, 1.5, false);
				expect(low).toEqual(buildPlantArt(seed, stage, 0, false));
				expect(high).toEqual(buildPlantArt(seed, stage, 1, false));
			}
		});
	});

	describe('bloom placement', () => {
		it('blooms sit on real branch tips (polyline endpoints) with distinct coords', () => {
			for (const { seed, progress } of SAMPLES.filter(s => s.stage === 3)) {
				const art = buildPlantArt(seed, 3, progress, false);
				expect(art.blooms.length, seed).toBeGreaterThanOrEqual(2);

				// Real branch tips are the endpoint of a rendered polyline
				const endpoints = new Set<string>();
				for (const line of art.lines) {
					const nums = line.pts.trim().split(/\s+/).map(Number);
					endpoints.add(`${Math.round(nums[nums.length - 2] * 10) / 10}|${Math.round(nums[nums.length - 1] * 10) / 10}`);
				}
				const coords = new Set<string>();
				for (const bloom of art.blooms) {
					const bx = Math.round(bloom.x * 10) / 10;
					const by = Math.round(bloom.y * 10) / 10;
					expect(
						endpoints.has(`${bx}|${by}`),
						`${seed}: bloom off-tip at ${bx},${by}`
					).toBe(true);
					coords.add(`${bx}|${by}`);
				}
				expect(coords.size, `${seed}: duplicate bloom coords`).toBe(art.blooms.length);
			}
		});

		it('multi-bloom plants produce distinct bloom coordinates', () => {
			// The review's example: 8 blooms for a full-progress blooming plant
			const art = buildPlantArt('st_morning', 3, 1, false);
			expect(art.blooms.length).toBeGreaterThanOrEqual(2);
			expect(new Set(art.blooms.map(b => `${b.x}|${b.y}`)).size).toBe(art.blooms.length);
		});
	});
});