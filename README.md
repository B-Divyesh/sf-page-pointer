# Page Pointer

Page Pointer is a private, offline-first camera guide for parents, tutors, and emerging readers sharing a physical book. Aim a phone at a printed page, tap the current word, and follow a high-contrast word or line marker. Pixel analysis happens in memory on the device: there is no OCR, image upload, child profile, or reading assessment.

Live product: <https://page-pointer.sociobot.in>

Try the isolated sample guide at <https://page-pointer.sociobot.in/demo>. It
opens with *The Small Red Kite*, stores only in `demo:page-pointer`, and lets
you reset the sample or discard it before starting for real.

## What v1 includes

- Rear-camera capture with clear permission, denial, no-camera, and low-contrast states.
- Local baseline and word-gap detection for printed Latin-script text.
- Tap-to-orient, word/line modes, Previous/Next controls, and Arrow/Space keyboard controls.
- A built-in practice page that works without camera permission.
- Installable PWA with first-visit asset precaching, offline navigation, and an update prompt.
- IndexedDB preferences and short session summaries with JSON export/import and local erasure.
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

## Claims and demo

Every visitor-facing claim is listed in [`.factory/claims.json`](.factory/claims.json)
with an executable Playwright regression. The sandbox behavior and storage
namespace are documented in [`.factory/demo.md`](.factory/demo.md).

## Architecture and privacy

The app is Vite + strict vanilla TypeScript. `src/detection.ts` converts each temporary canvas frame to grayscale, estimates ink rows, and groups local gaps into word-like rectangles. It does not recognize or retain text. IndexedDB stores only preferences and up to 50 session summaries. A license token, if supplied, is stored in localStorage and checked against the Sociobot license API at most once per day.

No analytics, third-party runtime scripts, CDN fonts, or payment-provider widgets are included. Atkinson Hyperlegible and IBM Plex Mono are bundled locally through Fontsource packages under their respective open font licenses.

## Known limits

V1 is intended for well-lit, horizontally printed Latin-script pages. Page curvature, glare, columns, illustrations, handwriting, vertical text, and decorative layouts can reduce automatic placement quality. Users can tap again or use deterministic stepping controls. Page Pointer does not diagnose or treat dyslexia.

Visual direction and asset provenance are in [`.factory/design.md`](.factory/design.md). Build verification and remaining product validation are in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
