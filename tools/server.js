import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dashboard');
const types = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };

// Exported so tests can start an ephemeral, isolated instance instead of
// relying on the side-effecting top-level `listen()` this file used to run
// on import (which made it untestable and, if imported twice, would try to
// bind the same port twice).
export function createServer(dir = defaultDir) {
  return http.createServer((request, response) => {
    const name = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const file = path.resolve(dir, `.${name}`);
    // `startsWith(dir)` alone is a classic path-traversal footgun: a sibling
    // directory that merely shares `dir` as a string prefix (e.g. resolving
    // into `${dir}-secret/`) would pass the check. Requiring the platform
    // path separator after `dir` closes that gap without changing behavior
    // for any legitimate in-directory request.
    const withinDir = file === dir || file.startsWith(dir + path.sep);
    if (!withinDir || !fs.existsSync(file)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
    fs.createReadStream(file).pipe(response);
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, '0.0.0.0', () => console.log(`Dashboard: http://localhost:${port}`));
}
