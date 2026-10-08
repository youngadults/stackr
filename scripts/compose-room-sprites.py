#!/usr/bin/env python3
"""Compose multi-tile room sprites from the 16px piece crops in assets/room.

Run from the repo root:  python3 scripts/compose-room-sprites.py
Writes:
  src/lib/assets/room/rug.png        (96x80,  6x5 tiles)
  src/lib/assets/room/bookshelf.png  (48x16,  3x1 tiles)

One sprite per object: the renderer places a single <img> per object instead
of stacking per-tile entries, and the item catalog (src/lib/room/catalog.ts)
carries the composed sprite with its native pixel size + footprint. The piece
crops stay in assets/ room as the composition source and provenance.
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


if __name__ == "__main__":
    compose(RUG_PIECES, "rug.png")
    compose(BOOKSHELF_PIECES, "bookshelf.png")