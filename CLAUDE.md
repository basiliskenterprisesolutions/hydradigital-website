# CLAUDE.md

Marketing site for **Hydra Digital Ltd** (Company No. SC903676), live at https://hydradigital.co.uk.

Forked on 23 Sep 2026 from `~/Documents/basilisk.software` (the Basilisk Software site) and rebranded: same content and structure, Hydra name/logo/contact details, green theme instead of blue. The copy is a placeholder until the site is polished, so expect it to diverge from the Basilisk site.

## Commands

```bash
npm run dev           # Vite dev server on 5173
npm run build         # tsc, client build, SSR build, prerender all routes + sitemap
npm run preview:dist  # serve dist/ the way Pages does, on 127.0.0.1:4322
npm run deploy        # build + wrangler pages deploy to project `hydradigital`
npm run lint
```

`npm run build` is the only check. Run it after every change.

## House style

No em-dashes anywhere; use `-`.

## Architecture

React 19 + Vite + TypeScript, `react-router-dom` v7, seven routes (homepage + six `/services/:slug`).

```
src/HomePage.tsx               Whole homepage: hero, services, portfolio, process, about, contact
src/ServicePage.tsx            /services/:slug template, driven by src/data/services.ts
src/components/SiteChrome.tsx  Header, footer, background canvas, cursor (every route)
src/data/services.ts           Service copy + SEO metadata, single source for routes/sitemap
src/entry-server.tsx           Build-time SSR entry + per-route title/meta/schema
scripts/prerender.mjs          Writes dist/index.html, dist/services/<slug>.html, sitemap.xml
functions/api/contact.ts       Contact form Pages Function (Resend)
logos/logo.svg                 Hydra symbol, white (original mark), viewBox cropped to 66 66 516 516 so it fills the hero like the Basilisk dragon; rotation centre is still 324,324. Header, spinning hero logo,
                               and the particle dragon in Contact all use this one file
```

**Prerendered.** Nothing in render scope may touch `window`, `document`, `Math.random()` or dates - keep it in `useEffect`. `entry-server.tsx` must render the same tree as `main.tsx`.

**`src/index.css` has duplicate rule blocks** for many selectors (two `:root` blocks among them). The later block wins; `grep -n` the selector and edit the winning one.

## Theme

Colours come from the Hydra logo pack (`~/Documents/Hydra Digital Logos/README.md`): emerald `#38C793`, deep green `#16745D`, mid `#239C77`, ink `#101D22`.

The winning `:root` (around line 1910 of `index.css`):

| Token | Value | Replaced Basilisk |
| --- | --- | --- |
| `--accent` | `#38c793` emerald | `#4d7eff` blue |
| `--accent-strong` | `#8ef5b8` mint | `#00e5c8` teal |
| `--accent-hot` | `#d4f25a` lime | `#ff4d88` pink |
| `--bg-elevated` / `--bg-soft` | `#0b1512` / `#07100d` | blue-black |

Canvas animations hardcode RGB triplets rather than using tokens: `56, 199, 147` (emerald), `142, 245, 184` (mint), `35, 156, 119` (mid) in `HomePage.tsx`, and particle hues `158/140/80` in `SiteChrome.tsx`. Change them alongside the tokens.

Favicons and `public/og-image.jpg` were generated from `Hydra Digital Logos/Existing Pack/Hydra Digital Symbol.png` and `Wallpapers/Hydra Digital Wallpaper.png`.

## Contact details

`contact@hydradigital.co.uk`, phone/WhatsApp +44 7459 876609 (shared with Basilisk). Appear in `SiteChrome.tsx` footer, `HomePage.tsx` contact section and `index.html` LocalBusiness schema.

## Contact form

`functions/api/contact.ts` sends via Resend using Pages secrets `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (`wrangler pages secret put <NAME> --project-name=hydradigital`). **Not configured yet**: until they are set, the form answers with a message telling visitors to email contact@hydradigital.co.uk. The from-address domain must be verified in Resend first.

## Analytics

None. The Basilisk GA4 tag and PostHog key were deliberately not carried over. `src/lib/posthog.ts` is dormant until `VITE_POSTHOG_KEY` is set in `.env.production`.

## Credit badge

Deliberately omitted at the user's request (23 Sep 2026). Do not add the basilisk-badge.

## Deployment

Cloudflare Pages project **`hydradigital`** (`hydradigital.pages.dev`), custom domains `hydradigital.co.uk` and `www.hydradigital.co.uk`. The `hydradigital.co.uk` zone is in the Basilisk Cloudflare account; its MX/TXT records are Google Workspace - never touch them.

```bash
npm run deploy
```

Repo: `basiliskenterprisesolutions/hydradigital-website`, commits straight to `main`.
