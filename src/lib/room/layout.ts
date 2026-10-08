// Cozy room layout — CC0 sprites merged from the packs documented in CREDITS.md.
// Coordinates use a 10x10 tile grid inside a 1:1 hero (2x content scale versus
// the original 20x25 portrait: fewer, bigger tiles, denser composition):
// wall rows 0-1.5, floor rows 1.5-10.
// Painter order of ROOM_PLACEMENTS is intentional — later entries render on top.
// A placement is just a kind reference + position + reveal window: sprite,
// footprint size and alt text come from the item-kind catalog (catalog.ts),
// so swapping a sprite or rebalancing a footprint is a one-line catalog change.
// The scripted layout below validates itself against the placement engine
// (placement.ts) in layout.test.ts.
import { footprintH, kindOf } from './catalog';
import wallTile from '$lib/assets/room/wall.png';
import wallBaseTile from '$lib/assets/room/wall-base.png';
import floorTile from '$lib/assets/room/floor.png';

export const ROOM_GRID = { cols: 10, rows: 10, wallRows: 1.5 } as const;

export const TILE_URLS = {
	wall: wallTile,
	wallBase: wallBaseTile,
	floor: floorTile
} as const;

export interface RoomPlacement {
	/** Unique, stable — DOM data-test ids and future saved-user-rooms key on it. */
	id: string;
	/** Item-kind catalog reference (catalog.ts). */
	kindId: string;
	/** left/top in tile units (fractions allowed for on-furniture stacking). */
	x: number;
	y: number;
	/** first stage at which the item is revealed */
	stage: number;
	/** optional last stage at which the item is still visible (exclusive) */
	until?: number;
	/**
	 * `'user'` placements are owned by a player room (the future
	 * unlock-and-place feature) and skip the stage gate — the component shows
	 * them whenever they are present in the state.
	 */
	source?: 'user';
}

/**
 * Stage-gated reveals (cumulative profile XP):
 * 1 bare (floor bed, crate with lamp, windows) -> 2 desk+chair ->
 * 3 desk sprout+poster -> 4 proper bed+nightstand+rug (retires the floor bed) ->
 * 5 pet+bookshelf -> 6 media shelf+speaker. Rug is a composed 6-tile x 5-tile
 * sprite (~a third of the floor); bookshelf is a composed 3-tile strip.
 */
export const ROOM_PLACEMENTS: RoomPlacement[] = [
	{ id: 'window', kindId: 'window', x: 6.95, y: 0.08, stage: 1 },
	{ id: 'window-left', kindId: 'window', x: 0.3, y: 0.08, stage: 1 },
	{ id: 'shelf-media', kindId: 'shelf-media', x: 8.9, y: 0.15, stage: 6 },
	{ id: 'speaker', kindId: 'speaker', x: 9.05, y: 0.18, stage: 6 },
	{ id: 'bookshelf', kindId: 'bookshelf', x: 4.2, y: 0.62, stage: 5 },
	{ id: 'poster', kindId: 'poster', x: 1.25, y: 0.12, stage: 3 },
	{ id: 'lamp', kindId: 'lamp', x: 9.07, y: 8.32, stage: 1 },
	{ id: 'desk', kindId: 'desk', x: 6.4, y: 1.55, stage: 2 },
	{ id: 'chair', kindId: 'chair', x: 7.25, y: 2.7, stage: 2 },
	{ id: 'sprout', kindId: 'sprout', x: 7.35, y: 1.1, stage: 3 },
	{ id: 'bed', kindId: 'bed', x: 0.35, y: 1.55, stage: 4 },
	{ id: 'nightstand', kindId: 'nightstand', x: 2, y: 2, stage: 4 },
	{ id: 'floorbed', kindId: 'floorbed', x: 0.45, y: 2.9, stage: 1, until: 4 },
	{ id: 'crate', kindId: 'crate', x: 8.95, y: 8.9, stage: 1 },
	{ id: 'rug', kindId: 'rug', x: 2, y: 4.75, stage: 4 },
	{ id: 'pet', kindId: 'pet', x: 4.55, y: 6.85, stage: 5 }
];

export interface RoomItem {
	id: string;
	kindId: string;
	src: string;
	/** left/top in tile units. */
	x: number;
	y: number;
	/** size in tile units; h derives from the native sprite aspect (see catalog). */
	w: number;
	h: number;
	/** first stage at which the item is revealed */
	stage: number;
	/** optional last stage at which the item is still visible (exclusive) */
	until?: number;
	/** `'user'` placements skip the stage gate in the component. */
	source?: 'user';
	alt: string;
}

/** Resolve a placement against its kind: sprite src, size and alt text. */
export function resolveItem(p: RoomPlacement): RoomItem {
	const kind = kindOf(p.kindId);
	return {
		id: p.id,
		kindId: kind.id,
		src: kind.sprite,
		x: p.x,
		y: p.y,
		w: kind.footprintW,
		h: footprintH(kind),
		stage: p.stage,
		until: p.until,
		source: p.source,
		alt: kind.alt
	};
}

/** Render-ready items in painter order — what LofiRoom.svelte draws. */
export const ROOM_ITEMS: RoomItem[] = ROOM_PLACEMENTS.map(resolveItem);

function placementById(id: string): RoomPlacement {
	const p = ROOM_PLACEMENTS.find((item) => item.id === id);
	if (!p) throw new Error(`No room placement with id: ${id}`);
	return p;
}

/** Center of a placement, rounded to 2dp (percent-of-scene positions). */
function centerOf(id: string): { x: number; y: number } {
	const p = placementById(id);
	const kind = kindOf(p.kindId);
	const round2 = (v: number) => Math.round(v * 100) / 100;
	return {
		x: round2(p.x + kind.footprintW / 2),
		y: round2(p.y + footprintH(kind) / 2)
	};
}

/** Rect of a placement, rounded to 2dp (percent-of-scene geometry). */
function rectOfId(id: string): { x: number; y: number; w: number; h: number } {
	const p = placementById(id);
	const kind = kindOf(p.kindId);
	const round2 = (v: number) => Math.round(v * 100) / 100;
	return {
		x: round2(p.x),
		y: round2(p.y),
		w: round2(kind.footprintW),
		h: round2(footprintH(kind))
	};
}

/** Where the lamp (and its glow) stands — derived from the `lamp` placement. */
export const LAMP_SPOT = centerOf('lamp');

/** The window (source of the night rain layer) — derived from the `window` placement. */
export const WINDOW_SPOT = rectOfId('window');