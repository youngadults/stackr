# Room hero sprite credits

All pixel sprites under `src/lib/assets/room/` are CC0 (public domain). These
files were sliced from the original 16px tilesheets listed below — sheet
coordinates and provenance are documented in this file.

## Kenney Roguelike Indoor pack

- Source: https://kenney.nl/assets/roguelike-indoors
- License (verbatim from the pack's `License.txt`):

```
License (Creative Commons Zero, CC0)
http://creativecommons.org/publicdomain/zero/1.0/

You may use these assets in personal and commercial projects.
Credit (Kenney or www.kenney.nl) would be nice but is not mandatory.
```

- Author: Kenney Vleugels (Kenney.nl)
- Files used (sliced from `Tilesheets/roguelikeIndoor_transparent.png`,
  16px tiles with a 1px margin between tiles): `lamp.png` (row 0, col 20),
  `desk.png` (row 4, cols 4-5 merged into one 32x16 tabletop),
  `chair.png` (row 7, col 2), `sprout.png` (row 0, col 17),
  `poster.png` (row 13, col 19), `bed.png` (composed: rows 6-7, col 14 — see Composed sprites), `nightstand.png` (row 5, col 5), `speaker.png`
  (row 9, col 25).

## Kenney Roguelike RPG pack

- Source: https://kenney.nl/assets/roguelike-rpg-pack
- License (verbatim from the pack's `License.txt`):

```
License (Creative Commons Zero, CC0)
http://creativecommons.org/publicdomain/zero/1.0/

You may use these graphics in personal and commercial projects.
Credit (Kenney or www.kenney.nl) would be nice but is not mandatory.
```

- Author: Kenney Vleugels (Kenney.nl), with help by Lynn Evers
- Files used (sliced from `Spritesheet/roguelikeSheet_transparent.png`,
  16px tiles with a 1px margin between tiles): `floor.png` (row 15, col 17),
  `wall.png` (row 22, col 39), `wall-base.png` (row 12, col 14),
  `window.png` (row 3, col 44), `floorbed.png` (rows 2, cols 12-13
  merged into one 32x16 floor bed),
  `rug-tl.png` (row 16, col 10), `rug-t.png` (row 16, col 11),
  `rug-tr.png` (row 16, col 12), `rug-l.png` (row 17, col 10),
  `rug-c.png` (row 17, col 11), `rug-r.png` (row 17, col 12),
  `rug-bl.png` (row 18, col 10), `rug-b.png` (row 18, col 11),
  `rug-br.png` (row 18, col 12), `bookshelf-1.png` (row 12, col 41),
  `bookshelf-2.png` (row 12, col 43), `bookshelf-3.png` (row 12, col 45),
  `shelf-empty.png` (row 13, col 43).

## Kenney Roguelike Characters pack

- Source: direct OGA file fetch (kenney.nl's download links don't scrape):
  https://opengameart.org/sites/default/files/Roguelike%20Characters%20pack.zip
- License (verbatim from the pack's `License.txt`):

```
License (Creative Commons Zero, CC0)
http://creativecommons.org/publicdomain/zero/1.0/

You may use these assets in personal and commercial projects.
Credit (Kenney or www.kenney.nl) would be nice but is not mandatory.
```

- Author: Kenney Vleugels (Kenney.nl)
- Files used (sliced from `Spritesheet/roguelikeChar_transparent.png`,
  918x203, 16px tiles with a 1px margin between tiles):
  `char-base.png` (row 0, col 0 — the avatar kit's body/base layer),
  `char-chest.png` (row 0, col 6 — the orange-shirt torso layer),
  `char-legs-a.png` (row 1, col 3 — stand legs: together),
  `char-legs-b.png` (row 1, col 4 — walk legs: apart). The kit is a
  layered avatar — every layer is authored on the same 16x16 grid, so
  stacking them reproduces Kenney's own assemblies (see his pack Preview
  for the explainer). These four build the room's ambient resident
  (Composed sprites).

## Composed sprites

`rug.png` (96x80, a 6x5-tile carpet), `bookshelf.png` (48x16, a 3-tile
shelf strip), `bed.png` (16x32: `bed-half-head.png` (row 6) stacked
above `bed-half-body.png` (row 7) — headboard/pillow on top, blanket
running to the foot's fold edge) and `character.png` (16x32 — the ambient
resident's 2-frame walk sheet: row 0 = stand, row 1 = walk; each frame =
`char-base` + `char-chest` composited, then that frame's leg strip) are
composed in-repo from the crops listed above by
`scripts/compose-room-sprites.py`; the piece crops stay in this directory
as the composition source and provenance. The bed was first stitched
inverted (foot above the pillow half), then re-stitched; after user review
(2026-10-08) the row-5 flat sheet tile read as a detached box under the
head and was replaced by the row-7 blanket body tile.

## Ninja Adventure asset pack (pet sprite)

- Source: https://pixel-boy.itch.io/ninja-adventure-asset-pack
  (official GitHub distribution by the same author:
  https://github.com/pixel-boy/NinjaAdventure)
- License: Creative Commons Zero (CC0)
  (http://creativecommons.org/publicdomain/zero/1.0/) — stated on the pack page
  ("Creative Commons Zero (CC0) license.")
- Author: pixel-boy
- Files used: `pet.png` — single frame cropped from
  `content/character/pig/pig.png` (frame 1 of the walk sheet);
  `crate.png` — single tile cropped from `content/destroyable/crate.png`
  (wooden storage box).

## Note

The stage-5 pet is a pig from the Ninja Adventure pack because none of the
other licensed packs above contain a cat; the brief allows optional
cherry-picks from this pack.