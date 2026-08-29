# Page Pointer verification 6 handoff — PASS

## Outcome

**PASS** for candidate `b5c18196948633089e8326dcc26e3f156ce972bb` at
<https://page-pointer.sociobot.in>, verified independently on 2026-08-29 UTC.
This verifier did not modify product source.

The deployed `index.html` and main JavaScript SHA-256 values exactly match the
production build generated from this candidate. The full evidence and exact
claim-by-claim result are in `.factory/verification-6.md`.

## How verified

From this clean checkout:

```text
npm ci
npm test
npm run test:e2e
npm run test:billing
npm run build
```

- All 12 exact commands registered in `.factory/claims.json` passed through the
  demo entry point.
- `npm test` passed 12/12; the complete Playwright population passed (28 tests
  across desktop and 390px mobile); billing verification passed; `dist/` built.
- Cold live first-read passed, as did the sample flow, keyboard use, focus,
  error recovery, privacy request log, headers, 390px layout, reduced motion,
  axe checks, service-worker offline reload, and update claim.
- The product-unlock endpoint allowed 30 invalid-token requests, then returned
  `429` with `Retry-After: 4` on request 31.

## Defects and known gaps

No blocker, critical, major, or minor defects were found.

The verifier container could not launch Lighthouse’s separate CLI Chrome, so
this handoff does not assert a new Lighthouse score. Direct production output
is within bundle budgets (11.39 KB gzip application JS, 5.36 KB gzip CSS,
49.79 KB WOFF2 fonts), and axe was independently run in the installed
Playwright Chromium with zero WCAG 2 A/AA violations.

Automated QA does not replace family field testing on curved, glare-prone pages
and varied cameras; the product documents those limits and recovery actions.
