import test from 'ava';
import {
	normalize,
	parseNumstat,
	resolveRenamedPath,
	estimateComplexity,
	coverageByRelativePath,
	overallStatementCoverage,
	rankFiles,
	readJsonIfPresent,
} from '../tools/risk-lib.js';

// --- normalize -------------------------------------------------------------

test('normalize: empty input returns empty array', t => {
	t.deepEqual(normalize([]), []);
});

test('normalize: all-zero values normalize to zero instead of NaN', t => {
	// Division by a zero max would otherwise produce NaN for every entry,
	// which would poison every downstream score.
	t.deepEqual(normalize([0, 0, 0]), [0, 0, 0]);
});

test('normalize: scales values against the observed maximum', t => {
	t.deepEqual(normalize([0, 5, 10]), [0, 0.5, 1]);
});

test('normalize: a single value normalizes to 1', t => {
	t.deepEqual(normalize([7]), [1]);
});

// --- resolveRenamedPath / parseNumstat -------------------------------------

test('resolveRenamedPath: leaves plain paths untouched', t => {
	t.is(resolveRenamedPath('source/index.js'), 'source/index.js');
});

test('resolveRenamedPath: resolves a brace-style rename to the new path', t => {
	t.is(resolveRenamedPath('tools/{old.js => new.js}'), 'tools/new.js');
});

test('resolveRenamedPath: resolves a nested brace-style rename', t => {
	t.is(resolveRenamedPath('a/{b => c}/d.js'), 'a/c/d.js');
});

test('resolveRenamedPath: resolves a full-path rename with no shared prefix', t => {
	t.is(resolveRenamedPath('old-dir/file.js => tools/file.js'), 'tools/file.js');
});

test('parseNumstat: sums adds and deletes for a normal file', t => {
	const stats = parseNumstat('10\t2\tsource/index.js');
	t.is(stats.get('source/index.js'), 12);
});

test('parseNumstat: accumulates churn for a file touched across multiple commits', t => {
	const stats = parseNumstat([
		'10\t2\tsource/index.js',
		'',
		'3\t1\tsource/index.js',
	].join('\n'));
	t.is(stats.get('source/index.js'), 16);
});

test('parseNumstat: binary changes ("-\t-") count as zero churn, not NaN', t => {
	const stats = parseNumstat('-\t-\ttools/photo.png');
	t.is(stats.has('tools/photo.png'), false, 'non-js binaries are excluded by extension');
});

test('parseNumstat: ignores non-JS extensions', t => {
	const stats = parseNumstat('5\t0\tREADME.md');
	t.is(stats.size, 0);
});

test('parseNumstat: ignores test, coverage, and node_modules paths', t => {
	const stats = parseNumstat([
		'5\t0\ttest/chalk.js',
		'5\t0\ttests/chalk.js',
		'5\t0\tcoverage/report.js',
		'5\t0\tnode_modules/dep/index.js',
	].join('\n'));
	t.is(stats.size, 0);
});

test('parseNumstat: attributes a same-directory rename to its new path', t => {
	// Regression test: previously the raw "tools/{old.js => new.js}" string
	// was used as the map key. It doesn't even end in ".js" (it ends in "}"),
	// so the extension filter silently dropped all churn for the rename.
	const stats = parseNumstat('7\t0\ttools/{old.js => new.js}');
	t.is(stats.get('tools/new.js'), 7);
	t.is(stats.has('tools/{old.js => new.js}'), false);
});

test('parseNumstat: attributes a cross-directory rename to its new path', t => {
	const stats = parseNumstat('4\t1\told-dir/util.js => tools/util.js');
	t.is(stats.get('tools/util.js'), 5);
});

test('parseNumstat: merges churn for a file renamed then edited again under the new name', t => {
	const stats = parseNumstat([
		'2\t0\ttools/{old.js => new.js}',
		'1\t1\ttools/new.js',
	].join('\n'));
	t.is(stats.get('tools/new.js'), 4);
});

test('parseNumstat: ignores blank lines and unrelated log noise', t => {
	const stats = parseNumstat([
		'',
		'commit abc123',
		'',
		'6\t0\tsource/index.js',
	].join('\n'));
	t.is(stats.get('source/index.js'), 6);
});

// --- estimateComplexity ------------------------------------------------------

test('estimateComplexity: a straight-line function has baseline complexity 1', t => {
	t.is(estimateComplexity('export function a() { return 1; }'), 1);
});

test('estimateComplexity: counts if/for/while/case/catch and logical operators', t => {
	const source = `
		function f(x) {
			if (x) { return 1; }
			for (const y of x) { }
			while (x) { }
			try {} catch (e) {}
			return x && y || z ?? w;
		}
	`;
	// if, for, while, catch, &&, ||, ?? = 7 decisions + base 1
	t.is(estimateComplexity(source), 8);
});

test('estimateComplexity: ignores decision-like keywords inside comments', t => {
	const source = '// if (x) { for (;;) {} }\nfunction f() { return 1; }';
	t.is(estimateComplexity(source), 1);
});

test('estimateComplexity: ignores decision-like keywords inside block comments', t => {
	const source = '/* if (x) while (y) */ function f() { return 1; }';
	t.is(estimateComplexity(source), 1);
});

test('estimateComplexity: ignores decision-like keywords inside strings', t => {
	const source = 'const s = "if (x) { case: while }"; function f() { return 1; }';
	t.is(estimateComplexity(source), 1);
});

test('estimateComplexity: does not miscount optional chaining as a ternary', t => {
	const source = 'function f(x) { return x?.y; }';
	t.is(estimateComplexity(source), 1);
});

test('estimateComplexity: counts a real ternary as one decision', t => {
	const source = 'function f(x) { return x ? 1 : 2; }';
	t.is(estimateComplexity(source), 2);
});

// --- coverageByRelativePath ---------------------------------------------------

test('coverageByRelativePath: computes percentage and normalizes to posix-style relative paths', t => {
	const raw = {
		'/repo/source/index.js': { s: { 0: 1, 1: 1, 2: 0, 3: 0 } },
	};
	const result = coverageByRelativePath(raw, '/repo');
	t.is(result.get('source/index.js'), 50);
});

test('coverageByRelativePath: a file with zero statements is treated as fully covered', t => {
	const raw = { '/repo/source/empty.js': { s: {} } };
	const result = coverageByRelativePath(raw, '/repo');
	t.is(result.get('source/empty.js'), 100);
});

test('coverageByRelativePath: an empty coverage object yields an empty map', t => {
	const result = coverageByRelativePath({}, '/repo');
	t.is(result.size, 0);
});

test('coverageByRelativePath: known limitation — a Windows-style key is not resolved to a posix path on a posix host', t => {
	// `.replaceAll('\\', '/')` only cleans up separators Node itself inserts
	// when *this* platform's path.sep is "\\". On a posix host, path.relative
	// treats backslashes as literal filename characters (not separators), so
	// a coverage-final.json generated on Windows and consumed on Linux/macOS
	// (or vice versa) would produce a key that never matches a git-derived
	// posix path, silently making that file look completely untested. This
	// is a documented gap rather than a fix: this tool only ever runs
	// git ls-files and c8 on the same host, so the mismatch cannot occur in
	// the supported workflow — but it should not be assumed away.
	const raw = { 'C:\\repo\\source\\index.js': { s: { 0: 1 } } };
	const result = coverageByRelativePath(raw, 'C:\\repo');
	t.is(result.get('source/index.js'), undefined);
	t.is(result.size, 1, 'the entry exists, just filed under an unmatched key');
});

// --- overallStatementCoverage --------------------------------------------------

test('overallStatementCoverage: weights by statement count, not by per-file average', t => {
	// One large, well-tested file and one tiny, untested file. A naive mean of
	// per-file percentages would report 50%; the true weighted figure should
	// match c8's own "All files" statistic.
	const raw = {
		big: { s: Object.fromEntries(Array.from({ length: 96 }, (_, i) => [i, 1])) },
		small: { s: { 0: 0, 1: 0, 2: 0, 3: 0 } },
	};
	t.is(overallStatementCoverage(raw), 96);
});

test('overallStatementCoverage: an empty or missing coverage report is 0%, not NaN', t => {
	t.is(overallStatementCoverage({}), 0);
	t.is(overallStatementCoverage(undefined), 0);
});

test('overallStatementCoverage: a fully covered report is 100%', t => {
	const raw = { f: { s: { 0: 1, 1: 5 } } };
	t.is(overallStatementCoverage(raw), 100);
});

// --- rankFiles ------------------------------------------------------------

test('rankFiles: ranks by weighted score and reports 1-based ranks', t => {
	const files = ['a.js', 'b.js'];
	const churn = new Map([['a.js', 100], ['b.js', 0]]);
	const complexity = new Map([['a.js', 1], ['b.js', 1]]);
	const coverage = new Map([['a.js', 0], ['b.js', 100]]);
	const ranked = rankFiles({ files, churn, complexity, coverage });
	t.is(ranked[0].file, 'a.js');
	t.is(ranked[0].rank, 1);
	t.is(ranked[1].rank, 2);
});

test('rankFiles: marks a file with any coverage as tested and 0% as pending', t => {
	const files = ['a.js', 'b.js'];
	const churn = new Map();
	const complexity = new Map();
	const coverage = new Map([['a.js', 0.1], ['b.js', 0]]);
	const ranked = rankFiles({ files, churn, complexity, coverage });
	t.is(ranked.find(r => r.file === 'a.js').status, 'tested');
	t.is(ranked.find(r => r.file === 'b.js').status, 'pending');
});

test('rankFiles: defaults missing coverage entries to 0 (uninstrumented == untested)', t => {
	const ranked = rankFiles({
		files: ['a.js'],
		churn: new Map(),
		complexity: new Map(),
		coverage: new Map(),
	});
	t.is(ranked[0].coverage, 0);
	t.is(ranked[0].status, 'pending');
});

test('rankFiles: defaults missing complexity to 1, never 0', t => {
	const ranked = rankFiles({
		files: ['a.js'],
		churn: new Map(),
		complexity: new Map(),
		coverage: new Map([['a.js', 100]]),
	});
	t.is(ranked[0].complexity, 1);
});

test('rankFiles: ties are broken deterministically by filename', t => {
	// All files carry identical churn/complexity/coverage, so every score
	// ties. The result must not depend on input array order.
	const files = ['z.js', 'a.js', 'm.js'];
	const churn = new Map();
	const complexity = new Map();
	const coverage = new Map();
	const ranked = rankFiles({ files, churn, complexity, coverage });
	t.deepEqual(ranked.map(r => r.file), ['a.js', 'm.js', 'z.js']);
});

test('rankFiles: an all-zero churn/complexity input still produces a stable, coverage-driven order', t => {
	const files = ['covered.js', 'uncovered.js'];
	const churn = new Map();
	const complexity = new Map();
	const coverage = new Map([['covered.js', 100], ['uncovered.js', 0]]);
	const ranked = rankFiles({ files, churn, complexity, coverage });
	t.is(ranked[0].file, 'uncovered.js');
	t.true(ranked.every(r => Number.isFinite(r.score)));
});

test('rankFiles: an empty file list produces an empty ranking', t => {
	const ranked = rankFiles({ files: [], churn: new Map(), complexity: new Map(), coverage: new Map() });
	t.deepEqual(ranked, []);
});

// --- readJsonIfPresent ------------------------------------------------------

test('readJsonIfPresent: returns an empty object when the file is missing', t => {
	t.deepEqual(readJsonIfPresent('/definitely/not/a/real/path.json'), {});
});

test('readJsonIfPresent: parses an existing JSON file', async t => {
	const fs = await import('node:fs');
	const os = await import('node:os');
	const path = await import('node:path');
	const file = path.join(os.tmpdir(), `risk-lib-test-${process.pid}-${Date.now()}.json`);
	fs.writeFileSync(file, JSON.stringify({ ok: true }));
	t.deepEqual(readJsonIfPresent(file), { ok: true });
	fs.unlinkSync(file);
});
