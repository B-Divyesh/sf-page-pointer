# Page Pointer v1.1.1 repair handoff

## Repair scope

This repair resolves every release blocker in verifier report commit
`28d3fa702980b3a3e0f5137919e8f512dfddaabd` for candidate
`2d191facbb07fc004de2d6d6ae6f7f5c4d8478d1`.

- Every command in `.factory/claims.json` now builds the production artifact
  before Playwright starts `vite preview`, so it works from a clean clone with
  no pre-existing `dist/`.
- The offline claim now waits for online fonts and the installed shell, then
  verifies an offline reload and guide action with zero failed requests. The
  service worker ignores `Vary` only for same-origin cache matches, and an
  early offline class selects system fonts before CSS parsing in Chromium's
  offline-emulation edge case. The three WOFF2 files remain self-hosted,
  precached, and preloaded online.
- Direct demo startup now finishes its automatic scroll synchronously before
  resetting the sequential focus origin. The first Tab reliably reaches the
  skip link instead of racing the demo's scroll animation.
- Browser regression coverage now uses an exact 390 px mobile viewport,
  checks page/console errors and horizontal overflow on every route, and
  retains axe scans, demo isolation, privacy, offline, and keyboard coverage.
- Mobile demo and navigation controls were brought to at least 44 by 44 CSS
  pixels. Hashed font preloads eliminated the font-swap layout shift.

## Clean verification evidence

Run on 2026-08-29 UTC:

- Removed the generated `dist/`, then `npm ci`: passed with 0 vulnerabilities.
- Every one of the five exact `.factory/claims.json` commands passed from the
  clean install on both 390 px mobile Chromium and desktop Chromium: 10 claim
  executions total.
- `npm test`: 7/7 Vitest tests passed. These cover detection, deployment
  response policy, clean-clone browser bootstrapping, worker update behavior,
  same-origin cache matching, and generated WOFF2 preloads.
- `npm run test:e2e`: 14/14 Playwright tests passed across the two viewport
  classes. All routes had one `h1`, one `main`, no serious/critical axe issues,
  no console/page errors, and no horizontal overflow.
- Offline stress: 20/20 consecutive claim runs passed (10 mobile, 10 desktop)
  with all fonts loaded online and zero failed requests after offline reload.
- Keyboard stress: 20/20 consecutive runs passed (10 mobile, 10 desktop). The
  skip link remained focused after demo startup; ArrowRight and Space moved
  the pointer.
- Production build/typecheck passed. Output: JS 30.60 KB (10.96 KB gzip), CSS
  19.36 KB (5.28 KB gzip), and three WOFF2 fonts totaling 49.79 KB. `dist/`
  contains the root `index.html` and Static Web Apps configuration. This
  private static PWA has no package/consumer surface and no separate lint
  configuration; TypeScript `--noEmit` is the configured static check.
- Local `verify-url.sh` on `/` and `/demo`: HTTP 200, `lang=en`, one `h1`, one
  `main`, no missing image alt attributes, and zero console/page errors at
  desktop and 390 px.
- Playwright manual smoke checks passed for a live fake camera, camera stream
  release, denied-camera recovery, invalid JSON import recovery, reduced
  motion, 390 px layout, and 44 by 44 control targets.
- Lighthouse 12.8.2 mobile report: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100, LCP 1.5 s, CLS 0, TBT 0 ms. Lighthouse wrote the
  complete report before its final screenshot tab crashed in this container.

## Run and verify

```bash
npm ci
jq -r '.[].test' .factory/claims.json
# Run each printed command exactly.
npm test
npm run test:e2e
```

`npm run test:e2e` includes the production build. The deployable artifact is
`dist/`.

## Deployment

Deployment and live identity evidence will be appended after the committed
repair is uploaded with the work order's static deployment command.

## Known gaps

- Detection remains a local contrast heuristic for printed Latin-script
  pages, not OCR. Manual tapping and stepping remain the supported fallback.
- The brief's 20-family field study cannot be completed in this build
  environment.
- The factory must register the `page-pointer` paid product and return URL
  before real Supporter sales. Production calls only the Sociobot billing API;
  non-production calls its pilot API.
