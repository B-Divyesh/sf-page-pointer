# Independent verification 7 — PASS

**Candidate:** `53082b1a8c39e1638cbe6ba143cdf748d08ab701` (`docs: record polish 2 evidence`)

**Live URL:** https://page-pointer.sociobot.in

**Verified:** 2026-08-30 UTC from a clean dependency install. Product code was not changed.

## Release decision

**PASS.** The candidate meets the researched brief's smallest useful product: a local-first rear-camera reading guide for printed physical books, with an isolated one-click sample guide. The live deployment is the tested build, not a stale or deployment-only variant.

## Required first checks

- `.factory/claims.json` exists and declares 13 claims.
- Every declared command was run individually after `npm ci`; all passed. The final Playwright run records `{"status":"passed","failedTests":[]}`.
- Cold first read of the live desktop page: it says that it marks the current word in a physical book, names parents/tutors/emerging readers, and presents `Try it with sample data`; the adjacent copy says it opens a short story. This is a one-click demo and answers what it does, who it is for, and what to click first in plain words.

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-reset` | PASS |
| `local-ink-detection` | PASS |
| `camera-states` | PASS |
| `local-only-reading` | PASS |
| `local-data-roundtrip` | PASS |
| `offline-demo` | PASS |
| `pwa-update` | PASS |
| `free-core` | PASS |
| `paid-supporter` | PASS |
| `license-verification-transfer` | PASS |
| `license-cache-24h` | PASS |
| `private-runtime` | PASS |

## Local build and functional checks

- `npm ci`: PASS; 0 audited vulnerabilities.
- `npm test`: PASS, 12/12 Vitest tests.
- `npm run build`: PASS; TypeScript check and Vite production build completed into `dist/`.
- `npm run test:e2e`: PASS, 30 Playwright tests across 390 px mobile and desktop. This covers normal guide use, invalid import/recovery, camera denied/missing/blank-frame states, data cap/erase/import/export, keyboard operation, route/back focus handling, PWA update, and the isolated offline context.
- `npm run test:billing`: PASS; production and pilot catalogues both reported INR 249.00 and HTTP 303 hosted-checkout redirects.
- No lint script is defined in `package.json`; the build's `tsc --noEmit` is the available type check.

## Live deployment, privacy, PWA, and accessibility

- Fresh local `dist/index.html` and live `/` have the same SHA-256: `477b6afae51816d0951f89aa462fae3d73f5ad95d3f3049bebe44604dddaf19c` (both v1.1.3). This clears the earlier deployment-only concern.
- Live `/demo` request log contained only `page-pointer.sociobot.in` documents, self-hosted image/font assets, and no requests after moving the guide. No console or page errors occurred.
- Live response headers include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera-only permissions policy. Hashed/static assets are `max-age=31536000, immutable`; `sw.js` is `no-cache`.
- Live PWA check: service worker controls the page; cache `page-pointer-v1.1.3-shell` exists; manifest is standalone with 192/512 maskable icons. After first visit, an offline `/demo` reload returned 200 from the worker cache and Next moved the guide without errors.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, exactly one h1 and main, no unlabeled buttons or missing image alt text, and no console errors.
- Fresh Axe Playwright scans of `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: zero serious or critical violations. At 390 px, `scrollWidth == clientWidth == 390`; keyboard tests cover the skip link, guide movement, and visible focus. The reduced-motion CSS disables transitions/animations.

## Performance and cache budgets

- Production JS: 32.94 KB raw / 11.31 KB gzip (under 200 KB).
- Production CSS: 19.74 KB raw / 5.36 KB gzip (under 50 KB).
- Self-hosted WOFF2 fonts total 49.8 KB (under 120 KB).
- Mobile hero AVIF: 27.2 KB (under 300 KB).

## Server allowance

The only product-initiated server API is Sociobot license verification. Fresh production verification requests 1–31 returned HTTP 200; request 32 returned **HTTP 429** with **`Retry-After: 3`**. Observed burst allowance: 31 successful requests for this check, then enforced backoff.

## Defects

No release-blocking, high, medium, or low defects found. No known gaps.
