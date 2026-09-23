// Renders every route to static HTML at build time and writes each to its own
// file under dist/.
//
// Runs after both Vite builds: the client build (dist/) and the SSR build
// (dist-ssr/). Without this the served HTML body is just <div id="root"></div>,
// so Google indexes pages with no content - see the SEO notes in CLAUDE.md.
//
// Routes come from src/entry-server.tsx, which derives them from
// src/data/services.ts. Adding a service there is enough to get it built,
// indexed and written into sitemap.xml.
//
// Each service page is emitted as services/<slug>/index.html so Apache serves
// it directly at /services/<slug> with no rewrite rules.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')
const ssrEntry = resolve(root, 'dist-ssr/entry-server.js')
const ssrDir = resolve(root, 'dist-ssr')

const ROOT_DIV = '<div id="root"></div>'
const SITE = 'https://hydradigital.co.uk'

const { render, routes } = await import(ssrEntry)

const template = await readFile(join(distDir, 'index.html'), 'utf8')

if (!template.includes(ROOT_DIV)) {
  throw new Error(
    `Could not find ${ROOT_DIV} in dist/index.html. ` +
      'If the root element changed, update ROOT_DIV in scripts/prerender.mjs.',
  )
}

const escapeAttr = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const kb = (n) => `${(n / 1024).toFixed(1)} KB`

for (const route of routes) {
  const appHtml = render(route.path)

  if (!appHtml || appHtml.length < 1000) {
    throw new Error(
      `Prerender of ${route.path} produced suspiciously little markup ` +
        `(${appHtml?.length ?? 0} chars). Refusing to write a near-empty page.`,
    )
  }

  let html = template.replace(ROOT_DIV, `<div id="root">${appHtml}</div>`)

  // Service pages override the homepage's head; the homepage keeps its own.
  if (route.title) {
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(route.title)}</title>`)
      .replace(
        /(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/>)/,
        `$1${escapeAttr(route.description)}$2`,
      )
      .replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${route.canonical}" />`,
      )
      .replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
      )
      .replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
      )
      .replace(
        /<meta property="og:url" content="[^"]*" \/>/,
        `<meta property="og:url" content="${route.canonical}" />`,
      )
      .replace(
        /<meta name="twitter:title" content="[^"]*" \/>/,
        `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`,
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*" \/>/,
        `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
      )
  }

  if (route.schema) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">\n${JSON.stringify(route.schema, null, 2)}\n    </script>\n  </head>`,
    )
  }

  const outPath = join(distDir, route.outFile)
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, html, 'utf8')

  console.log(`prerender: ${route.path.padEnd(34)} -> ${route.outFile.padEnd(42)} ${kb(html.length)}`)
}

// lastmod is taken from the last commit that touched the sources a page is
// rendered from, not from the build date. Stamping the build date on every URL
// told Google all seven pages changed on every deploy, which is how a site
// teaches Google to ignore the field. This one is crawl-limited, so the signal
// that says "this page is genuinely new" is worth keeping truthful.
//
// Needs real git history, so the deploy workflow checks out with fetch-depth 0.
// Where that is unavailable it falls back to the build date, which is no worse
// than the behaviour this replaces.
const HOMEPAGE_SOURCES = ['index.html', 'src/HomePage.tsx']
const SERVICE_PAGE_SOURCES = ['src/ServicePage.tsx', 'src/data/services.ts']

const buildDate = new Date().toISOString().slice(0, 10)

const lastCommitDate = (paths) => {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null
  } catch {
    return null
  }
}

const homepageDate = lastCommitDate(HOMEPAGE_SOURCES)
const serviceDate = lastCommitDate(SERVICE_PAGE_SOURCES)

if (!homepageDate || !serviceDate) {
  console.warn(
    'prerender: no git history for lastmod, falling back to the build date. ' +
      'Check that the workflow checks out with fetch-depth: 0.',
  )
}

// sitemap.xml is generated from the same route list so it can never drift.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const isHome = route.path === '/'
    const lastmod = (isHome ? homepageDate : serviceDate) ?? buildDate

    return `  <url>
    <loc>${route.canonical}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isHome ? '1.0' : '0.8'}</priority>
  </url>`
  })
  .join('\n')}
</urlset>
`
await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8')
console.log(
  `prerender: sitemap.xml written with ${routes.length} URLs ` +
    `(home ${homepageDate ?? buildDate}, services ${serviceDate ?? buildDate})`,
)

await rm(ssrDir, { recursive: true, force: true })
