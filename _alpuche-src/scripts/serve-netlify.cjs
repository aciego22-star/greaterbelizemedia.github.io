// Serves a --netlify build the way Netlify does: from the domain root, applying _headers,
// _redirects and 404.html, so the bundle can be tested locally before upload.
//   node _alpuche-src/scripts/serve-netlify.cjs [dir] [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist-netlify'));
const PORT = +(process.argv[3] || 8081);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

function parseHeaders() {
  const rules = [];
  let cur = null;
  for (const line of fs.readFileSync(path.join(ROOT, '_headers'), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: {} }; rules.push(cur); continue; }
    const i = line.indexOf(':');
    cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return rules;
}
const match = (pattern, p) => new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(p);
const headerRules = parseHeaders();
const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n').filter(Boolean).map((l) => l.trim().split(/\s+/));

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);
  for (const rule of headerRules) if (match(rule.pattern, p)) for (const [k, v] of Object.entries(rule.headers)) res.setHeader(k, v);
  for (const [from, to, code] of redirects) if (match(from, p)) { res.writeHead(+code, { Location: to }); return res.end(); }
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(400); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' + url.search }); return res.end(); }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file) || path.basename(file).startsWith('_')) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return res.end(fs.readFileSync(path.join(ROOT, '404.html')));
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Serving ${ROOT} at http://localhost:${PORT}/`));
