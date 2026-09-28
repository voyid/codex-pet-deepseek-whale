#!/usr/bin/env node
/**
 * Download the upstream pose artwork that tools/build-atlas.mjs consumes.
 *
 * Source: https://github.com/keleus/deepseek-pet (MIT, (c) 2026 keleus)
 * Path  : src/client/assets/*.webp  (30 transparent 420x420 poses)
 *
 * The upstream raw.githubusercontent.com host is unreachable from some networks,
 * so files are pulled through the GitHub contents API instead.
 *
 * Usage: node tools/fetch-upstream-assets.mjs [--out <dir>] [--ref <git-ref>]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf(n); return i !== -1 && argv[i + 1] ? argv[i + 1] : d; };

const REF = argOf("--ref", "65d02e17097a5b34ee52cf985657b37989a5ca34");
const OWNER = "keleus", REPO_NAME = "deepseek-pet", DIR = "src/client/assets";
const OUT = path.resolve(argOf("--out", path.join(HERE, "..", ".assets-cache")));

const api = (p) => `https://api.github.com/repos/${OWNER}/${REPO_NAME}/${p}`;
const headers = { "User-Agent": "codex-pet-deepseek-whale", Accept: "application/vnd.github+json" };

fs.mkdirSync(OUT, { recursive: true });

const listRes = await fetch(api(`contents/${DIR}?ref=${REF}`), { headers });
if (!listRes.ok) throw new Error(`listing failed: ${listRes.status} ${await listRes.text()}`);
const entries = await listRes.json();

let saved = 0;
for (const entry of entries) {
  if (!entry.name.endsWith(".webp")) continue;
  const dest = path.join(OUT, entry.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size === entry.size) continue;
  const res = await fetch(api(`contents/${entry.path}?ref=${REF}`), { headers });
  const json = await res.json();
  if (!json.content) throw new Error(`no content for ${entry.name}`);
  fs.writeFileSync(dest, Buffer.from(json.content, "base64"));
  saved++;
  process.stdout.write(".");
}

fs.writeFileSync(path.join(OUT, "SOURCE.txt"), [
  "Artwork downloaded from https://github.com/" + OWNER + "/" + REPO_NAME,
  "MIT License, Copyright (c) 2026 keleus <jen.hs@outlook.com>",
  "Ref: " + REF,
  "Path: " + DIR,
  "",
].join("\n"));

console.log(`\n${saved} file(s) downloaded to ${OUT} (${entries.length} available)`);
