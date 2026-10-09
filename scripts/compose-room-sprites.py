#!/usr/bin/env python3
"""Compose multi-tile room sprites from the 16px piece crops in assets/room.

Run from the repo root:  python3 scripts/compose-room-sprites.py
Writes:
  src/lib/assets/room/rug.png        (96x80,  6x5 tiles)
  src/lib/assets/room/bookshelf.png  (48x16,  3x1 tiles)
  src/lib/assets/room/bed.png        (16x32,  2x1 tiles, head-above-body)
  src/lib/assets/room/character.png  (16x32,  2-frame walk sheet:
                                      row 0 = stand, row 1 = walk)

One sprite per object: the renderer places a single <img> per object instead
of stacking per-tile entries, and the item catalog (src/lib/room/catalog.ts)
carries the composed sprite with its native pixel size + footprint. The piece
crops stay in assets/room as the composition source and provenance.
"""
from PIL import Image
from pathlib import Path

ROOM = Path(__file__).resolve().parent.parent / "src" / "lib" / "assets" / "room"
TILE = 16  # Kenney tiles are 16px on a 17px pitch; crops already sliced to 16px

# rug.png: 6x5 grid of the Kenney 3x3 rug set -- corners, edges, fill centers
RUG_PIECES = [
    ["rug-tl", "rug-t", "rug-t", "rug-t", "rug-t", "rug-tr"],
    ["rug-l", "rug-c", "rug-c", "rug-c", "rug-c", "rug-r"],
    ["rug-l", "rug-c", "rug-c", "rug-c", "rug-c", "rug-r"],
    ["rug-l", "rug-c", "rug-c", "rug-c", "rug-c", "rug-r"],
    ["rug-bl", "rug-b", "rug-b", "rug-b", "rug-b", "rug-br"],
]

BOOKSHELF_PIECES = [["bookshelf-1", "bookshelf-2", "bookshelf-3"]]

# bed.png: the Kenney designed pair (col 14, rows 5-6) -- the headboard/pillow
# tile stacks ABOVE the plain blanket slab. Stacked the other way around the
# bed reads top-half-below-bottom-half (user-reported 2026-10-08).
BED_PIECES = [["bed-half-head"], ["bed-half-body"]]

# character.png: the ambient room resident, assembled from the layered Kenney
# avatar kit (Roguelike Characters pack, 2026-10-09): every layer is authored
# on the same 16x16 grid, so the frame = char-base (skin/body) UNDER
# char-chest (orange shirt) UNDER nothing else; the two LEGS strips (a =
# together, b = apart) give stand/walk frames. Two frames stack into the
# 16x32 2-frame sheet the renderer toggles for the walk cycle.
CHAR_FRAMES = [
    ("char-stand", ["char-base", "char-chest", "char-legs-a"]),
    ("char-walk", ["char-base", "char-chest", "char-legs-b"]),
]


def compose(pieces: list[list[str]], out_name: str) -> None:
    rows = len(pieces)
    cols = len(pieces[0])
    sheet = Image.new("RGBA", (cols * TILE, rows * TILE), (0, 0, 0, 0))
    for r, row in enumerate(pieces):
        for c, piece in enumerate(row):
            tile = Image.open(ROOM / f"{piece}.png").convert("RGBA")
            if tile.size != (TILE, TILE):
                raise SystemExit(f"{piece}.png is {tile.size}, expected ({TILE},{TILE})")
            sheet.paste(tile, (c * TILE, r * TILE))
    sheet.save(ROOM / out_name)
    print(f"{out_name}: {sheet.size[0]}x{sheet.size[1]}")


def compose_overlay(layers: list[str], out_name: str) -> None:
    """Avatar-kit assembly: alpha-composite the layer pieces at one 16px
    frame. The kit (Roguelike Characters pack) authors every layer on the
    same 16x16 grid, so stacking reproduces Kenney's own assemblies."""
    frame = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    for piece in layers:
        tile = Image.open(ROOM / f"{piece}.png").convert("RGBA")
        if tile.size != (TILE, TILE):
            raise SystemExit(f"{piece}.png is {tile.size}, expected ({TILE},{TILE})")
        frame.alpha_composite(tile)
    frame.save(ROOM / out_name)
    print(f"{out_name}: {frame.size[0]}x{frame.size[1]}")


if __name__ == "__main__":
    compose(RUG_PIECES, "rug.png")
    compose(BOOKSHELF_PIECES, "bookshelf.png")
    compose(BED_PIECES, "bed.png")
    for frame_name, layers in CHAR_FRAMES:
        compose_overlay(layers, f"{frame_name}.png")
    compose([["char-stand"], ["char-walk"]], "character.png")