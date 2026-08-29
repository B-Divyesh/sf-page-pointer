# Independent verification 4 — PASS

**Candidate commit:** `bf605ddae009ccf1a719e5b14509e9f392e1fda0`  
**Live URL:** <https://page-pointer.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Verdict:** **PASS — accepted for release.**

## First read and demo

A cold production visit answers the required questions in plain words: it is a guide that marks the current word on a physical book; it is for parents, tutors, and emerging readers; and the visitor can click **Try it with sample data**. The button explains that it opens a practice page with a short sample story. This is present in the first screen at desktop and 390 px mobile.

Opening `/demo` automatically moves to the working *The Small Red Kite* sample guide. At 390 px its initial viewport shows the persistent **Demo — sample data, nothing is saved** banner, Reset demo and Start for real actions, sample text, an active word guide, and Word/Line controls. The demo is therefore a one-click, isolated, usable trial rather than a marketing-only page.

## Required clean-clone claim checks

After `npm ci` (63 packages audited; 0 vulnerabilities), every exact command listed in `.factory/claims.json` completed successfully. Browser claims ran in both configured Chromium projects (390 x 844 mobile and desktop); the pixel-detection claim ran as its declared Vitest test.

| Claim | Result |
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

The complete browser suite also passed: **22/22**. This includes camera-permission/denial/no-camera/low-contrast fixtures, demo isolation and reset, keyboard movement, import/export/erase and its 50-session boundary, offline reload, two-generation service-worker update activation, and recorded valid/revoked billing responses. The only static check available is TypeScript; `npm run build` runs `tsc --noEmit` and passed.

## Independent live exercise

- Demo Word and Line modes, Next, Previous, Arrow keys, and Space moved the guide. A real production camera request without a usable device gave the actionable recovery message: “The rear camera did not open. Close other camera apps and try again, or try the sample guide.”
- A fresh live service worker controlled `/demo`, created `page-pointer-v1.1.2-shell`, and reloaded the demo offline. Next still moved the guide; there were zero failed requests and zero console/page errors.
- Cold reading/demo request logs contained only `https://page-pointer.sociobot.in` documents, assets, fonts, and images. There are no analytics, third-party fonts, camera uploads, OCR calls, or payment scripts. License verification is explicitly triggered only by a license flow and is constrained to the documented Sociobot API origins.
- The documented production verification allowance was independently reproduced with an invalid token: requests 1–30 returned 200; request 31 returned **429** with **`Retry-After: 3`**.

## Accessibility, responsive, security, and routes

At desktop 1440 x 900 and mobile 390 x 844, production `/demo` had no serious/critical axe violations, no console or page errors, and no horizontal overflow. Keyboard Tab exposed a designed solid yellow focus outline; the skip link, guide controls, and route links were keyboard operable. Reduced-motion mode changed scrolling to `auto` and transitions/animations to `0.00001s`.

`/`, `/demo`, `/privacy`, `/terms`, robots, sitemap, and manifest returned 200; an unknown path returned the designed 404 with HTTP 404. Live responses send HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, camera-only Permissions Policy, and a CSP response header with `frame-ancestors 'none'`. `sw.js` is `no-cache`; hashed JS/CSS are immutable for one year.

## Build, deployment identity, and performance

```text
npm test             11/11 passed
npm run test:e2e     22/22 passed
npm run test:billing production and pilot INR 249.00 checkout redirects passed
npm run build        passed; dist/ produced
```

The rebuilt candidate matches production byte-for-byte where it matters:

| Asset | SHA-256 |
| --- | --- |
| `dist/index.html` and live `/` | `4bfd32e274725255d6ef7386d58913d35f4236c8201f5fd56d46a75a9953adee` |
| JS `index-COjTp1z9.js` | `fa133eee606d9b2fea9a8c57ad6a5d0ab2ff98b4ca5c7149c6d468ab9290e83d` |
| CSS `index-PgG6gqAd.css` | `1b7baad08e5983a13c307982ccb57f0c1dbb354459fa2c7532dd935b268dddcd` |
| generated `dist/sw.js` | `272da3f6011150f56987acbfced7251cba13b140a4c18a9ebf05754ac79ae3b4` |

Budgets pass: initial JS is 11,116 bytes gzip, CSS 5,317 bytes gzip, WOFF/WOFF2 fonts total 91,324 bytes, and the mobile AVIF hero is 27,158 bytes. Lighthouse mobile against live `/demo` scored **99 performance, 100 accessibility, 100 best practices, and 100 SEO**.

## Defects by severity

| Severity | Findings |
| --- | --- |
| Blocker / Critical | None observed |
| High | None observed |
| Medium | None observed |
| Low | None observed |

## Remaining validation

The automated environment cannot reproduce the brief’s proposed family field study with real curved or glare-prone books. The product deliberately documents those placement limits and supplies tap/step recovery; field validation remains the next product-learning activity, not a release-blocking defect.
