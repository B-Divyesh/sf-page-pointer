# Page Pointer

Page Pointer helps parents, tutors, and emerging readers follow the current word in a physical book. Aim a phone at the page and tap the current word. A high-contrast guide marks one word or line. Pixel analysis stays in memory on the device. The app creates no OCR record, image upload, child profile, or reading assessment.

Live product: <https://page-pointer.sociobot.in>

Try the isolated sample guide at <https://page-pointer.sociobot.in/demo>. It
opens with *The Small Red Kite*, stores only in `demo:page-pointer`, and lets
you reset the sample or discard it before starting for real.

## What v1 includes

- Rear-camera capture with clear permission, denial, no-camera, and low-contrast states.
- Local line and word-gap detection from contrasting pixels. It does not read the text.
- Tap-to-orient, word/line modes, Previous/Next controls, and Arrow/Space keyboard controls.
- A built-in practice page that works without camera permission.
- Installable PWA with first-visit precaching, offline navigation, and an update action.
- IndexedDB preferences and up to 50 brief session summaries, with JSON import, export, and erasure.
- Optional ₹249 one-time Supporter pack through Sociobot billing; the complete reading guide stays free.

## Run and verify

Requires Node.js 20.19+ (or 22.12+).

```bash
npm ci
npm run dev
```

The development server prints its local URL. Camera access requires localhost or HTTPS.

```bash
npm test          # local pixel-detection unit tests
npm run build     # production output in ./dist
npm run test:e2e  # mobile/desktop, axe, keyboard flow, and offline reload
npm run test:all  # all of the above
```

The factory deployment command is exactly `npm ci && npm test && npm run build`; `dist/index.html` is the static entry point. `/demo`, `/privacy`, and `/terms` are configured static routes. `dist/staticwebapp.config.json` supplies the required deployment headers, cache policy, and 404 response.

## Claims, demo, and billing

Every visitor-facing claim is listed in [`.factory/claims.json`](.factory/claims.json)
with an executable Playwright regression. The sandbox behavior and storage
namespace are documented in [`.factory/demo.md`](.factory/demo.md).

Production and test checkout mapping, the one-check-per-day client cache, and
the observed API request allowance are documented in
[`.factory/billing.md`](.factory/billing.md). Run `npm run test:billing` to
confirm both ₹249 checkout mappings against the live Sociobot catalogues.

## Architecture and privacy

The app is Vite with strict vanilla TypeScript. `src/detection.ts` converts each temporary canvas frame to grayscale. It estimates ink rows and groups local gaps into word-like rectangles. It does not recognize or retain text. IndexedDB stores only preferences and up to 50 session summaries. A supplied license stays in localStorage. Automatic checks use the cached result for 24 hours.

The app contains no analytics, third-party runtime scripts, CDN fonts, or payment widgets. Atkinson Hyperlegible and IBM Plex Mono are bundled under their open licenses.

## Known limits

V1 is designed for well-lit, horizontal, printed Latin-script pages. Curvature, glare, columns, illustrations, handwriting, vertical text, and decorative layouts can reduce placement quality. Users can tap again or use the step controls. Page Pointer does not diagnose or treat dyslexia.

Visual direction and asset provenance are in [`.factory/design.md`](.factory/design.md). Build verification and remaining product validation are in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
