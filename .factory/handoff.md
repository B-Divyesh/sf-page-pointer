# Page Pointer v1.1.0 repair handoff

## Repair scope

This repair resolves every finding in independent verification report
`2dc59acbbc268648d826e1b55489062ba9f3ad89` against candidate
`610e760e013205391830e878653ca490d74a7c14`.

- Added `.factory/claims.json` with five executable `@claim:` Playwright
  regressions. They cover the direct sample demo, reset/discard behavior,
  local-only reading data, offline use, and free-core/₹249 pricing copy.
- Made `/demo` and `/?demo=1` direct, immediately usable sample routes. They
  use only `demo:page-pointer` IndexedDB, never read real reading data, have
  the required persistent banner, and delete demo data on Reset or Start for
  real. `.factory/demo.md` documents the sample and namespace.
- Rewrote the initial screen: it names parents, tutors, and emerging readers,
  states the physical-book job, and exposes **Try it with sample data** with
  its outcome. `.factory/copy-audit.md` records the first-screen audit.
- Added the Static Web Apps configuration with CSP, Permissions-Policy,
  HSTS, Referrer-Policy, nosniff, immutable hashed-asset caching, manifest
  media type, explicit `/demo`/legal rewrites, and a real 404 response. The
  build copies this configuration to `dist/`.
- Added a styled static 404, complete header navigation (Demo, Privacy,
  Terms) on every route, sitemap coverage for `/demo`, route-specific demo
  title, and keyboard regression coverage. Space now advances the guide
  consistently; Enter remains the viewfinder placement key.

## How to run

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

The static deployment artifact is `dist/`, with `dist/index.html` at its
root and `dist/staticwebapp.config.json` alongside it.

## Verification evidence

Run after the final clean install on 2026-08-29:

- `npm ci`: passed; `npm audit` reported **0 vulnerabilities**.
- `npm test`: **4/4** Vitest tests passed, including deployment header/404
  configuration coverage and the existing text-detection tests.
- `npm run build`: passed type checking and produced `dist/`; JS is **30.51
  KB** (**10.94 KB gzip**) and CSS is **19.13 KB** (**5.26 KB gzip**).
- `npm run test:e2e`: **14/14** passed on Pixel 5 (393 px) and desktop
  Chromium. It includes all five `@claim:` contracts, direct `/demo`,
  IndexedDB namespace inspection, Reset/Start-for-real discard behavior,
  same-origin request recording, JSON export inspection, offline reload,
  keyboard navigation, and axe scans for home, demo, privacy, terms, and 404.
  Axe reported zero serious or critical violations.
- `/opt/fleet/lib/verify-url.sh` against the built local preview returned
  HTTP 200, zero console/page errors, `lang=en`, one h1, one main landmark,
  and no images without alt text at desktop and 390 px.
- Lighthouse 12.8.2 local mobile JSON reported Performance **100**,
  Accessibility **100**, Best Practices **100**, and SEO **100**; LCP was
  **1.4 s** and CLS **0.032**. Chrome logged a late target-crash while taking
  the final screenshot after it wrote the report; the score JSON is retained
  at `/tmp/page-pointer-lighthouse.json` in this worker.
- The standalone `@axe-core/cli` was attempted with the supplied Chromium,
  but Selenium could not create a Chrome session in this container. The
  repository's `@axe-core/playwright` scan above is the authoritative browser
  axe evidence and passed at both viewport classes.

## Deployment and live verification

Deploy `dist/` with `/opt/fleet/lib/deploy-static.sh page-pointer dist` after
the repair commit is pushed. Record the resulting production HTTP/header,
route, demo, and identity checks below after deployment.

## Known gaps / next steps

- Detection remains a deliberately lightweight local contrast heuristic, not
  OCR. It should be tested with more real pages, lighting, curvature, and
  phone cameras; manual tapping and stepping remain the supported fallback.
- The brief's family field study (20 sessions and parent re-orientation data)
  cannot be completed in this build environment.
- The factory still needs to register the `page-pointer` paid product and its
  return URL before real sales. Production uses the Sociobot billing API only
  on the production hostname; non-production uses the pilot API.
