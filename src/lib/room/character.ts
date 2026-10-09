// Cozy room's ambient resident — one little guy living his life in the room.
// Pure time-state: the character's spot and pose at (stage, mood, wall time)
// is a pure function of those + a per-day seed, so the renderer just derives
// it, the tests assert it, and every scripted capture is deterministic.
// Movement uses the room's own placement data: half-tile cells covered by an
// item footprint are blocked; walks route around them (0.5-tile steps).

import { ROOM_GRID, ROOM_ITEMS } from './layout';
import { kindOf } from './catalog';
import type { RoomMood } from './room-stage';

/** The character: 1x1 tiles. `x,y` = the sprite's top-left tile corner. */
export interface CharacterState {
	x: number;
	y: number;
	/** `stand`: at an active spot; `walk`: mid-trek between spots; `sleep`:
	 * under a blanket — the sprite hides and a ZZZ bubble marks the pillow. */
	pose: 'stand' | 'walk' | 'sleep';
	/** human label of the current activity (tests; future save metadata). */
	activity: string;
	/** explicit ZZZ-bubble spot, present while sleeping. */
	zzzAt?: { x: number; y: number };
}

/** Half-open stage ranges match the room placements: [from, until). */
interface Spot {
	id: string;
	x: number;
	y: number;
	from: number;
	until?: number;
	/** which mood period this activity belongs to. */
	period: 'day' | 'night' | 'any';
	/** Clear cell to walk to first (tucked spots: the walk ends here, then
	 * the same transition glides the short hop into the tucked square). */
	approach?: { x: number; y: number };
	/** ZZZ-bubble position for sleep spots (marks the pillow zone). */
	zzz?: { x: number; y: number };
	activity: string;
}

/**
 * His schedule's places, hand-measured on the 10x10 grid against the shipped
 * furniture footprints (layout.ts): desk 6.4-9.0 x 1.55-2.85 (chair at
 * 7.25,2.7 tucked under), rug 2-8.4 x 4.75-10 with the pet at 4.55,6.85 from
 * stage 5, crate at 8.95,8.9, floor bed 0.45-2.45 x 2.9-3.9 (stage 1-3),
 * bed 0.35-1.95 x 1.55-4.75 (stage 4+).
 */
export const SPOTS: Spot[] = [
	{ id: 'floorbed-sit', x: 0.6, y: 2.95, from: 1, until: 4, period: 'any', activity: 'sitting on the floor bed' },
	{ id: 'crate-corner', x: 7.95, y: 7.9, from: 1, until: 4, period: 'day', activity: 'leaning by the crate' },
	{ id: 'window-gaze', x: 5.75, y: 2.2, from: 1, until: 7, period: 'day', activity: 'watching the rain by the window' },
	{ id: 'desk-sit', x: 7.25, y: 2.7, from: 2, until: 7, period: 'any', approach: { x: 8, y: 3 }, activity: 'working at the desk' },
	{ id: 'rug-lounge', x: 5.65, y: 6.9, from: 4, until: 7, period: 'any', activity: 'lounging on the rug' },
	// sleep: the sprite hides under the blanket; the ZZZ marks the pillow zone
	{ id: 'bed-sleep', x: 0.45, y: 3.75, from: 4, until: 7, period: 'night', zzz: { x: 0.95, y: 1.7 }, activity: 'sleeping in the bed' },
	{ id: 'floorbed-sleep', x: 0.55, y: 2.95, from: 1, until: 4, period: 'night', zzz: { x: 1.0, y: 2.75 }, activity: 'asleep on the floor bed' }
];

export const DAY_SPOTS = SPOTS.filter((s) => s.period !== 'night');
export const SLEEP_SPOTS = SPOTS.filter((s) => s.period === 'night');

/** Activity slots rotate every SLOT_MINUTES. */
const SLOT_MINUTES = 8;
/** Steps are half-tile hops of STEP_SECONDS each. */
const STEP_SECONDS = 0.4;

/** Small deterministic string hash (32-bit). */
function hashStr(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function spotFor(slot: number, legal: Spot[], seed: string): Spot {
	return legal[Math.abs(hashStr(`${seed}:${slot}`)) % legal.length];
}

function sleepSpot(stage: number): Spot {
	const hit = SLEEP_SPOTS.find((s) => stage >= s.from && stage < (s.until ?? 7));
	return hit ?? SLEEP_SPOTS[0];
}

export function spotsForStage(stage: number): Spot[] {
	return DAY_SPOTS.filter((s) => stage >= s.from && stage < (s.until ?? 7));
}

export function sleepSpotForStage(stage: number): Spot {
	return sleepSpot(stage);
}

/** Walkable = inside the floor band, clear of item footprints. 0.5 cells. */
export function walkableCells(stage: number): { x: number; y: number }[] {
	const { cols, rows, wallRows } = ROOM_GRID;
	const blocked: { x: number; y: number }[] = [];
	const blockedSet = new Set<string>();
	const items = ROOM_ITEMS.filter((i) => i.stage === undefined ? true : stage >= (i.stage ?? 1) && (i.until === undefined || stage < i.until));
	for (const item of items) {
		// walkable kinds (the rug) are floor, not obstacle
		if (kindOf(item.kindId).walkable) continue;
		const step = 0.5;
		for (let gx = 0; gx < cols / step; gx++) {
			for (let gy = 0; gy < rows / step; gy++) {
				const cx = gx * step + step / 2;
				const cy = gy * step + step / 2;
				if (
					cy > wallRows &&
					cx > item.x && cx < item.x + item.w &&
					cy > item.y && cy < item.y + item.h
				) {
					blockedSet.add(`${cx}:${cy}`);
				}
			}
		}
	}
	const walkable: { x: number; y: number }[] = [];
	for (let gx = 0; gx < cols / 0.5; gx++) {
		for (let gy = 0; gy < rows / 0.5; gy++) {
			const cx = gx * 0.5;
			const cy = gy * 0.5;
			if (cy >= wallRows && !blockedSet.has(`${cx + 0.25}:${cy + 0.25}`)) {
				walkable.push({ x: cx, y: cy });
			}
		}
	}
	return walkable;
}

export type HalfCell = { x: number; y: number };

/** BFS across half-tile cells: shortest clear route, or null when blocked. */
export function walkPath(from: { x: number; y: number }, to: { x: number; y: number }, stage: number): HalfCell[] | null {
	if (from.x === to.x && from.y === to.y) return [];
	const start: HalfCell = { x: Math.round(from.x * 2) / 2, y: Math.round(from.y * 2) / 2 };
	const goal: HalfCell = { x: Math.round(to.x * 2) / 2, y: Math.round(to.y * 2) / 2 };
	const walkable = new Set(walkableCells(stage).map((c) => `${c.x}:${c.y}`));
	// the goal cell itself is always enterable (the spot owns its tile square,
	// e.g. tucked onto the chair) even when the footprint test flags it
	walkable.add(`${goal.x}:${goal.y}`);
	const prev = new Map<string, string | null>([[`${start.x}:${start.y}`, null]]);
	const queue: HalfCell[] = [start];
	const dirs = [
		{ dx: 0.5, dy: 0 },
		{ dx: -0.5, dy: 0 },
		{ dx: 0, dy: 0.5 },
		{ dx: 0, dy: -0.5 }
	];
	while (queue.length > 0) {
		const cur = queue.shift()!;
		if (cur.x === goal.x && cur.y === goal.y) {
			const path: HalfCell[] = [];
			let key: string | null | undefined = `${cur.x}:${cur.y}`;
			while (key !== null && key !== undefined) {
				const [kx, ky] = key.split(':').map(Number);
				path.push({ x: kx, y: ky });
				key = prev.get(key) ?? undefined;
				if (key === undefined) break;
			}
			return path.reverse().slice(1); // exclude the start (already there)
		}
		for (const d of dirs) {
			const nx = cur.x + d.dx;
			const ny = cur.y + d.dy;
			const key = `${nx}:${ny}`;
			if (
				nx < 0 || ny < 0 || nx >= ROOM_GRID.cols || ny >= ROOM_GRID.rows ||
				ny < ROOM_GRID.wallRows ||
				!walkable.has(key) || prev.has(key)
			) continue;
			prev.set(key, `${cur.x}:${cur.y}`);
			queue.push({ x: nx, y: ny });
		}
	}
	return null;
}

/**
 * The character's state at wall time. Day: activity slots rotate every
 * SLOT_MINUTES; each slot opens with a walk from the previous slot's spot
 * (the first STEP_SECONDS x path-length seconds), then he does his thing.
 * Night: sleep at the stage-appropriate spot, sprite hidden, ZZZ at the
 * pillow. Same inputs -> same state, so captures are deterministic.
 */
export function characterState(stage: number, mood: RoomMood, now: Date, seed = 'resident'): CharacterState {
	// Night: always the sleep spot for his stage.
	if (mood.period === 'night') {
		const spot = sleepSpot(stage);
		return { x: spot.x, y: spot.y, pose: 'sleep', activity: spot.activity, zzzAt: spot.zzz };
	}

	const legal = spotsForStage(stage);
	// Even a stage-1 room has three day spots, so this cannot run dry.
	const dayMinute = now.getHours() * 60 + now.getMinutes();
	const slot = Math.floor(dayMinute / SLOT_MINUTES);
	let spot = spotFor(slot, legal, seed);
	const prevSpot = spotFor(slot - 1, legal, seed);
	if (spot.id === prevSpot.id) spot = spotFor(slot + 1, legal, seed);

	const slotStartMinute = slot * SLOT_MINUTES;
	const slotAgeSec = (dayMinute - slotStartMinute) * 60 + now.getSeconds();
	if (slotAgeSec < 20 && spot.id !== prevSpot.id) {
		// Opening walk: chase the path in STEP_SECONDS hops, half-tile cells.
		// Tucked spots route to their approach cell first; the tail step of the
		// sequence is always the spot itself, so he visibly steps in and settles.
		const approach = spot.approach ?? { x: spot.x, y: spot.y };
		const route = walkPath(prevSpot, approach, stage) ?? [];
		const seq = [...route, { x: spot.x, y: spot.y }];
		if (route.length > 0) {
			const idx = Math.min(Math.floor(slotAgeSec / STEP_SECONDS), seq.length - 1);
			const cell = seq[idx] ?? seq[seq.length - 1];
			return { x: cell.x, y: cell.y, pose: 'walk', activity: 'on the move' };
		}
	}

	return { x: spot.x, y: spot.y, pose: 'stand', activity: spot.activity };
}