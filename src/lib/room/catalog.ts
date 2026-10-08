// Item-kind catalog for the rewards room.
// One entry per object species (not per placed copy): the sprite file, its
// native pixel size, and its footprint on the room grid. Placements reference
// kinds by id (see layout.ts), so swapping a sprite or rebalancing a footprint
// is a one-line change here — and the future unlock-and-place feature
// resolves user-placed items through this same table.
//
// Height rules: the renderer sets width + native aspect (`height:auto`), so a
// kind never carries a hardcoded height — footprintH() derives the rendered /
// footprint height as footprintW * spritePx.h / spritePx.w. Tests assert the
// derivation holds for every placement.
import windowImg from '$lib/assets/room/window.png';
import posterImg from '$lib/assets/room/poster.png';
import floorbedImg from '$lib/assets/room/floorbed.png';
import crateImg from '$lib/assets/room/crate.png';
import lampImg from '$lib/assets/room/lamp.png';
import deskImg from '$lib/assets/room/desk.png';
import chairImg from '$lib/assets/room/chair.png';
import sproutImg from '$lib/assets/room/sprout.png';
import bedImg from '$lib/assets/room/bed.png';
import nightstandImg from '$lib/assets/room/nightstand.png';
import rugImg from '$lib/assets/room/rug.png';
import bookshelfImg from '$lib/assets/room/bookshelf.png';
import shelfEmptyImg from '$lib/assets/room/shelf-empty.png';
import speakerImg from '$lib/assets/room/speaker.png';
import petImg from '$lib/assets/room/pet.png';

/** Loose filter buckets for the future catalog UI ("furniture", "plants"). */
export type ItemCategory = 'wall-art' | 'furniture' | 'rug' | 'plant' | 'pet' | 'tech' | 'light';

/**
 * Where a kind is allowed to sit:
 * - `wall`       entirely inside the wall band (rows 0 to wallRows) — art,
 *                windows, wall shelves, furniture pushed against the wall
 * - `floor`      entirely on the floor rows (wallRows to bottom)
 * - `on-surface` rests on another item's sprite (see stacksOn instead of a band)
 */
export type ItemZone = 'wall' | 'floor' | 'on-surface';

export interface StackRule {
	/** kind id this item may rest on */
	target: string;
	/**
	 * `top-edge`: the item's bottom edge rests inside the target's square
	 * (sprout on the desk surface, speaker on the media shelf, lamp on the crate).
	 * `front`: the item's top edge is inside the target's square with its body
	 * emerging below the target's bottom (a chair tucked at the desk).
	 * `inside`: the item sits fully within the target's square (pet on the rug).
	 */
	mode: 'top-edge' | 'front' | 'inside';
}

export interface ItemKind {
	id: string;
	/** Human name — used by the future unlock/place catalog UI. */
	label: string;
	sprite: string;
	/** Native sprite pixels; the source of the aspect that derives footprint height. */
	spritePx: { w: number; h: number };
	/** Width in grid tiles at the canonical placed size. Height derives from the sprite aspect. */
	footprintW: number;
	zone: ItemZone;
	category: ItemCategory;
	/** Rug-category items never block placement (carpet sits under furniture). */
	walkable?: boolean;
	/** Required for zone `on-surface`: the surfaces this kind may rest on. */
	stacksOn?: StackRule[];
	alt: string;
}

export const ITEM_KINDS = {
	window: {
		id: 'window',
		label: 'Night window',
		sprite: windowImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.85,
		zone: 'wall',
		category: 'wall-art',
		alt: 'Night window with four dark panes'
	},
	poster: {
		id: 'poster',
		label: 'Framed poster',
		sprite: posterImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.7,
		zone: 'wall',
		category: 'wall-art',
		alt: 'Framed poster on the wall'
	},
	'shelf-media': {
		id: 'shelf-media',
		label: 'Media shelf',
		sprite: shelfEmptyImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.8,
		zone: 'wall',
		category: 'furniture',
		alt: 'Media shelf against the wall'
	},
	speaker: {
		id: 'speaker',
		label: 'Speaker',
		sprite: speakerImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.4,
		zone: 'on-surface',
		category: 'tech',
		stacksOn: [{ target: 'shelf-media', mode: 'top-edge' }],
		alt: 'Speaker sitting on the media shelf'
	},
	lamp: {
		id: 'lamp',
		label: 'Candelabra lamp',
		sprite: lampImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.75,
		zone: 'on-surface',
		category: 'light',
		stacksOn: [{ target: 'crate', mode: 'top-edge' }],
		alt: 'Lit candelabra standing on the storage crate'
	},
	desk: {
		id: 'desk',
		label: 'Desk',
		sprite: deskImg,
		spritePx: { w: 32, h: 16 },
		footprintW: 2.6,
		zone: 'floor',
		category: 'furniture',
		alt: 'Small wooden desk against the wall'
	},
	chair: {
		id: 'chair',
		label: 'Chair',
		sprite: chairImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 1.3,
		zone: 'floor',
		category: 'furniture',
		/**
		 * Soft rule: the scripted layout tucks the chair in front of the desk;
		 * canPlace() still lets users park a chair anywhere on the floor.
		 */
		stacksOn: [{ target: 'desk', mode: 'front' }],
		alt: 'Wooden chair tucked at the desk'
	},
	sprout: {
		id: 'sprout',
		label: 'Potted sprout',
		sprite: sproutImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.75,
		zone: 'on-surface',
		category: 'plant',
		stacksOn: [{ target: 'desk', mode: 'top-edge' }],
		alt: 'Little potted sprout on the desk'
	},
	bed: {
		id: 'bed',
		label: 'Bed',
		sprite: bedImg,
		spritePx: { w: 16, h: 32 },
		footprintW: 1.6,
		zone: 'floor',
		category: 'furniture',
		alt: 'Proper bed with an orange blanket against the wall'
	},
	nightstand: {
		id: 'nightstand',
		label: 'Nightstand',
		sprite: nightstandImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 1,
		zone: 'floor',
		category: 'furniture',
		alt: 'Small bedside cabinet next to the bed'
	},
	floorbed: {
		id: 'floorbed',
		label: 'Floor bed',
		sprite: floorbedImg,
		spritePx: { w: 32, h: 16 },
		footprintW: 2.2,
		zone: 'floor',
		category: 'furniture',
		alt: 'Floor bed: a rolled-out blanket over a sleeping mat'
	},
	crate: {
		id: 'crate',
		label: 'Storage crate',
		sprite: crateImg,
		spritePx: { w: 14, h: 15 },
		footprintW: 1,
		zone: 'floor',
		category: 'furniture',
		alt: 'Simple wooden storage box'
	},
	bookshelf: {
		id: 'bookshelf',
		label: 'Bookshelf row',
		sprite: bookshelfImg,
		spritePx: { w: 48, h: 16 },
		footprintW: 2.55,
		zone: 'wall',
		category: 'furniture',
		alt: 'Three bookshelves with colorful book spines against the wall'
	},
	rug: {
		id: 'rug',
		label: 'Woven rug',
		sprite: rugImg,
		spritePx: { w: 96, h: 80 },
		footprintW: 6,
		zone: 'floor',
		category: 'rug',
		walkable: true,
		alt: 'Large woven rug covering a third of the floor'
	},
	pet: {
		id: 'pet',
		label: 'Pet pig',
		sprite: petImg,
		spritePx: { w: 16, h: 16 },
		footprintW: 0.9,
		zone: 'floor',
		category: 'pet',
		alt: 'Pet pig napping on the rug'
	}
} as const satisfies Record<string, ItemKind>;

export type KindId = keyof typeof ITEM_KINDS;
export type ItemKinds = Record<KindId, ItemKind>;

/** Catalog lookup; throws on unknown ids so bad placements fail loudly in tests. */
export function kindOf(id: string): ItemKind {
	const kind = (ITEM_KINDS as Record<string, ItemKind>)[id];
	if (!kind) throw new Error(`Unknown room item kind: ${id}`);
	return kind;
}

/** Every kind, in catalog declaration order. */
export const KIND_LIST: readonly ItemKind[] = Object.values(ITEM_KINDS as Record<string, ItemKind>);

/** Rendered / footprint height of a kind: width scaled by the native sprite aspect. */
export function footprintH(kind: ItemKind): number {
	return (kind.footprintW * kind.spritePx.h) / kind.spritePx.w;
}