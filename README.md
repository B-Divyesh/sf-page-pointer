# Page Pointer

Page Pointer helps parents, tutors, and emerging readers follow the current word in a physical book. Aim a phone at the page and tap the current word. A guide marks one word or line. The app checks each camera frame in memory, then discards it. It never reads, uploads, or stores the book’s words.

Live product: <https://page-pointer.sociobot.in>

Try the isolated sample guide at <https://page-pointer.sociobot.in/demo>. It
opens *The Small Red Kite* and stores data only in `demo:page-pointer`. Reset
it or discard it before starting for real.

## What this version includes

- The app explains how to recover when camera permission is denied, no camera is available, or page contrast is low.
- The app finds printed lines and word spaces on your device. It does not read the text.
- Tap the current word, choose a word or line guide, or move it with Next, Previous, Arrow, and Space.
- The sample guide works without camera permission.
- Install the web app, use both guides offline after one visit, and install updates when prompted.
- Save preferences and 50 brief session summaries in this browser. Import, export, or erase them as JSON.
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
with an executable automated test. The sandbox behavior and storage
namespace are documented in [`.factory/demo.md`](.factory/demo.md).

`.factory/billing.md` records both checkout environments, the daily license
check, and the measured request limit. Run `npm run test:billing` to confirm
both ₹249 checkout mappings against the live Sociobot catalogues.

## Architecture and privacy

The app uses Vite and TypeScript without a UI framework. `src/detection.ts` removes color from each in-memory camera frame before checking page contrast. It groups dark marks into printed lines and approximate word boxes. It does not recognize or retain text. IndexedDB stores only preferences and up to 50 session summaries. A supplied license stays in this browser’s local storage. Automatic license checks reuse a result for 24 hours.

The app loads no tracking, third-party code, remote fonts, or embedded checkout.

## Known limits

Hold the phone over a flat page and turn it sideways before you aim. If placement misses, tap again or use the step controls. Page Pointer does not diagnose or treat dyslexia.

Visual direction and asset provenance are in [`.factory/design.md`](.factory/design.md). Build verification and remaining product validation are in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
