// Minimal static server that mimics Netlify's behaviour for local QA:
// directory index.html, pretty URLs with trailing-slash redirect, 404.html, _headers ignored.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || 4322);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.pdf': 'application/pdf',
};
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  let file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try {
    const st = fs.statSync(file);
    if (st.isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' + url.search }); return res.end(); }
      file = path.join(file, 'index.html');
    }
  } catch {
    if (!path.extname(p) && fs.existsSync(path.join(root, p, 'index.html'))) {
      res.writeHead(301, { Location: p + '/' + url.search }); return res.end();
    }
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      const nf = path.join(root, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
