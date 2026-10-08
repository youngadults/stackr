// Cozy room layout — CC0 sprites merged from the packs documented in CREDITS.md.
// Coordinates use a 10x10 tile grid inside a 1:1 hero (2x content scale versus
// the original 20x25 portrait: fewer, bigger tiles, denser composition):
// wall rows 0-1.5, floor rows 1.5-10.
// Painter order of ROOM_ITEMS is intentional — later entries render on top.
import wallTile from '$lib/assets/room/wall.png';
import wallBaseTile from '$lib/assets/room/wall-base.png';
import floorTile from '$lib/assets/room/floor.png';
import windowImg from '$lib/assets/room/window.png';
import blanketImg from '$lib/assets/room/blanket.png';
import bedrollImg from '$lib/assets/room/bedroll.png';
import crateImg from '$lib/assets/room/crate.png';
import lampImg from '$lib/assets/room/lamp.png';
import deskImg from '$lib/assets/room/desk.png';
import chairImg from '$lib/assets/room/chair.png';
import sproutImg from '$lib/assets/room/sprout.png';
import posterImg from '$lib/assets/room/poster.png';
import bedImg from '$lib/assets/room/bed.png';
import nightstandImg from '$lib/assets/room/nightstand.png';
import rugTl from '$lib/assets/room/rug-tl.png';
import rugT from '$lib/assets/room/rug-t.png';
import rugTr from '$lib/assets/room/rug-tr.png';
import rugL from '$lib/assets/room/rug-l.png';
import rugC from '$lib/assets/room/rug-c.png';
import rugR from '$lib/assets/room/rug-r.png';
import rugBl from '$lib/assets/room/rug-bl.png';
import rugB from '$lib/assets/room/rug-b.png';
import rugBr from '$lib/assets/room/rug-br.png';
import bookshelf1 from '$lib/assets/room/bookshelf-1.png';
import bookshelf2 from '$lib/assets/room/bookshelf-2.png';
import bookshelf3 from '$lib/assets/room/bookshelf-3.png';
import shelfEmpty from '$lib/assets/room/shelf-empty.png';
import speakerImg from '$lib/assets/room/speaker.png';
import petImg from '$lib/assets/room/pet.png';

export const ROOM_GRID = { cols: 10, rows: 10, wallRows: 1.5 } as const;

export const TILE_URLS = {
	wall: wallTile,
	wallBase: wallBaseTile,
	floor: floorTile
} as const;

/** Where the lamp (and its glow) stands — atop the storage crate. */
export const LAMP_SPOT = { x: 9.4, y: 8.7 } as const;

/** The window (source of the night rain layer), in tile units. */
export const WINDOW_SPOT = { x: 6.9, y: 0, w: 1.5, h: 1.5 } as const;

export interface RoomItem {
	id: string;
	src: string;
	/** left/top in tile units (fractions allowed for on-furniture stacking). */
	x: number;
	y: number;
	/** size in tile units; height follows the native sprite aspect. */
	w: number;
	h: number;
	/** first stage at which the item is revealed */
	stage: number;
	/** optional last stage at which the item is still visible (exclusive) */
	until?: number;
	alt: string;
}

/**
 * Stage-gated reveals (cumulative profile XP):
 * 1 bare (floor bed, crate with lamp, window) -> 2 desk+chair ->
 * 3 desk sprout+poster -> 4 proper bed+nightstand+rug (retires the floor bed) ->
 * 5 pet+bookshelf -> 6 media shelf+speaker. Rug is a 6x5-piece carpet
 * (30 tiles, ~a third of the floor).
 */
export const ROOM_ITEMS: RoomItem[] = [
	{ id: 'window', src: windowImg, x: 6.9, y: 0, w: 1.5, h: 1.5, stage: 1, alt: 'Night window with four dark panes' },
	{ id: 'shelf-media', src: shelfEmpty, x: 8.9, y: 0.55, w: 0.85, h: 0.5, stage: 6, alt: 'Media shelf against the wall' },
	{ id: 'speaker', src: speakerImg, x: 9, y: 0.27, w: 0.6, h: 0.5, stage: 6, alt: 'Speaker sitting on the media shelf' },
	{ id: 'bookshelf-1', src: bookshelf1, x: 4.2, y: 0.62, w: 0.85, h: 0.5, stage: 5, alt: 'Bookshelf with colorful book spines' },
	{ id: 'bookshelf-2', src: bookshelf2, x: 5.05, y: 0.62, w: 0.85, h: 0.5, stage: 5, alt: '' },
	{ id: 'bookshelf-3', src: bookshelf3, x: 5.9, y: 0.62, w: 0.85, h: 0.5, stage: 5, alt: '' },
	{ id: 'poster', src: posterImg, x: 1.2, y: 0.55, w: 0.9, h: 0.5, stage: 3, alt: 'Framed poster on the wall' },
	{ id: 'lamp', src: lampImg, x: 9.05, y: 8.35, w: 0.7, h: 0.7, stage: 1, alt: 'Lit candelabra standing on the storage crate' },
	{ id: 'desk', src: deskImg, x: 6.4, y: 1.55, w: 2.2, h: 1.1, stage: 2, alt: 'Small wooden desk against the wall' },
	{ id: 'chair', src: chairImg, x: 7.25, y: 2.7, w: 1.1, h: 1, stage: 2, alt: 'Wooden chair tucked at the desk' },
	{ id: 'sprout', src: sproutImg, x: 7.3, y: 1.15, w: 0.65, h: 0.5, stage: 3, alt: 'Little potted sprout on the desk' },
	{ id: 'bed', src: bedImg, x: 0.35, y: 1.6, w: 2, h: 2, stage: 4, alt: 'Proper bed with an orange blanket against the wall' },
	{ id: 'nightstand', src: nightstandImg, x: 2.45, y: 2.6, w: 0.9, h: 0.9, stage: 4, alt: 'Small bedside cabinet next to the bed' },
	{ id: 'blanket', src: blanketImg, x: 0.45, y: 2.9, w: 0.9, h: 1, stage: 1, until: 4, alt: 'Folded blanket with a pillow on the floor' },
	{ id: 'bedroll', src: bedrollImg, x: 1.65, y: 3, w: 0.9, h: 1, stage: 1, until: 4, alt: 'Rolled-up sleeping mat on the floor' },
	{ id: 'crate', src: crateImg, x: 8.95, y: 8.9, w: 0.9, h: 1, stage: 1, alt: 'Simple wooden storage box' },
	{ id: 'rug-tl', src: rugTl, x: 2, y: 4.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-t-a', src: rugT, x: 3, y: 4.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-t-b', src: rugT, x: 4, y: 4.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-t-c', src: rugT, x: 5, y: 4.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-t-d', src: rugT, x: 6, y: 4.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-tr', src: rugTr, x: 7, y: 4.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-l-a', src: rugL, x: 2, y: 5.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-a', src: rugC, x: 3, y: 5.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-b', src: rugC, x: 4, y: 5.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-c', src: rugC, x: 5, y: 5.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-d', src: rugC, x: 6, y: 5.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-r-a', src: rugR, x: 7, y: 5.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-l-b', src: rugL, x: 2, y: 6.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-e', src: rugC, x: 3, y: 6.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-f', src: rugC, x: 4, y: 6.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-g', src: rugC, x: 5, y: 6.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-h', src: rugC, x: 6, y: 6.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-r-b', src: rugR, x: 7, y: 6.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-l-c', src: rugL, x: 2, y: 7.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-i', src: rugC, x: 3, y: 7.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-j', src: rugC, x: 4, y: 7.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-k', src: rugC, x: 5, y: 7.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c-l', src: rugC, x: 6, y: 7.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-r-c', src: rugR, x: 7, y: 7.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-bl', src: rugBl, x: 2, y: 8.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-b-a', src: rugB, x: 3, y: 8.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-b-b', src: rugB, x: 4, y: 8.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-b-c', src: rugB, x: 5, y: 8.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-b-d', src: rugB, x: 6, y: 8.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-br', src: rugBr, x: 7, y: 8.75, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'pet', src: petImg, x: 4.55, y: 6.85, w: 0.9, h: 1, stage: 5, alt: 'Pet pig napping on the rug' }
];