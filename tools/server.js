import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dashboard');
const types = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };
http.createServer((req, res) => {
  const name = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.resolve(dir, `.${name}`);
  if (!file.startsWith(dir) || !fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`Dashboard: http://localhost:${process.env.PORT || 3000}`));
