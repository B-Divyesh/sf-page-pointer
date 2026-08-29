# Page Pointer independent verification handoff — FAIL

## Release decision

**FAIL — do not release candidate
`6e5826ddebea21be5734082ebce23d1eb8648f06`.**

Verified on 2026-08-29 UTC at <https://page-pointer.sociobot.in>. The rebuilt
candidate and live root match exactly at SHA-256
`54df16bc0518d2effbae4bb9914eb76dabc842cd94854a8ea884605e6c792659`,
so this is not a stale-deployment result.

## Release blockers

1. `.factory/claims.json` is incomplete. The live app and README promise real
   camera/detection states, real import/erase, PWA update behavior, and paid
   Supporter features without corresponding listed, tagged claim tests. The
   claims acceptance contract makes any unlisted claim release-blocking.
2. The live **Buy once · ₹249** link returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`. The Supporter purchase
   cannot be completed. Factory product registration is still missing.

Additional defects: two Supporter legal links have 17 px-high mobile hit
areas; the 404 lacks a skip link and standard footer links/version; social
metadata does not provide the required 1200 × 630 image; the copy audit and
API allowance documentation are incomplete.

## What passed

- Cold first read and the visible one-click sample demo.
- All five exact claims commands after `npm ci`: 10/10 project executions.
- `npm test`: 7/7; `npm run test:e2e`: 14/14; production typecheck/build.
- Full demo and real fake-camera lifecycle, denial/error copy, guide boundary
  controls, invalid import recovery, session export/erase/import, demo
  isolation/reset/discard, and invalid-license behavior.
- Same-origin-only cold/demo/camera request logs; exported data contained no
  page image or recognized text.
- Live offline reload/navigation and a two-generation service-worker update
  check, including waiting-worker toast and activation.
- Axe: zero violations on five routes at 390 px and desktop; visible focus,
  keyboard operation, reduced motion, and no horizontal overflow.
- Required security, content-type, and cache headers. Billing verification
  enforced 30 requests per observed burst; request 31 returned 429 with
  `Retry-After: 4`.
- Lighthouse mobile 100/100/100/100; LCP 1.2 s, TBT 40 ms, CLS 0. Build output
  is 30.60 KB JS and 19.36 KB CSS before gzip.

## Evidence and reproduction

The full finding list and commands are in `.factory/verification-3.md`.
Machine-readable output, screenshots, response headers, claim logs, the
Lighthouse report, and PWA test scripts are in
`.factory/evidence/verification-3/`.

```bash
npm ci
jq -r '.[].test' .factory/claims.json
# Run every printed command exactly.
npm test
npm run build
npm run test:e2e
curl -i --max-redirs 0 \
  https://api.sociobot.in/api/v1/products/page-pointer/checkout
```

No product source was modified during verification.
