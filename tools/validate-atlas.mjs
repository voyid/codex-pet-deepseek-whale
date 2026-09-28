#!/usr/bin/env node
/**
 * Check a Codex pet atlas against the custom-pet format rules.
 *
 * Verifies: exact 1536x2288 size for a v2 pet, PNG/WebP container, alpha channel,
 * that used cells contain artwork, that unused cells are fully transparent, and
 * that fully transparent pixels carry no RGB residue.
 *
 * Usage: node tools/validate-atlas.mjs <atlas.png|atlas.webp>
 */
import sharp from "sharp";
import fs from "node:fs";

const CELL_W = 192, CELL_H = 208, COLS = 8;
const ROW_USE = { 0: 6, 1: 8, 2: 8, 3: 4, 4: 5, 5: 8, 6: 6, 7: 6, 8: 6, 9: 8, 10: 8 };
const ROW_NAME = {
  0: "idle", 1: "running-right", 2: "running-left", 3: "waving", 4: "jumping",
  5: "failed", 6: "waiting", 7: "running", 8: "review",
  9: "look-000-157.5", 10: "look-180-337.5",
};

const file = process.argv[2];
if (!file) { console.error("usage: node tools/validate-atlas.mjs <atlas>"); process.exit(2); }

const buf = fs.readFileSync(file);
const isPng = buf.subarray(1, 4).toString("ascii") === "PNG";
const isWebp = buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";

const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const errors = [], warnings = [];

console.log(`format=${isPng ? "PNG" : isWebp ? "WEBP" : "unknown"} size=${W}x${H}`);

if (!isPng && !isWebp) errors.push("container must be PNG or WebP");
if (W !== 1536) errors.push(`width must be 1536, got ${W}`);
if (![1872, 2288].includes(H)) errors.push(`height must be 1872 (v1) or 2288 (v2), got ${H}`);
if (H === 1872) warnings.push("8x9 atlas is an intermediate artifact; ship a v2 (2288) atlas");

let residue = 0;
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] === 0 && (data[i] || data[i + 1] || data[i + 2])) residue++;
}

const rows = Math.floor(H / CELL_H);
for (let r = 0; r < rows; r++) {
  const used = ROW_USE[r] ?? 0;
  for (let c = 0; c < COLS; c++) {
    let opaquePixels = 0;
    for (let y = 0; y < CELL_H; y++) {
      for (let x = 0; x < CELL_W; x++) {
        const px = ((r * CELL_H + y) * W + (c * CELL_W + x)) * C;
        if (data[px + 3] > 0) opaquePixels++;
      }
    }
    const inUse = c < used || (r === 0 && c === 6); // (0,6) may hold a neutral frame
    const label = `row ${r} (${ROW_NAME[r] ?? "?"}) col ${c}`;
    if (inUse && opaquePixels < 50) errors.push(`${label}: used cell is empty (${opaquePixels}px)`);
    if (!inUse && opaquePixels > 0) errors.push(`${label}: unused cell must be transparent (${opaquePixels}px)`);
  }
}
if (residue) warnings.push(`${residue} transparent pixels carry RGB residue (invisible, but some tooling flags it)`);

console.log(errors.length ? "ERRORS:\n - " + errors.join("\n - ") : "ERRORS: none");
if (warnings.length) console.log("WARNINGS:\n - " + warnings.join("\n - "));
process.exit(errors.length ? 1 : 0);
