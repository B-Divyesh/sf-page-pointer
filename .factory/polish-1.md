# Perfection-loop polish 1 — finding closure

Date: 2026-08-29

Candidate repaired: `bf605ddae009ccf1a719e5b14509e9f392e1fda0`

Review source: `.factory/review-1.md` at `bc61c4dacff9ecac9b58d83e7c21749084961a1c`.
There were no earlier `review-*.md` or `polish-*.md` files in that commit.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Expanded the offline contract to the real camera guide and sample guide. The test uses a new browser context, fake rear camera, offline reload, placement, movement, mode change, and `/\?demo=1`. | `@claim:offline-demo`; `tests/e2e/app.spec.ts`; `live/live-interaction-report.json` |
| F-1-2 | Exercised the complete real camera guide with no account or license: place, Next, Previous, Line, Arrow, and Space. | `@claim:free-core` |
| F-1-3 | Added a recorded Sociobot fixture asserting `INR`, `24900`, and `one_time`; the tagged test also checks the exact checkout URL and paid controls. | `@claim:paid-supporter`; `tests/fixtures/sociobot-page-pointer.json`; `npm run test:billing` |
| F-1-4 | Replaced the unproved payment/refund handler claim with the observable statement “Checkout opens on Sociobot.” | `@claim:paid-supporter`; Terms and Privacy route checks |
| F-1-5 | Removed the unproved refund-to-revocation assertion from landing and Terms copy. License revocation handling remains tested without claiming its cause. | `@claim:paid-supporter`; copy search in `README.md`, `src`, and `public` |
| F-1-6 | Registered and tested the exact 24-hour license cache using a controlled clock before and after the boundary. | `@claim:license-cache-24h` |
| F-1-7 | Registered the runtime privacy claim and tested all requests, scripts, resources, fonts, and frames during the sample flow. | `@claim:private-runtime` |
| F-1-8 | Added route-change intent, `h1 tabindex=-1`, polite announcements, focus on navigation and bfcache restore, and `preventScroll` scroll restoration. | `route changes, Back, and Forward focus and announce the h1 without losing restored scroll`; `live/live-interaction-report.json` |
| F-1-9 | Added canonical, Apple touch icon, Open Graph image fields, and Twitter card fields to the designed 404. | `home, demo, legal pages, and the static 404…`; `tests/release-config.test.ts`; live unknown-route 404 check |
| F-1-10 | Demo mode no longer renders the Supporter section, purchase panel, form, or checkout link. | `@claim:paid-supporter`; live report records zero supporter sections and purchase links |
| F-1-11 | Renamed the link to “Buy once for ₹249 on Sociobot (opens checkout)” and added the destination to its accessible name. | `@claim:paid-supporter`; `live/live-interaction-report.json`; `local/home-mobile.png` |
| F-1-12 | Split the 24-word README demo sentence into two short sentences. | `README.md`; `.factory/copy-audit.md` |
| F-1-13 | Standardized built-in content as “sample guide” in action notes, labels, docs, errors, demo docs, and 404 copy. | repository copy search; `.factory/copy-audit.md` terminology table |
| F-1-14 | Standardized the account fact as “No account needed.” | landing and purchase status; `@claim:free-core` |
| F-1-15 | Replaced OCR jargon with “It never reads, uploads, or stores the book’s words.” | landing privacy section; README; `@claim:local-only-reading` |
| F-1-16 | Replaced “temporary pixels” with “The app checks each camera frame in memory, then discards it.” | landing and Privacy; `@claim:camera-states` |
| F-1-17 | Replaced version/script jargon with “This version works with printed text that uses the Latin alphabet.” | landing, Terms, README |
| F-1-18 | Renamed “Aim” to “Aim the rear camera.” | `local/home-mobile.png` |
| F-1-19 | Renamed “Tap” to “Tap the current word.” | `local/home-mobile.png` |
| F-1-20 | Renamed “Follow” to “Follow with Next.” | `local/home-mobile.png` |
| F-1-21 | Renamed “Restore” to “Restore Supporter pack.” | `@claim:paid-supporter`; `local/home-mobile.png` |
| F-1-22 | Renamed “Update” to “Install update.” | `@claim:pwa-update` |
| F-1-23 | Renamed the completed timer action to “Start 10-minute timer again.” | `@claim:paid-supporter` |
| F-1-24 | Removed the external-link arrow from the in-page “Open camera” button. | `local/home-mobile.png`; `@claim:camera-states` |
| F-1-25 | Rewrote the README camera feature as recovery guidance for denial, missing camera, and low contrast. | README; `@claim:camera-states` |
| F-1-26 | Rewrote local detection as finding printed lines and word spaces on the device. | README; `@claim:local-ink-detection` |
| F-1-27 | Rewrote the control list as direct instructions using the UI’s exact labels. | README; `@claim:demo-sandbox`; `@claim:free-core` |
| F-1-28 | Rewrote PWA jargon as install, offline use after one visit, and prompted updates. | README; `@claim:offline-demo`; `@claim:pwa-update` |
| F-1-29 | Rewrote storage jargon around saving 50 summaries and importing, exporting, or erasing JSON. | README; `@claim:local-data-roundtrip` |
| F-1-30 | Simplified the billing documentation sentence to checkout environments, daily license check, and measured request limit. | README; `npm run test:billing` |
| F-1-31 | Replaced “strict vanilla” with “Vite and TypeScript without a UI framework.” | README |
| F-1-32 | Explained the in-memory color-removal step and its page-contrast purpose. | README; `@claim:local-ink-detection` |
| F-1-33 | Replaced algorithm jargon with dark marks, printed lines, and approximate word boxes. | README; `@claim:local-ink-detection` |
| F-1-34 | Explained that the license stays in this browser’s local storage. | README and Privacy |
| F-1-35 | Replaced runtime/CDN/widget jargon with the registered no-tracking, third-party-code, remote-font, or embedded-checkout claim. | `@claim:private-runtime` |
| F-1-36 | Renamed the 404 action to “Open Page Pointer.” | `public/404.html`; 404 browser/a11y route check |

## Shared evidence

- Local cold browser report: `.factory/evidence/polish-1/local/browser-report.json`
- Local screenshots: `.factory/evidence/polish-1/local/home-mobile.png`, `home-desktop.png`, and `demo-mobile.png`
- Local Lighthouse report: `.factory/evidence/polish-1/local/lighthouse-mobile.json`
- Clean-clone, deployment, and live command record: `.factory/evidence/polish-1/verification-summary.md`
- Live cold browser report: `.factory/evidence/polish-1/live/browser-report.json`
- Live demo, routing, offline, 404, and checkout result: `.factory/evidence/polish-1/live/live-interaction-report.json`
- Live `verify-url.sh` result: `.factory/evidence/polish-1/live/verify-url/verify.json`
- Live screenshots: `.factory/evidence/polish-1/live/home-mobile.png`, `home-desktop.png`, and `demo-mobile.png`
- Public URL checked: <https://page-pointer.sociobot.in>
- Deployed product commit: `bde48060efae17e90494f786f0a5d3ba30b7b0a7`
- Deployment ID: `61ea0464-e156-4c67-a5a3-aacd40b4b6e4`

## Result

All 36 findings have implementation and regression coverage. No finding is deferred.
