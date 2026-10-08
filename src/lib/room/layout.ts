// Cozy room layout — every sprite is a 16x16 CC0 tile (see CREDITS.md).
// Coordinates use a 20x25 tile grid inside a 4:5 hero: wall rows 0-2,
// floor rows 3-24. Painter order of ROOM_ITEMS is intentional — later
// entries render on top.
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
import bedTopImg from '$lib/assets/room/bed-top.png';
import bedBotImg from '$lib/assets/room/bed-bot.png';
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

export const ROOM_GRID = { cols: 20, rows: 25, wallRows: 3 } as const;

export const TILE_URLS = {
	wall: wallTile,
	wallBase: wallBaseTile,
	floor: floorTile
} as const;

/** Where the lamp (and its glow) stands. */
export const LAMP_SPOT = { x: 18.5, y: 3.2 } as const;

/** The window (source of the night rain layer), in tile units. */
export const WINDOW_SPOT = { x: 13, y: 0.9, w: 2, h: 2 } as const;

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
 * 1 bare (floor bed, crate, lamp, window) -> 2 desk+chair ->
 * 3 desk sprout+poster -> 4 proper bed+rug (retires the floor bed) ->
 * 5 pet+bookshelf -> 6 media shelf+speaker.
 */
export const ROOM_ITEMS: RoomItem[] = [
	{ id: 'window', src: windowImg, x: 13, y: 0.9, w: 2, h: 2, stage: 1, alt: 'Night window with four dark panes' },
	{ id: 'poster', src: posterImg, x: 3, y: 1.3, w: 1, h: 1, stage: 3, alt: 'Framed poster on the wall' },
	{ id: 'blanket', src: blanketImg, x: 2, y: 17.6667, w: 1, h: 1, stage: 1, until: 4, alt: 'Folded blanket with a pillow on the floor' },
	{ id: 'bedroll', src: bedrollImg, x: 3, y: 17.6667, w: 1, h: 1, stage: 1, until: 4, alt: 'Rolled-up sleeping mat on the floor' },
	{ id: 'crate', src: crateImg, x: 17, y: 17.6667, w: 1, h: 1, stage: 1, alt: 'Simple wooden storage box' },
	{ id: 'lamp', src: lampImg, x: 18, y: 3, w: 1, h: 1, stage: 1, alt: 'Lit candelabra standing by the wall' },
	{ id: 'desk', src: deskImg, x: 5, y: 3, w: 1, h: 1, stage: 2, alt: 'Small wooden desk against the wall' },
	{ id: 'chair', src: chairImg, x: 5, y: 4, w: 1, h: 1, stage: 2, alt: 'Wooden chair tucked at the desk' },
	{ id: 'sprout', src: sproutImg, x: 5, y: 2.75, w: 1, h: 1, stage: 3, alt: 'Little potted sprout on the desk' },
	{ id: 'bed-top', src: bedTopImg, x: 2, y: 3, w: 1, h: 1, stage: 4, alt: 'Head of a proper bed against the wall' },
	{ id: 'bed-bot', src: bedBotImg, x: 2, y: 4, w: 1, h: 1, stage: 4, alt: 'Proper bed with an orange blanket' },
	{ id: 'rug-tl', src: rugTl, x: 8, y: 14, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-t', src: rugT, x: 9, y: 14, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-tr', src: rugTr, x: 10, y: 14, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-l', src: rugL, x: 8, y: 15, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-c', src: rugC, x: 9, y: 15, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-r', src: rugR, x: 10, y: 15, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-bl', src: rugBl, x: 8, y: 16, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-b', src: rugB, x: 9, y: 16, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'rug-br', src: rugBr, x: 10, y: 16, w: 1, h: 1, stage: 4, alt: '' },
	{ id: 'bookshelf-1', src: bookshelf1, x: 9, y: 3, w: 1, h: 1, stage: 5, alt: 'Bookshelf with colorful book spines' },
	{ id: 'bookshelf-2', src: bookshelf2, x: 10, y: 3, w: 1, h: 1, stage: 5, alt: '' },
	{ id: 'bookshelf-3', src: bookshelf3, x: 11, y: 3, w: 1, h: 1, stage: 5, alt: '' },
	{ id: 'pet', src: petImg, x: 9, y: 15.2, w: 1, h: 1, stage: 5, alt: 'Pet pig napping on the rug' },
	{ id: 'shelf-media', src: shelfEmpty, x: 15, y: 3, w: 1, h: 1, stage: 6, alt: 'Media shelf against the wall' },
	{ id: 'speaker', src: speakerImg, x: 15, y: 2.2, w: 1, h: 1, stage: 6, alt: 'Speaker sitting on the media shelf' }
];
