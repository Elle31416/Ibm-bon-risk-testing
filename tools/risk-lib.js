import fs from 'node:fs';
import path from 'node:path';

export function normalize(values) {
  if (!values.length) return [];
  const max = Math.max(...values);
  return max === 0 ? values.map(() => 0) : values.map(v => v / max);
}

export function parseNumstat(text) {
  const stats = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(\d+|-)\s+(\d+|-)\s+(.+)$/);
    if (!m) continue;
    const [, add, del, file] = m;
    if (!/\.(?:js|mjs|cjs|jsx)$/.test(file) || /(^|\/)(?:test|tests|coverage|node_modules)(\/|$)/.test(file)) continue;
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
  }).sort((a, b) => b.score - a.score).map((row, i) => ({ ...row, rank: i + 1 }));
}

export function readJsonIfPresent(filename) {
  return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
}
