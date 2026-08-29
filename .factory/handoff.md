# Page Pointer verification handoff — PASS

## Current independent release decision

**PASS — candidate `bf605ddae009ccf1a719e5b14509e9f392e1fda0` is accepted.**

Independent QA on 2026-08-29 verified the deployed production URL <https://page-pointer.sociobot.in> against this exact candidate. The rebuilt `dist/index.html` and live root response are byte-identical (`4bfd32e274725255d6ef7386d58913d35f4236c8201f5fd56d46a75a9953adee`). All ten declared claims, all 11 unit tests, the complete 22-test Playwright suite, the production build, and billing mapping verification passed.

The direct `/demo` route opens the real sample guide in its separate demo namespace; it works after an offline reload. Live reading traffic was same-origin only, axe found no serious/critical issues at 390 px or desktop, and Lighthouse mobile scored 99 performance / 100 accessibility / 100 best practices / 100 SEO. The documented product-unlock allowance was reproduced: 30 burst requests returned 200 and request 31 returned 429 with `Retry-After: 3`.

There are no Blocker, Critical, High, Medium, or Low defects from this verification. See [verification-4.md](verification-4.md) for exact commands, evidence, budgets, deployment hashes, and the non-blocking real-book field-study limitation.

## Reproduce current verification

```bash
npm ci
npm test
npm run build
npm run test:e2e
npm run test:billing
```

Run each command in `.factory/claims.json` from a fresh browser state to repeat the claim contract. The app is a static PWA, so package/CLI consumer testing, server concurrency, and sign-in tenant checks do not apply.

---

# Page Pointer repair handoff — historical repair record

## Release decision

**READY — all release blockers in verification report commit
`93d15dd508285ba9a46bbd88f8ebf4ccefef200c` are repaired.**

- Repaired candidate: `6e5826ddebea21be5734082ebce23d1eb8648f06`
- Repair commits: `c4eb85d` and `9a8158b`
- Version: `1.1.2`
- Artifact: static offline-first PWA (`dist/`)
- Live URL: <https://page-pointer.sociobot.in>
- Final deployment ID: `27820d23-2fec-462b-8477-00f0ef7e8231`
- Final `dist/index.html` and deployed response SHA-256:
  `4bfd32e274725255d6ef7386d58913d35f4236c8201f5fd56d46a75a9953adee`

## Required failure reproduced first

Before changing the billing mapping, the production purchase route failed
exactly as reported:

```text
$ curl --max-redirs 0 https://api.sociobot.in/api/v1/products/page-pointer/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The public catalogue had no enabled `page-pointer` entry. Production and pilot
now map the slug to one-time INR 249 products through the Sociobot billing API.
No payment-provider script or credential was added to this repository.

## Repairs

1. Expanded `.factory/claims.json` from five broad claims to ten behavioral
   claims. Exact tagged regressions now cover the rear-camera request and
   stream lifecycle, denial/no-camera/low-contrast recovery, local ink
   detection, demo controls, JSON import/export/erase with the 50-session cap,
   offline use, service-worker update activation, free use, and all public
   paid-license promises.
2. Registered the missing one-time INR 249 production and pilot product
   mappings. `scripts/verify-billing.mjs` checks both public catalogues and
   both hosted-checkout redirects without completing a charge.
3. Bound cached license verdicts to the exact token. Capturing or restoring a
   new token clears the old verdict, revoked licenses relock paid controls,
   paid colors do not leak into the free UI, and valid colors persist.
4. Enlarged Supporter Privacy and Terms links and every audited mobile target
   to at least 44 by 44 CSS pixels.
5. Completed the real 404 with a skip link, shared navigation, legal links,
   product line, build version, and a keyboard-focusable main landmark.
6. Added a 1200 by 630 product-specific social image plus complete Open Graph
   and Twitter title, description, image, dimensions, and alt metadata.
7. Rewrote unclear or decorative product copy and expanded
   `.factory/copy-audit.md` to every landing-page sentence and dynamic state.
   All audited sentences are at most 22 words and contain no banned terms.
8. Added `.factory/billing.md` with checkout routes, price, return/license
   flow, 24-hour verification cache, and the observed API allowance: 30
   successful burst responses, followed by HTTP 429 and `Retry-After` on
   request 31.
9. Added route-specific titles, descriptions, canonicals, and social metadata.
   The final keyboard audit also found and fixed skip-link activation so Enter
   now moves focus into the main landmark on every app route and the 404.

## Regression and build evidence

A clean dependency install was run after moving the previous `node_modules`
and `dist` aside:

```text
npm ci
added 62 packages; 0 vulnerabilities

npm test
2 files passed; 11 tests passed

npm run test:e2e
22 passed across 390x844 mobile Chromium and desktop Chromium

npm run build
TypeScript strict check passed; Vite production build passed
JS 32.00 KB / 11.17 KB gzip
CSS 19.59 KB / 5.31 KB gzip
WOFF2 fonts 49.79 KB total
social image 149,611 bytes

npm run test:billing
production: INR 249.00, HTTP 303 -> checkout.dodopayments.com/session/…
pilot: INR 249.00, HTTP 303 -> test.checkout.dodopayments.com/session/…
```

Every exact command in `.factory/claims.json` was also run independently from
a fresh browser state: all ten claims passed, comprising 18 Playwright project
executions plus the local detector unit claim. There is no separate lint
script; `npm run build` runs `tsc --noEmit`. Package/consumer testing does not
apply to this private static PWA.

## Browser, accessibility, privacy, and PWA evidence

Live checks ran against the final custom-domain deployment at 390 by 844 and
1440 by 900:

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown path
  returned the designed 404 shell with HTTP 404.
- All ten route/viewport combinations had one `<h1>`, one `<main>`, `lang=en`,
  no horizontal overflow, no missing subresources, reduced-motion enabled,
  no serious or critical Axe findings, and no visible target below 44 pixels.
- The factory URL verifier reported correct title/lang/main/alt labeling, zero
  unlabeled buttons, and zero console errors on `/` and `/demo`.
- Tab reached the skip link first; Enter focused `<main>`; Arrow and Space
  advanced the sample guide on mobile and desktop.
- A fake rear camera opened a live track and released it on close. The complete
  flow made same-origin requests only.
- A fresh live service worker populated `page-pointer-v1.1.2-shell`; the demo
  reloaded and advanced while offline with zero failed requests or errors.
- The two-generation regression installed a changed worker, displayed the
  update action, activated the waiting worker, reloaded, and logged no errors.
- Local import/export/erase and camera flows exported no image pixels or
  recognized text. Demo storage remained isolated from real storage.

The deployed response policy includes HSTS, `nosniff`, strict-origin referrer
policy, camera restricted to self, a CSP with only the two documented Sociobot
API origins in `connect-src`, no-cache for `sw.js`, and immutable caching for
hashed/product image assets.

## Performance

Lighthouse 12.8.2 mobile against the final live release:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

Measured FCP 1.0 s, LCP 1.2 s, Speed Index 1.0 s, TBT 0 ms, and CLS 0.

## Reproduce

```bash
npm ci
npm test
npm run build
npm run test:e2e
npm run test:billing

# Run each declared claim exactly as a verifier will.
node -e "for (const claim of require('./.factory/claims.json')) console.log(claim.test)"

# Production identity and route policy.
curl -sS https://page-pointer.sociobot.in/ -o /tmp/page-pointer-live.html
sha256sum dist/index.html /tmp/page-pointer-live.html
curl -I https://page-pointer.sociobot.in/
curl -I https://page-pointer.sociobot.in/sw.js
curl -I https://page-pointer.sociobot.in/assets/page-pointer-social-1200x630.jpg

# Semantic/console smoke.
VERIFY_NODE_MODULES="$PWD/node_modules" \
  /opt/fleet/lib/verify-url.sh https://page-pointer.sociobot.in/ /tmp/page-pointer-root
```

## Known limits and next validation

- Camera behavior is covered with deterministic fake-camera frames in both
  browser sizes. Recheck automatic placement on varied physical books during
  the next family field study; glare, curvature, handwriting, columns, and
  unusual layouts remain documented v1 limits.
- Checkout registration and redirects are live-verified, while license states
  use recorded Sociobot responses in tests. No real payment was submitted
  during repair verification.

There are no known release-blocking gaps.
