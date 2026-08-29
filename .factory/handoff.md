# Page Pointer polish 1 handoff

## Outcome

Page Pointer v1.1.3 closes every finding in `.factory/review-1.md` while
preserving the blueprint drafting-sheet visual system and offline PWA class.
The finding-by-finding record is in `.factory/polish-1.md`.

The real camera guide and isolated sample guide now prove the full offline and
free-core wording. The Supporter price uses a recorded INR 249 one-time fixture
inside its tagged claim test, with a separate live catalogue check. Demo mode
does not render or read purchase data. Route changes focus and announce each
heading while Back and Forward retain scroll.

## Verification

Run from the repository root:

```text
npm ci
npm test
npm run build
npm run test:e2e
npm run test:billing
node scripts/capture-evidence.mjs https://page-pointer.sociobot.in .factory/evidence/polish-1/live
```

Recorded local results:

- `npm test`: 12/12 passed.
- `npm run test:e2e`: 28/28 passed across 390 × 844 mobile Chromium and desktop Chromium.
- All 12 exact claim commands passed individually from clean clone
  `/tmp/page-pointer-clean-nIPXX5` at `bde4806` before its full suite ran.
- That clean clone also passed `npm test` (12/12), `npm run test:e2e`
  (28/28), and `npm run build`.
- `npm run build`: `dist/` produced; application JavaScript 33.10 KB raw /
  11.39 KB gzip; CSS 19.74 KB raw / 5.36 KB gzip; WOFF2 fonts total
  49.79 KB.
- `npm run test:billing`: production and pilot both returned INR 249.00 and HTTP 303 to their expected hosted checkout.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms.
- Playwright axe: zero serious or critical findings on `/`, `/?demo=1`,
  `/demo`, `/privacy`, `/terms`, and the 404.
- First-screen fit: sample action and all three facts end at 635 px in an 844 px mobile viewport and 782 px in a 900 px desktop viewport.
- Cold link crawl: every internal link returned 200 locally; the deployed unknown route is checked for a real HTTP 404.

Evidence is under `.factory/evidence/polish-1/`. The service worker cache is
`page-pointer-v1.1.3-shell`; its offline claim uses a dedicated browser context
and never closes or reuses the shared test browser.

## Deployment and live re-check

Product commit `bde48060efae17e90494f786f0a5d3ba30b7b0a7` was pushed to
`origin/main`, built, and deployed from `dist/` with:

```text
/opt/fleet/lib/deploy-static.sh page-pointer /work/repo/dist
```

Azure Static Web Apps accepted deployment
`61ea0464-e156-4c67-a5a3-aacd40b4b6e4`. A fresh live pass at
<https://page-pointer.sociobot.in> then verified:

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200 with unique
  titles, one `h1`, one `main`, correct canonicals, no console errors, and no
  serious or critical axe findings.
- `/not-a-real-page` returns a real 404 with the designed page, complete social
  metadata, and “Open Page Pointer.”
- Direct demo startup opens only `demo:page-pointer`; the sample flow leaves
  real data unchanged, makes no third-party request, resets cleanly, and never
  renders purchase UI.
- Route heading focus, polite announcement, Back focus, and restored scroll all
  pass. Both the real camera guide and sample guide pass after going offline.
- `verify-url.sh` passed in 779 ms with no errors, one `h1`, one `main`, no
  missing alt text, and no unlabeled buttons.
- Live `index.html` SHA-256 equals the built artifact:
  `264ae69f22ba9244db09551e6e9971b5dc2072f147ceb582ccfd7f4de9641f5d`.

Exact commands and report paths are in
`.factory/evidence/polish-1/verification-summary.md`; the live interaction
result is `live/live-interaction-report.json`.

## Known gaps and next steps

None for this work order. INP has no lab value because Lighthouse had no user
interaction sample; the automated camera, keyboard, timer, and route tests cover
the relevant interactions without long tasks.
