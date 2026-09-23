import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App.tsx'
import { plainText, services } from './data/services'

// Build-time only. Driven by scripts/prerender.mjs, which renders each route
// below and writes it to its own HTML file so crawlers get real markup instead
// of an empty <div id="root">. Must produce the same tree as src/main.tsx or
// hydration will discard it.
export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}

const SITE = 'https://hydradigital.co.uk'

export type PrerenderRoute = {
  path: string
  outFile: string
  title: string
  description: string
  canonical: string
  schema: Record<string, unknown> | null
}

// The homepage keeps the <title>, description and LocalBusiness schema already
// in index.html, so it is emitted with no overrides.
export const routes: PrerenderRoute[] = [
  {
    path: '/',
    outFile: 'index.html',
    title: '',
    description: '',
    canonical: `${SITE}/`,
    schema: null,
  },
  ...services.map((service) => ({
    path: `/services/${service.slug}`,
    // services/<slug>.html, NOT services/<slug>/index.html. On Cloudflare Pages
    // a directory index is canonically the trailing-slash URL, so /services/x
    // would 308 to /services/x/ - and every canonical tag and sitemap entry
    // uses the slash-free form, which would make all six point at a redirect.
    // A flat .html file inverts that: Pages serves it at /services/x directly
    // and redirects the slash form to it. See the Prerendering note in
    // CLAUDE.md; this replaced an Apache rewrite that did the same job.
    outFile: `services/${service.slug}.html`,
    title: service.seoTitle,
    description: service.metaDescription,
    canonical: `${SITE}/services/${service.slug}`,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          '@id': `${SITE}/services/${service.slug}#service`,
          name: service.schemaName,
          description: service.metaDescription,
          serviceType: service.schemaName,
          provider: { '@id': `${SITE}/#business` },
          areaServed: [
            { '@type': 'City', name: 'Dundee' },
            { '@type': 'Country', name: 'United Kingdom' },
          ],
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: service.navLabel,
              item: `${SITE}/services/${service.slug}`,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: service.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            // plainText because answers may carry inline cross-link markup,
            // and structured data has to be prose rather than markup.
            acceptedAnswer: { '@type': 'Answer', text: plainText(faq.answer) },
          })),
        },
      ],
    },
  })),
]
