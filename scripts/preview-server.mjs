/**
 * Local preview server that resolves extensionless URLs the way Cloudflare
 * Pages does, so /services/<slug> serves services/<slug>.html at that exact
 * URL. python3 -m http.server cannot do this: it 404s the clean URL, and
 * loading the .html directly makes react-router miss the route and render its
 * own "Page not found" over the prerendered markup.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'

const ROOT = process.argv[2]
const PORT = Number(process.argv[3] || 4322)
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript',
  '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.ico':'image/x-icon', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' }

const tryFiles = async (p) => {
  for (const c of [p, `${p}.html`, join(p, 'index.html')]) {
    try { if ((await stat(c)).isFile()) return c } catch {}
  }
  return null
}

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const hit = await tryFiles(join(ROOT, url === '/' ? 'index.html' : url))
  if (!hit) {
    const nf = join(ROOT, '404.html')
    try {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      return res.end(await readFile(nf))
    } catch { res.writeHead(404); return res.end('Not found') }
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(hit)] || 'application/octet-stream' })
  res.end(await readFile(hit))
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`))
