// Deterministic cozy L-system plant generation for the Rewards garden.
// Uses the headless `lindenmayer` engine + our own turtle → SVG geometry.
// Same plant for a given seed forever; different seeds taste distinct.

import LSystem from 'lindenmayer';

export interface PlantLine {
	pts: string; // "x1 y1 x2 y2 ..." polyline
	width: number;
	color: string;
}

export interface PlantLeaf {
	x: number;
	y: number;
	rot: number; // degrees
	size: number;
	color: string;
}

export interface PlantBloom {
	x: number;
	y: number;
	size: number;
	color: string;
	petals: string; // deep petal color
	knot: string; // center knot color
}

export interface PlantArt {
	lines: PlantLine[];
	leaves: PlantLeaf[];
	blooms: PlantBloom[];
	hasFoliage: boolean;
}

export const PLANT_VIEWBOX = '0 0 64 96';
// Soil diamond — plant grows from its center top face (32,78), like the garden prototype
export const SOIL_TOP = '32,66 52,78 32,90 12,78';
export const SOIL_FRONT = '32,90 52,78 52,84 32,96';
export const SOIL_SIDE = '32,90 12,78 12,84 32,96';
export const SOIL_GRADIENTS = {
	soilTop: { from: '#9a7340', to: '#6b4423' },
	soilFront: { from: '#6b4423', to: '#3d2810' },
	soilSide: { from: '#5a3818', to: '#4a2810' },
	drySoilTop: { from: '#a89070', to: '#8a7355' },
	drySoilFront: { from: '#8a7355', to: '#5a4a32' }
};

// Warm sunset palette — seeded variants keep each stack's plant distinct
const STEM_COLORS = ['#2d8a3e', '#3e7a46', '#2f7a5a', '#4a7a2e'];
const STEM_LIGHT_COLORS = ['#5cb870', '#6cc47e', '#58b088', '#78b04a'];
const LEAF_COLORS = ['#4aba62', '#6dcc7e', '#3da052', '#7ac06a'];
const BLOOMS = [
	{ base: '#f4a0c0', deep: '#e8609a', knot: '#ffd966' },
	{ base: '#f8b878', deep: '#e08850', knot: '#ffe08a' },
	{ base: '#d8a0f0', deep: '#b070d8', knot: '#ffd966' }
];

const ORIGIN_X = 32;
const ORIGIN_Y = 78;
const MIN_Y = 6; // stay inside viewBox

// L-system shapes per stage — X is the grow tip, F draws a segment.
// Classic-style productions are applied by lindenmayer (headless, no renderer).
const TRUNK_PRODUCTION = 'F[+X]F[-X]X';
const SPROUT_PRODUCTIONS: string[] = ['F[+X][-X]', 'F[-X][+X]', 'F[+F][-X][+X]'];
const GROW_PRODUCTIONS: string[] = [
	'F[+X]F[-X]X',
	'F[+X][-X]X',
	'F[-X][+X][+X]X'
];
const MATURE_PRODUCTIONS: string[] = [
	'FF[+X]F[-X][+X]X',
	'F[+X][-X]F[+X]X'
];

function stageBuild(stage: number, hash: number): { iters: number; production: string } {
	switch (stage) {
		case 1: return { iters: 2, production: SPROUT_PRODUCTIONS[hash % SPROUT_PRODUCTIONS.length] };
		case 2: return { iters: 3, production: GROW_PRODUCTIONS[hash % GROW_PRODUCTIONS.length] };
		case 3: return { iters: 3, production: GROW_PRODUCTIONS[hash % GROW_PRODUCTIONS.length] };
		case 4: return { iters: 4, production: MATURE_PRODUCTIONS[hash % MATURE_PRODUCTIONS.length] };
		default: return { iters: 0, production: '' };
	}
}

/** FNV-1a hash — deterministic, fast, good enough for visual seeds. */
export function hashSeed(seed: string): number {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return h >>> 0;
}

interface TurtleOpts {
	angleStep: number; // degrees
	segLen: number;
	droop: number; // extra degrees per segment when wilting (negative = sag left)
}

interface TurtleResult {
	lines: { pts: string; depth: number; startX: number; startY: number }[];
	tips: { x: number; y: number }[];
}

/** Minimal 2D turtle: F draws, + right, - left, [ push, ] pop — SVG-safe coords. */
function turtleWalk(program: string, opts: TurtleOpts, startAngle: number): TurtleResult {
	const lines: TurtleResult['lines'] = [];
	const tips: TurtleResult['tips'] = [];
	const stack: { x: number; y: number; angle: number; cx: number; cy: number }[] = [];
	let x = ORIGIN_X;
	let y = ORIGIN_Y;
	let angle = startAngle;
	let cx = x;
	let cy = y;
	let depth = 0;
	let pts = `${x.toFixed(1)} ${y.toFixed(1)}`;

	const draw = (len: number) => {
		const rad = (angle * Math.PI) / 180;
		const nx = x - Math.sin(rad) * len; // 0° = up
		const ny = y - Math.cos(rad) * len;
		pts += ` ${nx.toFixed(1)} ${ny.toFixed(1)}`;
		x = nx;
		y = ny;
		if (opts.droop !== 0) angle += opts.droop; // sag further as branches grow
	};

	for (const ch of program) {
		switch (ch) {
			case 'F':
				draw(opts.segLen);
				break;
			case '+':
				angle += opts.angleStep;
				break;
			case '-':
				angle -= opts.angleStep;
				break;
			case '[':
				stack.push({ x, y, angle, cx, cy });
				if (x !== cx || y !== cy) {
					lines.push({ pts, depth, startX: cx, startY: cy });
					cx = x;
					cy = y;
				}
				pts = `${x.toFixed(1)} ${y.toFixed(1)}`;
				depth++;
				break;
			case ']':
				lines.push({ pts, depth, startX: cx, startY: cy });
				{
					const s = stack.pop();
					if (s) {
						x = s.x; y = s.y; angle = s.angle; cx = s.cx; cy = s.cy;
					}
				}
				pts = `${x.toFixed(1)} ${y.toFixed(1)}`;
				tips.push({ x, y });
				depth--;
				break;
			default:
				break; // X and any other symbols pass through as no-ops
		}
	}
	if (pts.trim().split(/\s+/).length >= 2) lines.push({ pts, depth, startX: cx, startY: cy });
	tips.push({ x, y });
	return { lines, tips };
}

function lineColorFor(depth: number, stage: number, hash: number): { color: string; width: number } {
	if (stage === 4 && depth === 0) {
		// mature trunk — warm brown
		return { color: hash % 2 === 0 ? '#5a3010' : '#6a3a18', width: 5 };
	}
	if (depth === 0) return { color: STEM_COLORS[hash % STEM_COLORS.length], width: stage === 1 ? 3 : 4 };
	return { color: STEM_LIGHT_COLORS[(hash + depth) % STEM_LIGHT_COLORS.length], width: 3 };
}

function buildGeometry(
	seed: string,
	stage: number,
	progress: number,
	wilting: boolean
): { lines: TurtleResult['lines']; tips: TurtleResult['tips'] } {
	const hash = hashSeed(seed);
	const { iters, production } = stageBuild(stage, hash);
	if (iters === 0 || !production) {
		return { lines: [], tips: [] };
	}

	const ls = new LSystem({ axiom: 'X', productions: { X: production } });
	const program = ls.iterate(iters);

	// Deterministic geometry params from the seed
	const angleStepBase = 18 + (hash % 9); // 18–26°
	const segLenBase = stage === 1 ? 9 : stage === 4 ? 8 : 8 + (hash % 2);
	// Progress interpolates scale: branch length grows within the stage
	const segLen = segLenBase * (0.82 + 0.3 * Math.max(0, Math.min(1, progress)));
	// Wilting droops: sag to one side (seed decides direction)
	const droop = wilting ? (hash % 2 === 0 ? 7 : -7) : 0;
	const startAngle = (hash % 7) - 3; // slight lean ±3°

	const walked = turtleWalk(program, { angleStep: angleStepBase, segLen, droop }, startAngle);

	return walked;
}

/** Full render plan for one plant — consumed by GardenPlant.svelte's SVG. */
export function buildPlantArt(
	seed: string,
	stage: number,
	progress: number,
	wilting: boolean
): PlantArt {
	const hash = hashSeed(seed);
	const clampedStage = Math.max(0, Math.min(4, Math.round(stage)));
	const p = Math.max(0, Math.min(1, progress));

	if (clampedStage === 0) {
		return { lines: [], leaves: [], blooms: [], hasFoliage: false };
	}

	const { lines, tips } = buildGeometry(seed, clampedStage, p, wilting);

	// Coincident polylines (repeated sibling branches like [+X][+X] pop back
	// to the same start state and expand to identical geometry) are drawn on
	// top of each other — keep one so each-block keys stay unique.
	const seenPts = new Set<string>();
	const linesOut: PlantLine[] = lines
		.filter(l => l.pts.trim().split(/\s+/).length >= 4)
		.filter(l => {
			if (seenPts.has(l.pts)) return false;
			seenPts.add(l.pts);
			return true;
		})
		.map(l => {
			const { color, width } = lineColorFor(l.depth, clampedStage, hash);
			return {
				pts: l.pts,
				color: wilting ? '#8a7a3a' : color,
				width: wilting ? Math.max(2, width - 1) : width
			};
		});

	// Pixel-ish diamond leaves along branches — count interpolates with progress
	const leafColor = wilting ? '#a89040' : LEAF_COLORS[(hash + 1) % LEAF_COLORS.length];
	const leafAccent = wilting ? '#b8a850' : LEAF_COLORS[(hash + 2) % LEAF_COLORS.length];
	const leafEvery = 2 + (hash % 2);
	const maxLeaves = Math.max(1, tips.length * 2);
	const leafCount = Math.min(
		maxLeaves,
		clampedStage === 1 ? Math.ceil(p * 4) + 1 : Math.ceil(p * maxLeaves)
	);
	const leaves: PlantLeaf[] = [];
	let leafIdx = 0;
	for (const line of linesOut) {
		const pts = line.pts.split(/\s+/).map(Number);
		for (let i = 2; i + 1 < pts.length; i += 2 * leafEvery) {
			if (leafIdx >= leafCount) break;
			const nearTip = i >= pts.length - 8;
			leaves.push({
				x: pts[i],
				y: pts[i + 1],
				rot: 38 + ((hash + i) % 24),
				size: nearTip ? 5 : 4,
				color: leafIdx % 2 === 0 ? leafColor : leafAccent
			});
			leafIdx++;
		}
		if (leafIdx >= leafCount) break;
	}

	// Blooms only on the blooming stage — seeded palette, dots on branch tips
	const blooms: PlantBloom[] = [];
	if (clampedStage === 3 && !wilting) {
		const bloom = BLOOMS[hash % BLOOMS.length];
		const bloomCount = Math.max(2, Math.min(tips.length, Math.ceil(p * 6) + 2));
		for (let i = 0; i < Math.min(bloomCount, tips.length); i++) {
			const tip = tips[(i * 7 + hash) % tips.length];
			blooms.push({
				x: tip.x,
				y: tip.y,
				size: 5 + (i % 2),
				color: bloom.base,
				petals: bloom.deep,
				knot: bloom.knot
			});
		}
	}

	return { lines: linesOut, leaves, blooms, hasFoliage: true };
}

/** Deterministic gradient id prefix — unique per stack seed, stable across renders. */
export function plantIdPrefix(seed: string): string {
	return `pg-${hashSeed(seed).toString(36)}`;
}