#!/usr/bin/env node
/**
 * Guards the design contract in docs/REDESIGN_BRIEF.md.
 * Fails the build on anything the brief bans outright.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const RULES = [
  { id: 'hex-colour',      re: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,        why: 'hard-coded hex — use the tokens in globals.css' },
  { id: 'tailwind-palette',re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|shadow|accent|decoration|placeholder)-(?:zinc|slate|gray|neutral|stone|yellow|amber|red|rose|orange|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|lime)-\d{2,3}\b/g, why: 'default Tailwind palette — use the tokens' },
  { id: 'font-black',      re: /\bfont-(?:black|extrabold)\b/g,                 why: 'weight stops at font-semibold' },
  { id: 'fat-radius',      re: /\brounded-(?:xl|2xl|3xl|full)\b/g,              why: 'max radius is rounded-lg (pill only on a status dot)' },
  { id: 'opacity-disabled',re: /\bopacity-(?:40|50|60)\b/g,                     why: 'use disabled tokens, not opacity — it destroys contrast' },
  { id: 'content-shadow',  re: /\bshadow-(?:sm|md|lg|xl|2xl)\b/g,               why: 'structure comes from rules; shadow only on Dialog' },
  { id: 'gradient-text',   re: /bg-clip-text|background-clip:\s*text/g,         why: 'gradient text is banned' },
  { id: 'glass',           re: /\bbackdrop-blur-(?:md|lg|xl|2xl|3xl)\b/g,       why: 'glassmorphism is banned' },
  { id: 'z-magic',         re: /\bz-\[?9{2,}\]?\b/g,                            why: 'use the semantic z-scale' },
  { id: 'confetti',        re: /canvas-confetti|\bconfetti\(/g,                 why: 'confetti is the AI-delight reflex' },
  { id: 'placeholder-copy',re: /Click Me|Lorem ipsum|TODO:|FIXME:|placeholder text/gi, why: 'placeholder copy shipped' },
];

// Files allowed to break a specific rule, with the reason.
const EXEMPT = {
  'src/components/ui/Dialog.tsx': ['content-shadow', 'hex-colour', 'glass'], // the one elevated surface
  'src/components/ui/Seal.tsx': ['fat-radius'],                              // a stamp is round
};

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (/\.(tsx?|css)$/.test(entry)) files.push(full);
  }
})(SRC);

const verbose = process.argv.includes('--verbose');
let failures = 0;
const tally = new Map();   // "file::rule" -> {count, sample, why}

/* ---- Referenced keyframes must exist. A missing @keyframes fails silently:
       the animation simply never runs, and the page looks "finished". ---- */
const css = readFileSync(join(SRC, 'app', 'globals.css'), 'utf8');
const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
const referenced = new Map();
for (const file of files) {
  if (file.endsWith('globals.css')) continue;
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/animate-\[([\w-]+)_/g)) referenced.set(m[1], file);
  for (const m of text.matchAll(/animation:\s*'?([\w-]+)\s/g)) referenced.set(m[1], file);
}
for (const [name, file] of referenced) {
  if (defined.has(name)) continue;
  failures++;
  console.log(`${relative(ROOT, file)}  [missing-keyframe]  ${name}`);
  console.log(`    referenced but never defined in globals.css — the animation silently never runs`);
}

for (const file of files) {
  const rel = relative(ROOT, file);
  if (rel.endsWith('globals.css')) continue; // the token source itself
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  for (const rule of RULES) {
    if (EXEMPT[rel]?.includes(rule.id)) continue;
    lines.forEach((line, i) => {
      if (line.trimStart().startsWith('*') || line.trimStart().startsWith('//')) return;
      const hits = line.match(rule.re);
      if (!hits) return;
      failures++;
      const key = `${rel}::${rule.id}`;
      const entry = tally.get(key) ?? { count: 0, line: i + 1, sample: [...new Set(hits)][0], why: rule.why };
      entry.count++;
      tally.set(key, entry);
      if (verbose) {
        console.log(`${rel}:${i + 1}  [${rule.id}]  ${[...new Set(hits)].join(', ')}`);
        console.log(`    ${rule.why}`);
      }
    });
  }
}

if (!verbose && tally.size) {
  const rows = [...tally.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [key, e] of rows) {
    const [rel, id] = key.split('::');
    console.log(`${String(e.count).padStart(4)}x  ${id.padEnd(18)} ${rel}  (first: line ${e.line}, e.g. "${e.sample}")`);
  }
  console.log('\nRun with --verbose for every hit.');
}
console.log(failures ? `\n${failures} violation(s) across ${tally.size} file/rule pair(s).` : '\nDesign contract clean.');
process.exit(failures ? 1 : 0);
