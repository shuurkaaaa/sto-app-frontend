#!/usr/bin/env python3
"""
Transform dbdiagram-export style ERD JPEG/PNG:
- Replace saturated blue headers with white
- Flip near-white pixels in those header stripes to dark (for readability)
Optionally draw FK line User.id <- Staff.userId (approx positions from scan).
Outputs PDF next to workspace assets.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


def is_header_blue(r: int, g: int, b: int) -> bool:
    """Match dbdiagram-ish navy header fill (JPEG compression tolerant)."""
    return b >= 65 and r <= 115 and g <= 155 and (b - r) >= 25


def process_rgb(im: Image.Image) -> Image.Image:
    w, h = im.size
    px = im.load()

    blue_mask_rows = [0] * h
    for y in range(h):
        c = 0
        for x in range(w):
            r, g, b = px[x, y]
            if is_header_blue(r, g, b):
                c += 1
        blue_mask_rows[y] = c

    threshold = max(8, int(w * 0.18))
    is_header_row = [c >= threshold for c in blue_mask_rows]

    # First pass: blue -> white
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if is_header_blue(r, g, b):
                px[x, y] = (255, 255, 255)

    # Second pass: in header rows, near-white text -> dark
    for y in range(h):
        if not is_header_row[y]:
            continue
        for x in range(w):
            r, g, b = px[x, y]
            if r >= 210 and g >= 210 and b >= 210:
                px[x, y] = (26, 26, 26)

    return im


def find_blue_clusters(im: Image.Image, cols=32, rows=24):
    """Return bbox centers sorted by approximate x,y for navy cells."""
    w, h = im.size
    bw, bh = max(1, w // cols), max(1, h // rows)
    hits: list[tuple[float, float, float]] = []
    for j in range(rows):
        for i in range(cols):
            x0, y0 = i * bw, j * bh
            cnt = total = 0
            pix = im.load()
            for yy in range(y0, min(y0 + bh, h), 4):
                for xx in range(x0, min(x0 + bw, w), 4):
                    r, g, b = pix[xx, yy]
                    total += 1
                    if is_header_blue(r, g, b):
                        cnt += 1
            frac = cnt / max(total, 1)
            if frac > 0.22:
                cx = x0 + bw // 2
                cy = y0 + bh // 2
                hits.append((cx, cy, frac))
    hits.sort(key=lambda t: (-t[0], t[1]))
    return hits


def draw_staff_user_link(im: Image.Image) -> None:
    """Heuristic FK hint: stripe near left (User stack) ↔ mid canvas (Staff area)."""
    w, h = im.size
    hits = find_blue_clusters(im.convert("RGB"), cols=32, rows=24)
    if len(hits) < 4:
        return
    west = [p for p in hits if p[0] < w * 0.32]
    if not west:
        west = hits
    west.sort(key=lambda t: (t[0], -t[2]))
    left = west[0]
    stall = [
        p
        for p in hits
        if 0.34 * w < p[0] < 0.72 * w and abs(p[1] - left[1]) < h * 0.45
    ]
    stall.sort(key=lambda p: abs(p[0] - 0.5 * w) + abs(p[1] - left[1]) * 0.15)
    if not stall:
        stall = sorted(hits, key=lambda p: abs(p[0] - 0.5 * w))
    target = stall[0]

    x1, y1 = int(left[0]), int(left[1])
    x2, y2 = int(target[0]), int(target[1])
    dr = ImageDraw.Draw(im)
    dr.line((x1, y1, x2, y2), fill=(38, 38, 38), width=3)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument(
        "-o",
        "--output",
        default="",
        help="Output PDF path (default: sto-app/assets/diploma-sto-crm-erd-white.pdf)",
    )
    args = ap.parse_args()

    src = Path(args.input).expanduser().resolve()
    img = Image.open(src).convert("RGB")

    # Draw FK hint on original colors so cluster detection still sees navy headers.
    link_src = img.copy()
    draw_staff_user_link(link_src)

    processed = process_rgb(link_src)

    if args.output:
        out_pdf = Path(args.output).expanduser().resolve()
    else:
        assets = Path(__file__).resolve().parents[1] / "assets" / "diploma-sto-crm-erd-white.pdf"
        out_pdf = assets

    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    processed.convert("RGB").save(
        str(out_pdf), "PDF", resolution=150.0, title="СТО CRM — ER-модель (білі заголовки)"
    )


if __name__ == "__main__":
    main()
