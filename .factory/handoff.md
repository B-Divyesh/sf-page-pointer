# Page Pointer v1 handoff

## Shipped

- A responsive rear-camera reading instrument that keeps every frame in a temporary on-device canvas. It estimates printed baselines from local contrast, groups likely words from ink gaps, anchors to the adult's tap, and keeps the selected guide aligned while the camera is live.
- Word and full-line guides, tap/re-tap orientation, Previous/Next buttons, Arrow/Space keyboard control, Escape-to-close, mobile safe sizing, session stop/cleanup, and honest low-contrast/end-of-page feedback.
- Camera permission/loading/denial/unavailable states plus a complete no-camera practice page.
- Local-first preferences and the latest 50 session summaries in IndexedDB, with JSON export/import and confirmed erasure. No images or recognized text are retained.
- Installable PWA manifest, 192/512 icons, versioned service-worker caches, generated hashed-asset precache, offline fallback, first-page client claim, and an in-app update prompt.
- Optional ₹249 one-time Supporter pack through the Sociobot license contract: hosted checkout, return-token capture and URL cleanup, daily-cached verification, optimistic offline unlock, restore-by-token, invalid/revoked handling, and staging API selection off the production hostname. The full reading guide and data controls remain free.
- Static `/privacy` and `/terms` entry points, README, MIT license, sitemap/robots, and no analytics or third-party runtime resources.
- Product-specific blueprint drafting-sheet system and original generated hero in responsive AVIF/WebP/JPEG variants. Prompt, model/deployment, and date are recorded in `.factory/design.md` and `assets/src/`.

## Verification

Run from `/work/repo`:

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Verified on 2026-08-28:

- `npm test`: 3/3 local text-geometry tests passed.
- `npm run build`: passed; `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html` produced.
- Playwright 1.58.2: 6/6 passed across a 393 px Pixel 5 profile and desktop Chromium, including the full demo interaction, keyboard-safe controls, console check, axe scan, legal routes, and explicit `context.setOffline(true)` reload/use.
- Fake-device camera smoke test: rear-camera request opened a 1280×720 stream, blank-frame error was announced, and Close stopped the guide.
- Axe via Playwright: zero serious or critical findings on home, privacy, and terms at both viewport classes.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.2 s, LCP 1.4 s, CLS 0.034, total blocking time 0 ms.
- Production payload: 28.34 KB JS, 18.03 KB CSS, about 92 KB of self-hosted font files across modern/fallback formats; mobile hero AVIF 27 KB (WebP 44 KB). The small critical JS/CSS is also inlined into the 46 KB app shell so a controlled offline reload does not depend on subresource timing.
- `npm audit`: 0 vulnerabilities.

## Known gaps / next steps

- Automatic placement is a deliberately lightweight contrast heuristic, not OCR. Validate thresholds on a wider set of real books, lighting, page curvature, type sizes, and phone cameras before tuning them; manual tapping and stepping are the supported fallback.
- The brief's success measure needs 20 real family sessions and parent-reported re-orientation counts. That field study was not available in this build environment.
- The factory still needs to register the `page-pointer` paid product and set its return URL. Non-production hosts intentionally use `pilot-api.sociobot.in`; the production hostname switches to `api.sociobot.in` automatically.
- iOS/Android install and rear-camera behavior should receive a final physical-device pass even though mobile Chromium, denied-camera behavior, and fake-camera acquisition were exercised here.
