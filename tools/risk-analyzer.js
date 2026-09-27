#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { coverageByRelativePath, estimateComplexity, parseNumstat, rankFiles, readJsonIfPresent } from './risk-lib.js';

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
const root = path.resolve(arg('--root', '.'));
const coverageFile = path.resolve(root, arg('--coverage', 'coverage/coverage-final.json'));
const output = path.resolve(root, arg('--output', 'dashboard/risk-report.json'));
const days = arg('--days', '180');

let log = '';
try {
  log = execFileSync('git', ['log', `--since=${days} days ago`, '--numstat', '--format='], { cwd: root, encoding: 'utf8' });
} catch { console.warn('Warning: git history unavailable; churn will be zero.'); }
const churn = parseNumstat(log);
const files = execFileSync('git', ['ls-files', '*.js', '*.mjs', '*.cjs', '*.jsx'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean)
  .filter(f => /^(?:source|tools)\//.test(f))
  .filter(f => !/(^|\/)(?:test|tests|coverage|node_modules|dashboard)(\/|$)/.test(f));
const complexity = new Map(files.map(file => [file, estimateComplexity(fs.readFileSync(path.join(root, file), 'utf8'))]));
const coverage = coverageByRelativePath(readJsonIfPresent(coverageFile), root);
const ranked = rankFiles({ files, churn, complexity, coverage });
const covered = [...coverage.values()];
const overallCoverage = covered.length ? covered.reduce((a, b) => a + b, 0) / covered.length : 0;
const report = { generatedAt: new Date().toISOString(), weights: { churn: 0.4, complexity: 0.3, coverageGap: 0.3 }, overallCoverage: Number(overallCoverage.toFixed(1)), files: ranked };
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2));
console.table(ranked.slice(0, 10));
console.log(`Overall coverage: ${report.overallCoverage}%`);
console.log(`Report: ${path.relative(root, output)}`);
