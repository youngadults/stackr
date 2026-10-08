// Grid placement engine for the rewards room.
// Pure geometry + rules over the item-kind catalog: footprint rects, integer
// cell coverage, zone bands (wall / floor / surface stacking) and collision.
// The scripted layout validates itself against these rules (layout.test.ts),
// and the future unlock-and-place feature calls canPlace() before saving a
// user placement.
import { ROOM_GRID } from './layout';
import { kindOf, footprintH, type ItemKind, type StackRule } from './catalog';

const EPS = 1e-9;

/** Footprint rectangle of a placed item: origin + size in tile units. */
export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** Anything with a kind and a position — scripted placements and future user saves. */
export interface PlacedLike {
	kindId: string;
	x: number;
	y: number;
}

interface WithReveal {
	stage?: number;
	until?: number;
	source?: 'user';
}

export interface PlacementIssue {
	placementId?: string;
	kindId: string;
	message: string;
}

/** Half-open visibility span of a placement in stages: [start, end). */
export interface StageWindow {
	start: number;
	end: number;
}

function windowOf(p: PlacedLike & WithReveal): StageWindow {
	// user-owned placements skip the stage gate entirely
	if (p.source === 'user') return { start: 1, end: Infinity };
	return { start: p.stage ?? 1, end: p.until ?? Infinity };
}

/** Do two placements ever render at the same stage? */
export function coexistsWith(
	a: PlacedLike & WithReveal,
	b: PlacedLike & WithReveal
): boolean {
	const wa = windowOf(a);
	const wb = windowOf(b);
	return wa.start < wb.end && wb.start < wa.end;
}

/** Rect for a placement: kind footprint + native-aspect height. */
export function rectOf(p: PlacedLike): Rect {
	const kind = kindOf(p.kindId);
	return { x: p.x, y: p.y, w: kind.footprintW, h: footprintH(kind) };
}

/** True when two rects share any area. Boundary-touching does not count. */
export function overlaps(a: Rect, b: Rect): boolean {
	return (
		a.x < b.x + b.w - EPS &&
		b.x < a.x + a.w - EPS &&
		a.y < b.y + b.h - EPS &&
		b.y < a.y + a.h - EPS
	);
}

/**
 * Integer cells whose square the rect touches at all — partial edge cells
 * included, exact boundary-touching excluded. This is the conservative claim
 * map for a highlight UI; collision math itself stays continuous via
 * rectOf + overlaps.
 */
export function cellsOf(r: Rect): Array<{ cx: number; cy: number }> {
	const cells: Array<{ cx: number; cy: number }> = [];
	const x0 = Math.floor(r.x + EPS);
	const x1 = Math.ceil(r.x + r.w - EPS) - 1;
	const y0 = Math.floor(r.y + EPS);
	const y1 = Math.ceil(r.y + r.h - EPS) - 1;
	for (let cy = y0; cy <= y1; cy++) {
		for (let cx = x0; cx <= x1; cx++) cells.push({ cx, cy });
	}
	return cells;
}

/** Snap a tile coordinate onto the integer grid (for a click-to-place UI). */
export function snapToGrid(v: number): number {
	return Math.round(v);
}

function kindExists(kindId: string): boolean {
	try {
		kindOf(kindId);
		return true;
	} catch {
		return false;
	}
}

/** Band rule for a kind's zone; `on-surface` items are ruled by stacksOn. */
function zoneOk(kind: ItemKind, rect: Rect): boolean {
	switch (kind.zone) {
		case 'wall':
			return rect.y >= -EPS && rect.y + rect.h <= ROOM_GRID.wallRows + EPS;
		case 'floor':
			return rect.y >= ROOM_GRID.wallRows - EPS && rect.y + rect.h <= ROOM_GRID.rows + EPS;
		case 'on-surface':
			return true;
	}
}

function satisfiesRule(item: PlacedLike, rule: StackRule, surface: PlacedLike): boolean {
	if (kindOf(surface.kindId).id !== rule.target) return false;
	const rect = rectOf(item);
	const target = rectOf(surface);
	const bottom = rect.y + rect.h;
	const horizontal = rect.x < target.x + target.w - EPS && target.x < rect.x + rect.w - EPS;
	if (!horizontal) return false;
	if (rule.mode === 'inside') {
		// pet on the rug: fully within the target's square
		return (
			rect.x >= target.x - EPS &&
			rect.x + rect.w <= target.x + target.w + EPS &&
			rect.y >= target.y - EPS &&
			bottom <= target.y + target.h + EPS
		);
	}
	if (rule.mode === 'front') {
		// chair tucked at the desk: top edge inside the target's square,
		// body emerging below its bottom (paints over the desk's lower band)
		return (
			rect.y > target.y &&
			rect.y < target.y + target.h - EPS &&
			rect.y + rect.h > target.y + target.h + EPS
		);
	}
	// top-edge: the item's bottom edge rests inside the surface's square,
	// overlapping it from above (sprout on the desk, lamp on the crate,
	// speaker in the media shelf's box area)
	return bottom > target.y + EPS && bottom < target.y + target.h - EPS;
}

/**
 * Does the item satisfy its declared stack rules among its siblings? Kinds
 * without stacksOn rules are always satisfied; stacksOn is a set of
 * alternatives — any one listed surface suffices. A sibling with the same id
 * is skipped: moving an existing placement must not satisfy itself from its
 * old spot.
 */
export function stackSatisfied(
	p: PlacedLike & WithReveal & { id?: string },
	siblings: readonly (PlacedLike & WithReveal & { id?: string })[]
): boolean {
	const kind = kindOf(p.kindId);
	if (!kind.stacksOn || kind.stacksOn.length === 0) return true;
	/** Same-id twin (or the very same object): not a sibling surface. */
	const staleTwin = (a: { id?: string }, b: { id?: string }) =>
		a !== b && a.id !== undefined && a.id === b.id;
	return kind.stacksOn.some((rule) =>
		siblings.some(
			(other) =>
				!staleTwin(p, other) &&
				kindExists(other.kindId) &&
				coexistsWith(p, other) &&
				satisfiesRule(p, rule, other)
		)
	);
}

/** Does `item` rest on `surface` through one of its declared stack rules? */
function stacksOn(item: PlacedLike, surface: PlacedLike): boolean {
	const kind = kindOf(item.kindId);
	if (!kind.stacksOn || kind.stacksOn.length === 0) return false;
	return kind.stacksOn.some((rule) => kindExists(surface.kindId) && satisfiesRule(item, rule, surface));
}

/** Walkable decor (rug) sits under items; declared stack rules are the legal overlaps. */
function overlapIsLegal(a: PlacedLike & WithReveal, b: PlacedLike & WithReveal): boolean {
	const ka = kindOf(a.kindId);
	const kb = kindOf(b.kindId);
	if (ka.walkable || kb.walkable) return true;
	return stacksOn(a, b) || stacksOn(b, a);
}

function outOfBounds(rect: Rect): boolean {
	return (
		rect.x < -EPS ||
		rect.y < -EPS ||
		rect.x + rect.w > ROOM_GRID.cols + EPS ||
		rect.y + rect.h > ROOM_GRID.rows + EPS
	);
}

/**
 * Full rules pass over a whole layout: bounds, zone bands, collisions, and
 * stack rules for `on-surface` kinds (whose sprite art assumes a surface).
 * Declared stack rules on floor kinds (a chair in front of a desk) are
 * compositional and stay soft — they only matter through the collision pass,
 * where any overlap without a valid stack relation is still flagged. Bounds
 * + zone + collision here are exactly what canPlace() runs for user saves.
 */
export function validatePlacements(
	placements: readonly (PlacedLike & WithReveal & { id?: string })[]
): PlacementIssue[] {
	const issues: PlacementIssue[] = [];

	for (const p of placements) {
		let kind: ItemKind;
		try {
			kind = kindOf(p.kindId);
		} catch {
			issues.push({ placementId: p.id, kindId: p.kindId, message: 'unknown kind' });
			continue;
		}
		const rect = rectOf(p);
		if (outOfBounds(rect)) {
			issues.push({ placementId: p.id, kindId: p.kindId, message: 'footprint leaves the grid' });
			continue;
		}
		if (!zoneOk(kind, rect)) {
			issues.push({ placementId: p.id, kindId: p.kindId, message: 'outside its placement zone' });
			continue;
		}
		if (kind.zone === 'on-surface' && !stackSatisfied(p, placements)) {
			const targets = (kind.stacksOn ?? []).map((s) => s.target).join(', ');
			issues.push({
				placementId: p.id,
				kindId: p.kindId,
				message: `unfulfilled stack rule (needs: ${targets})`
			});
		}
	}

	for (let i = 0; i < placements.length; i++) {
		for (let j = i + 1; j < placements.length; j++) {
			const a = placements[i];
			const b = placements[j];
			if (!kindExists(a.kindId) || !kindExists(b.kindId)) continue;
			if (!coexistsWith(a, b)) continue; // gated off in different stages
			let legal = false;
			try {
				legal = !overlaps(rectOf(a), rectOf(b)) || overlapIsLegal(a, b);
			} catch {
				continue;
			}
			if (!legal) {
				issues.push({
					placementId: a.id ?? kindOf(a.kindId).id,
					kindId: a.kindId,
					message: `overlaps placement ${b.id ?? kindOf(b.kindId).label}`
				});
			}
		}
	}

	return issues;
}

/**
 * The future unlock-and-place UI calls this before saving a user placement.
 * Hard rules: bounds, zone band, stacks for `on-surface` kinds (their sprite
 * art assumes a surface), collisions. Declared stack rules on zone 'floor'
 * kinds (a chair in front of a desk) stay soft — a user may place those free.
 * Not-yet-revealed scripted placements still block (a later reveal would
 * collide with the saved item); `opts.atStage` additionally stops *retired*
 * placements (whose `until` has passed) from blocking. To move an existing
 * placement, pass a candidate carrying the same `id` (or the list without it).
 */
export function canPlace(
	candidate: PlacedLike & WithReveal & { id?: string },
	placements: readonly (PlacedLike & WithReveal & { id?: string })[],
	opts: { atStage?: number } = {}
): { ok: true } | { ok: false; reason: string } {
	let kind: ItemKind;
	try {
		kind = kindOf(candidate.kindId);
	} catch {
		return { ok: false, reason: `unknown kind: ${candidate.kindId}` };
	}
	const rect = rectOf(candidate);
	if (outOfBounds(rect)) {
		return { ok: false, reason: 'placement leaves the room grid' };
	}
	if (!zoneOk(kind, rect)) {
		return {
			ok: false,
			reason: `${kind.label} belongs in the ${kind.zone === 'wall' ? 'wall band' : 'floor area'}`
		};
	}
	if (kind.zone === 'on-surface' && !stackSatisfied(candidate, placements)) {
		const targets = (kind.stacksOn ?? []).map((s) => s.target).join(', ');
		return { ok: false, reason: `${kind.label} must sit on: ${targets}` };
	}
	for (const other of placements) {
		if (other === (candidate as unknown)) continue;
		if (candidate.id !== undefined && other.id === candidate.id) continue;
		if (!kindExists(other.kindId)) continue;
		if (opts.atStage !== undefined && windowOf(other).end <= opts.atStage) continue;
		if (
			coexistsWith(candidate, other) &&
			overlaps(rectOf(candidate), rectOf(other)) &&
			!overlapIsLegal(candidate, other)
		) {
			return { ok: false, reason: `blocked by ${other.id ?? kindOf(other.kindId).label}` };
		}
	}
	return { ok: true };
}

/**
 * Cell -> list of placement ids claiming it. UI helper for highlight/lookup;
 * claims partial edge cells (see cellsOf). Unknown kinds are skipped.
 */
export function occupancy(
	placements: readonly (PlacedLike & WithReveal & { id?: string })[]
): Map<string, string[]> {
	const map = new Map<string, string[]>();
	for (const p of placements) {
		if (!kindExists(p.kindId)) continue;
		const key = p.id ?? kindOf(p.kindId).id;
		for (const { cx, cy } of cellsOf(rectOf(p))) {
			const cell = `${cx},${cy}`;
			const ids = map.get(cell) ?? [];
			ids.push(key);
			map.set(cell, ids);
		}
	}
	return map;
}