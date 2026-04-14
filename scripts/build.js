#!/usr/bin/env node
// scripts/build.js
// Copies all source files into /dist, including the generated public/env.js.
// No bundler required — the app uses CDN React + Babel standalone.

const fs   = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

// ── Helpers ──────────────────────────────────────────────────────────────────
function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  mkdirp(dest);
  fs.readdirSync(src).forEach(f => {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : copyFile(s, d);
  });
}

// ── Clean dist ───────────────────────────────────────────────────────────────
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
mkdirp(DIST);

// ── Copy source ───────────────────────────────────────────────────────────────
const filesToCopy = [
  "index.html",
  "app.js",
];
filesToCopy.forEach(f => {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) copyFile(src, path.join(DIST, f));
});

const dirsToCopy = ["components", "pages", "utils", "assets"];
dirsToCopy.forEach(d => copyDir(path.join(ROOT, d), path.join(DIST, d)));

// ── Copy generated env.js ────────────────────────────────────────────────────
const envSrc = path.join(ROOT, "public", "env.js");
if (fs.existsSync(envSrc)) {
  copyFile(envSrc, path.join(DIST, "env.js"));
  console.log("[build] Copied env.js");
} else {
  // Write a safe empty fallback so the page still loads
  fs.writeFileSync(
    path.join(DIST, "env.js"),
    "window.__ENV__ = {};\n",
    "utf8"
  );
  console.warn("[build] env.js not found — wrote empty fallback");
}

console.log("[build] Done. Output →", DIST);
