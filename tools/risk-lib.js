import fs from 'node:fs';
import path from 'node:path';

export function normalize(values) {
  if (!values.length) return [];
  const max = Math.max(...values);
  return max === 0 ? values.map(() => 0) : values.map(v => v / max);
}

// `git log --numstat` reports renames as either a brace-diff with a shared
// prefix/suffix (e.g. "tools/{old.js => new.js}" or "a/{b => c}/d.js") or,
// when there is no shared path, as a plain "old/path.js => new/path.js".
// Without resolving these, the raw string never matches a real file (the
// brace form doesn't even end in a real extension) and churn for renamed
// files silently disappears from the ranking instead of following the file
// to its current path.
export function resolveRenamedPath(rawPath) {
  const braceMatch = rawPath.match(/^(.*)\{.*? => (.*?)\}(.*)$/);
  if (braceMatch) {
    const [, prefix, replacement, suffix] = braceMatch;
    return `${prefix}${replacement}${suffix}`;
  }
  const arrowIndex = rawPath.indexOf(' => ');
  if (arrowIndex !== -1) {
    return rawPath.slice(arrowIndex + 4);
  }
  return rawPath;
}

export function parseNumstat(text) {
  const stats = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(\d+|-)\s+(\d+|-)\s+(.+)$/);
    if (!m) continue;
    const [, add, del, rawFile] = m;
    const file = resolveRenamedPath(rawFile);
    if (!/\.(?:js|mjs|cjs|jsx)$/.test(file) || /(^|\/)(?:test|tests|coverage|node_modules)(\/|$)/.test(file)) continue;
    // Binary changes are reported as "-\t-\tfile"; count them as zero churn
    // (they still pass through the extension filter above) instead of
    // producing NaN.
    const delta = (add === '-' ? 0 : Number(add)) + (del === '-' ? 0 : Number(del));
    stats.set(file, (stats.get(file) || 0) + delta);
  }
  return stats;
}

// Lightweight approximation; swap with eslint complexity or plato if desired.
export function estimateComplexity(source) {
  const clean = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g, '');
  const decisions = clean.match(/\b(?:if|for|while|case|catch)\b|\?\?|\?[^.:]|&&|\|\|/g) || [];
  return 1 + decisions.length;
}

export function coverageByRelativePath(raw, root = process.cwd()) {
  const result = new Map();
  for (const [filename, data] of Object.entries(raw || {})) {
    const statements = Object.values(data.s || {});
    const pct = statements.length ? (statements.filter(n => n > 0).length / statements.length) * 100 : 100;
    result.set(path.relative(root, filename).replaceAll('\\', '/'), pct);
  }
  return result;
}

// c8/istanbul's own "All files" total is the number of covered statements
// divided by total statements across every instrumented file (weighted by
// file size). Averaging the already-collapsed per-file percentages instead
// (one file, one vote) massively overweights tiny files: in this repository
// three ~15-60 statement tools/*.js files at 0% coverage pull a naive mean
// down to ~42% even though the real, size-weighted figure is ~67%. Always
// compute the headline number from raw statement counts, never from an
// average of per-file percentages.
export function overallStatementCoverage(raw) {
  let total = 0;
  let covered = 0;
  for (const data of Object.values(raw || {})) {
    const statements = Object.values(data.s || {});
    total += statements.length;
    covered += statements.filter(n => n > 0).length;
  }
  return total ? (covered / total) * 100 : 0;
}

export function rankFiles({ files, churn, complexity, coverage }) {
  const churnN = normalize(files.map(f => churn.get(f) || 0));
  const complexityN = normalize(files.map(f => complexity.get(f) || 1));
  return files.map((file, i) => {
    const cov = coverage.has(file) ? coverage.get(file) : 0;
    const coverageRisk = 1 - Math.min(100, Math.max(0, cov)) / 100;
    const score = 100 * (0.4 * churnN[i] + 0.3 * complexityN[i] + 0.3 * coverageRisk);
    return {
      rank: 0, file, score: Number(score.toFixed(1)),
      churn: churn.get(file) || 0,
      complexity: complexity.get(file) || 1,
      coverage: Number(cov.toFixed(1)),
      status: cov > 0 ? 'tested' : 'pending'
    };
  })
    // Break score ties deterministically (alphabetically by file) instead of
    // relying on git ls-files order via Array#sort's stability. Two files can
    // legitimately land on the same rounded score, and the ranking should not
    // silently depend on filesystem enumeration order.
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function readJsonIfPresent(filename) {
  return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
}
