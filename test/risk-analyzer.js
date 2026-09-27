import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'ava';
import { execaNode } from 'execa';

const analyzerPath = fileURLToPath(new URL('../tools/risk-analyzer.js', import.meta.url));

function git(cwd, ...args) {
	execFileSync('git', args, { cwd, stdio: 'pipe' });
}

// Every fixture is a throwaway, self-contained git repository so the test
// never depends on the host's global git identity or on this repository's
// own history.
function initRepo(dir) {
	git(dir, 'init', '-q');
	git(dir, 'config', 'user.email', 'bob@example.com');
	git(dir, 'config', 'user.name', 'Bob');
}

function write(dir, relPath, content) {
	const full = path.join(dir, relPath);
	fs.mkdirSync(path.dirname(full), { recursive: true });
	fs.writeFileSync(full, content);
}

function commit(dir, message) {
	git(dir, 'add', '-A');
	git(dir, 'commit', '-q', '-m', message);
}

function commitWithDate(dir, message, isoDate) {
	execFileSync('git', ['add', '-A'], { cwd: dir, stdio: 'pipe' });
	execFileSync('git', ['commit', '-q', '-m', message, `--date=${isoDate}`], {
		cwd: dir,
		stdio: 'pipe',
		env: { ...process.env, GIT_COMMITTER_DATE: isoDate },
	});
}

function runAnalyzer(root, extraArgs = []) {
	return execaNode(analyzerPath, ['--root', root, '--coverage', 'coverage.json', '--output', 'out/report.json', ...extraArgs], {
		cwd: root,
		reject: false,
	});
}

test('risk-analyzer CLI: writes a statement-weighted overall coverage, not a naive per-file average', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir);
	write(dir, 'source/a.js', 'export function a(x) {\n  if (x) { return 1; }\n  return 2;\n}\n');
	write(dir, 'tools/b.js', 'export function b() { return 1; }\n');
	commit(dir, 'add fixture files');
	write(dir, 'coverage.json', JSON.stringify({
		[path.join(dir, 'source/a.js')]: { s: { 0: 1, 1: 0 } }, // 50%
		[path.join(dir, 'tools/b.js')]: { s: { 0: 0 } }, // 0%
	}));

	const result = await runAnalyzer(dir);
	t.is(result.exitCode, 0, result.stderr);

	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	t.is(report.files.length, 2);
	// 1 covered statement out of 3 total (source/a.js: 1/2, tools/b.js: 0/1)
	// => 33.3%, the statement-weighted total — not an unweighted mean of the
	// per-file percentages (50% and 0%), which would misleadingly read 25%.
	t.is(report.overallCoverage, 33.3);
	t.is(report.files.find(f => f.file === 'tools/b.js').status, 'pending');
	t.is(report.files.find(f => f.file === 'source/a.js').status, 'tested');

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: with equal churn and complexity, the coverage gap alone decides the ranking', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir);
	// Identical shape/size/complexity so churn and complexity contribute
	// equally to both files' scores; only coverage should differentiate them.
	write(dir, 'source/a.js', 'export function a() {\n  return 1;\n}\n');
	write(dir, 'tools/b.js', 'export function b() {\n  return 1;\n}\n');
	commit(dir, 'add fixture files');
	write(dir, 'coverage.json', JSON.stringify({
		[path.join(dir, 'source/a.js')]: { s: { 0: 1, 1: 0 } }, // 50%
		[path.join(dir, 'tools/b.js')]: { s: { 0: 0 } }, // 0%, fully untested
	}));

	const result = await runAnalyzer(dir);
	t.is(result.exitCode, 0, result.stderr);

	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	const a = report.files.find(f => f.file === 'source/a.js');
	const b = report.files.find(f => f.file === 'tools/b.js');
	t.is(a.churn, b.churn, 'fixture sanity check: churn must be equal');
	t.is(a.complexity, b.complexity, 'fixture sanity check: complexity must be equal');
	t.true(b.score > a.score, 'the fully untested file must score higher when churn/complexity are tied');
	t.is(report.files[0].file, 'tools/b.js');

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: follows a renamed file so its churn is not silently dropped', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir);
	write(dir, 'tools/old-name.js', 'export function f() {\n  return 1;\n}\n');
	commit(dir, 'add file');
	git(dir, 'mv', 'tools/old-name.js', 'tools/new-name.js');
	write(dir, 'tools/new-name.js', 'export function f() {\n  return 1;\n}\nexport function g() {\n  return 2;\n}\n');
	commit(dir, 'rename and extend');

	const result = await runAnalyzer(dir, ['--days', '3650']);
	t.is(result.exitCode, 0, result.stderr);

	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	const entry = report.files.find(f => f.file === 'tools/new-name.js');
	t.truthy(entry, 'the file should be tracked under its current name');
	t.true(entry.churn > 0, 'churn from before the rename must still be attributed to the file');
	t.falsy(report.files.find(f => f.file.includes('=>')), 'no entry should be keyed by the raw rename string');

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: a --days window in the past excludes older churn', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir);
	write(dir, 'source/old.js', 'export const a = 1;\n');
	// `--since` filters on committer date, so both author and committer dates
	// must be pushed into the deep past for a 1-day window to exclude it.
	commitWithDate(dir, 'old commit', '2000-01-01T00:00:00');

	const result = await runAnalyzer(dir, ['--days', '1']);
	t.is(result.exitCode, 0, result.stderr);
	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	t.is(report.files.find(f => f.file === 'source/old.js').churn, 0);

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: a repository with no commits yet does not crash', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir); // git init, but nothing committed and nothing tracked

	const result = await runAnalyzer(dir);
	t.is(result.exitCode, 0, result.stderr);
	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	t.deepEqual(report.files, []);
	t.is(report.overallCoverage, 0);

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: a directory that is not a git repository at all does not crash', async t => {
	// Regression test: `git ls-files` used to be unwrapped, so this used to
	// exit non-zero with an uncaught exception instead of a usable report.
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-not-git-'));
	write(dir, 'source/a.js', 'export const a = 1;\n');

	const result = await runAnalyzer(dir);
	t.is(result.exitCode, 0, result.stderr);
	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	t.deepEqual(report.files, []);

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: a missing coverage file is treated as 0% rather than crashing', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir);
	write(dir, 'source/a.js', 'export const a = 1;\n');
	commit(dir, 'add file');
	// Intentionally do not write coverage.json.

	const result = await runAnalyzer(dir);
	t.is(result.exitCode, 0, result.stderr);
	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	t.is(report.overallCoverage, 0);
	t.is(report.files[0].coverage, 0);
	t.is(report.files[0].status, 'pending');

	fs.rmSync(dir, { recursive: true, force: true });
});

test('risk-analyzer CLI: only considers source/ and tools/ files, excluding tests and dashboard output', async t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-analyzer-'));
	initRepo(dir);
	write(dir, 'source/a.js', 'export const a = 1;\n');
	write(dir, 'test/a.js', 'export const a = 1;\n');
	write(dir, 'dashboard/app.js', 'export const a = 1;\n');
	write(dir, 'random.js', 'export const a = 1;\n');
	commit(dir, 'add files');

	const result = await runAnalyzer(dir);
	t.is(result.exitCode, 0, result.stderr);
	const report = JSON.parse(fs.readFileSync(path.join(dir, 'out/report.json'), 'utf8'));
	t.deepEqual(report.files.map(f => f.file), ['source/a.js']);

	fs.rmSync(dir, { recursive: true, force: true });
});
