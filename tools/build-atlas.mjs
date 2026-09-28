#!/usr/bin/env node
/**
 * Compose the Codex pet atlas from the upstream pose artwork.
 *
 * Input : 30 transparent 420x420 WebP poses fetched by tools/fetch-upstream-assets.mjs
 * Output: 1536x2288 PNG, 8 columns x 11 rows, 192x208 cells (Codex spriteVersionNumber 2)
 *
 * Row layout and frame counts follow the Codex custom-pet format. Because the
 * upstream artwork is static, per-frame motion is synthesised geometrically
 * (breathe / bob / squash / offset) instead of being hand-drawn.
 *
 * Usage: node tools/build-atlas.mjs [--assets <dir>] [--out <file>]
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const SRC = path.resolve(argOf("--assets", path.join(HERE, "..", ".assets-cache")));
const OUT_FILE = path.resolve(argOf("--out", path.join(HERE, "..", "pets", "deepseek", "spritesheet.png")));
const OUT = path.dirname(OUT_FILE);
fs.mkdirSync(OUT, { recursive: true });

const CELL_W = 192, CELL_H = 208, COLS = 8, ROWS = 11;
const SCALE = 0.45;
const CANVAS = Math.round(420 * SCALE);   // 189
const MARGIN = 64;
const BASELINE = 193;                      // bottom anchor inside cell
const BW = CELL_W + MARGIN * 2, BH = CELL_H + MARGIN * 2;

const IDLE = "deepseek-idle.webp";
const BLINK = "frame-idle-blink.webp";
const CHEER = "reaction-cheerful.webp";
const CRY = "reaction-crying.webp";
const SKEPT = "reaction-skeptical.webp";
const DESK = "reaction-desk-coding.webp";
const DONE = "reaction-desk-done.webp";
const SHOCK = "reaction-shocked.webp";
const DASH = "reaction-whip-frightened.webp";

const S = (img, o = {}) => ({ img, dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, flip: false, anchor: "center", ...o });

// ---- row specs -------------------------------------------------------------
const rows = [];

// 0 idle: breathe + blink (durations 280,110,110,140,140,320)
rows.push([
  S(IDLE), S(BLINK), S(BLINK),
  S(IDLE, { dy: -2 }), S(IDLE, { dy: 1 }), S(IDLE),
]);

// 1 running-right
{
  const bob = [2, -5, 2, -5, 2, -5, 2, -2];
  const sq  = [0.97, 1, 0.97, 1, 0.97, 1, 0.97, 1];
  rows.push(bob.map((dy, i) => S(DASH, { dy, sy: sq[i], rot: i % 2 ? 3 : 4, dx: i % 2 ? 2 : 0, anchor: "bottom" })));
}
// 2 running-left (mirror of row 1)
{
  const bob = [2, -5, 2, -5, 2, -5, 2, -2];
  const sq  = [0.97, 1, 0.97, 1, 0.97, 1, 0.97, 1];
  rows.push(bob.map((dy, i) => S(DASH, { dy, sy: sq[i], rot: i % 2 ? -3 : -4, dx: i % 2 ? -2 : 0, flip: true, anchor: "bottom" })));
}
// 3 waving
rows.push([
  S(CHEER), S(CHEER, { rot: -4, dy: -2, dx: -3 }),
  S(CHEER, { rot: 4, dy: -2, dx: 3 }), S(CHEER),
]);
// 4 jumping
rows.push([
  S(SHOCK, { dy: 6, sy: 0.92, anchor: "bottom" }),
  S(SHOCK, { dy: -6, sy: 1.04, anchor: "bottom" }),
  S(SHOCK, { dy: -14, anchor: "bottom" }),
  S(SHOCK, { dy: -6, anchor: "bottom" }),
  S(SHOCK, { dy: 4, sy: 0.95, anchor: "bottom" }),
]);
// 5 failed
{
  const dy = [0, 2, 4, 5, 6, 6, 5, 4];
  const rot = [0, -1, 1, -1, 1, -1, 1, 0];
  const sy = [1, 1, 1, 0.99, 0.98, 0.98, 0.99, 1];
  rows.push(dy.map((d, i) => S(CRY, { dy: d, rot: rot[i], sy: sy[i] })));
}
// 6 waiting
{
  const rot = [0, -2, -3, -2, 0, 1];
  const dy = [0, -1, -2, -1, 0, 0];
  rows.push(rot.map((r, i) => S(SKEPT, { rot: r, dy: dy[i] })));
}
// 7 running (active task work)
{
  const dy = [0, -1, 0, -1, 0, -1];
  const rot = [0, -1, -2, -1, 0, 1];
  const dx = [0, 1, 0, -1, 0, 1];
  rows.push(dy.map((d, i) => S(DESK, { dy: d, rot: rot[i], dx: dx[i] })));
}
// 8 review
{
  const rot = [0, 2, 3, 2, 0, -1];
  const dy = [0, 1, 2, 1, 0, -1];
  rows.push(rot.map((r, i) => S(DONE, { rot: r, dy: dy[i] })));
}
// 9 + 10 look directions (0,22.5,...337.5 degrees clockwise from up)
{
  const R = 13, K = 5;
  const mk = (theta) => {
    const rad = (theta * Math.PI) / 180;
    return S(IDLE, { dx: Math.round(R * Math.sin(rad)), dy: Math.round(-R * Math.cos(rad)), rot: K * Math.sin(rad) });
  };
  const a = [], b = [];
  for (let i = 0; i < 8; i++) a.push(mk(i * 22.5));
  for (let i = 8; i < 16; i++) b.push(mk(i * 22.5));
  rows.push(a, b);
}

// ---- render -----------------------------------------------------------------
async function renderCell(spec) {
  let p = sharp(path.join(SRC, spec.img));
  if (spec.flip) p = p.flop();
  const w = Math.max(1, Math.round(CANVAS * spec.sx));
  const h = Math.max(1, Math.round(CANVAS * spec.sy));
  p = p.resize(w, h, { fit: "fill", kernel: "lanczos3" });
  if (spec.rot) p = p.rotate(spec.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const { data, info } = await p.png().toBuffer({ resolveWithObject: true });
  const left = Math.round(MARGIN + (CELL_W - info.width) / 2 + spec.dx);
  const top = spec.anchor === "bottom"
    ? Math.round(MARGIN + BASELINE - info.height + spec.dy)
    : Math.round(MARGIN + (CELL_H - info.height) / 2 + spec.dy);
  const big = await sharp({ create: { width: BW, height: BH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: data, left, top }])
    .png()
    .toBuffer();
  return sharp(big).extract({ left: MARGIN, top: MARGIN, width: CELL_W, height: CELL_H }).png().toBuffer();
}

(async () => {
  const rowBuffers = [];
  for (let r = 0; r < ROWS; r++) {
    const specs = rows[r] || [];
    const cells = [];
    for (let c = 0; c < COLS; c++) {
      if (c < specs.length) cells.push({ input: await renderCell(specs[c]), left: c * CELL_W, top: 0 });
    }
    // allowed extra cell: (row 0, col 6) neutral frame
    if (r === 0) cells.push({ input: await renderCell(S(IDLE)), left: 6 * CELL_W, top: 0 });
    rowBuffers.push(await sharp({ create: { width: CELL_W * COLS, height: CELL_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(cells).png().toBuffer());
  }
  const atlas = await sharp({ create: { width: CELL_W * COLS, height: CELL_H * ROWS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(rowBuffers.map((input, i) => ({ input, left: 0, top: i * CELL_H })))
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(OUT_FILE, atlas);
  const meta = await sharp(atlas).metadata();
  console.log("atlas", meta.width + "x" + meta.height, meta.format, meta.hasAlpha);
})();
