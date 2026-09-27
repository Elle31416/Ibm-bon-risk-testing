import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'ava';
import { createServer } from '../tools/server.js';

function makeFixtureDir() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'risk-dashboard-'));
	fs.writeFileSync(path.join(dir, 'index.html'), '<h1>dashboard</h1>');
	fs.writeFileSync(path.join(dir, 'risk-report.json'), JSON.stringify({ ok: true }));
	fs.writeFileSync(path.join(dir, 'style.css'), 'body{}');
	fs.writeFileSync(path.join(dir, 'app.js'), 'console.log(1)');
	fs.writeFileSync(path.join(dir, 'data.bin'), Buffer.from([1, 2, 3]));
	return dir;
}

async function withServer(t, run) {
	const dir = makeFixtureDir();
	const server = createServer(dir);
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	const { port } = server.address();
	t.teardown(() => new Promise(resolve => server.close(resolve)));
	await run(`http://127.0.0.1:${port}`, dir);
}

test('createServer: GET / serves index.html with an HTML content type', async t => {
	await withServer(t, async base => {
		const response = await fetch(base + '/');
		t.is(response.status, 200);
		t.is(response.headers.get('content-type'), 'text/html');
		t.is(await response.text(), '<h1>dashboard</h1>');
	});
});

test('createServer: GET /risk-report.json serves JSON with the right content type', async t => {
	await withServer(t, async base => {
		const response = await fetch(base + '/risk-report.json');
		t.is(response.status, 200);
		t.is(response.headers.get('content-type'), 'application/json');
		t.deepEqual(await response.json(), { ok: true });
	});
});

test('createServer: strips query strings before resolving the file', async t => {
	await withServer(t, async base => {
		const response = await fetch(base + '/risk-report.json?cachebust=123');
		t.is(response.status, 200);
	});
});

test('createServer: serves known extensions with the right content type', async t => {
	await withServer(t, async base => {
		const css = await fetch(base + '/style.css');
		t.is(css.headers.get('content-type'), 'text/css');
		const js = await fetch(base + '/app.js');
		t.is(js.headers.get('content-type'), 'text/javascript');
	});
});

test('createServer: falls back to text/plain for an unrecognized extension', async t => {
	await withServer(t, async base => {
		const response = await fetch(base + '/data.bin');
		t.is(response.status, 200);
		t.is(response.headers.get('content-type'), 'text/plain');
	});
});

test('createServer: 404s for a file that does not exist', async t => {
	await withServer(t, async base => {
		const response = await fetch(base + '/missing.html');
		t.is(response.status, 404);
		t.is(await response.text(), 'Not found');
	});
});

test('createServer: 404s a path-traversal attempt instead of serving files outside the dashboard dir', async t => {
	await withServer(t, async (base, dir) => {
		// Plant a "secret" one directory above the served root to prove it is
		// unreachable, not merely absent.
		const secretPath = path.join(path.dirname(dir), `secret-${path.basename(dir)}.txt`);
		fs.writeFileSync(secretPath, 'top secret');
		t.teardown(() => fs.rmSync(secretPath, { force: true }));

		const response = await fetch(base + '/../' + path.basename(secretPath));
		t.is(response.status, 404);
	});
});

test('createServer: 404s a request for a same-prefix sibling directory (not just literal "..")', async t => {
	// Regression test for the startsWith(dir) footgun: a sibling directory
	// like "<dir>-evil" is a *string* prefix match of "<dir>" but must not be
	// treated as being inside it.
	await withServer(t, async (base, dir) => {
		const siblingDir = `${dir}-evil`;
		fs.mkdirSync(siblingDir);
		fs.writeFileSync(path.join(siblingDir, 'secret.txt'), 'top secret');
		t.teardown(() => fs.rmSync(siblingDir, { recursive: true, force: true }));

		const response = await fetch(base + `/../${path.basename(siblingDir)}/secret.txt`);
		t.is(response.status, 404);
	});
});

test('createServer: two independent instances can run on different ports without colliding', async t => {
	const dirA = makeFixtureDir();
	const dirB = makeFixtureDir();
	fs.writeFileSync(path.join(dirB, 'index.html'), '<h1>b</h1>');
	const serverA = createServer(dirA);
	const serverB = createServer(dirB);
	await Promise.all([
		new Promise(resolve => serverA.listen(0, '127.0.0.1', resolve)),
		new Promise(resolve => serverB.listen(0, '127.0.0.1', resolve)),
	]);
	t.teardown(() => Promise.all([
		new Promise(resolve => serverA.close(resolve)),
		new Promise(resolve => serverB.close(resolve)),
	]));

	const [a, b] = await Promise.all([
		fetch(`http://127.0.0.1:${serverA.address().port}/`).then(r => r.text()),
		fetch(`http://127.0.0.1:${serverB.address().port}/`).then(r => r.text()),
	]);
	t.is(a, '<h1>dashboard</h1>');
	t.is(b, '<h1>b</h1>');
});
