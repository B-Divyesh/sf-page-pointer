# Perfection-loop polish 2 — finding closure

Review sources: `.factory/review-1.md` and `.factory/review-2.md`.

## Finding map

| Finding IDs | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the real-guide plus sample-guide offline regression from polish 1. | `@claim:offline-demo` |
| F-1-2 | Kept the unauthenticated real-camera workflow regression. | `@claim:free-core` |
| F-1-3 | Kept the recorded INR 249/one-time fixture assertion. | `@claim:paid-supporter`, `npm run test:billing` |
| F-1-4–F-1-7 | Kept the narrowed checkout wording and registered billing, cache, and private-runtime claims. | `@claim:paid-supporter`, `@claim:license-cache-24h`, `@claim:private-runtime` |
| F-1-8–F-1-11 | Kept h1 focus/announcements, complete 404 metadata, demo purchase removal, and labelled external checkout. | route/a11y browser regression |
| F-1-12–F-1-17 | Kept the plain-language, consistent sample-guide/privacy/text-scope rewrites. | copy audit validation |
| F-1-18–F-1-24 | Kept meaningful headings and precise controls. | browser/a11y regression |
| F-1-25–F-1-36 | Kept README plain-language rewrites, private-runtime registration, and the designed 404 action. | `npm test`; browser/a11y regression |
| F-2-1 | Strengthened camera and sample privacy tests: after the shell load they operate the guides and assert zero subsequent requests; exported/local values are checked for image encodings. | `@claim:camera-states`, `@claim:local-only-reading` |
| F-2-2 | The reset regression now seeds distinct real data, creates a demo session and demo preference, proves both before Reset, checks default empty demo state after Reset, and proves real data survives Reset and Start for real. | `@claim:demo-reset` |
| F-2-3 | Removed the undefined “quiet” promise and vibration. The paid feature now promises and tests a ten-minute timer. | `@claim:paid-supporter` |
| F-2-4 | Added the explicit `license-verification-transfer` claim and fixture test for a bodyless GET carrying only the license to Sociobot. | `@claim:license-verification-transfer` |
| F-2-5 | Replaced “Landscape works best” with the direct operating instruction “Turn the phone sideways before you aim.” | copy audit; live `/` check |
| F-2-6 | Removed the unsupported script/orientation performance envelope and kept only operating guidance. | copy audit; live `/` and `/terms` check |
| F-2-7 | Replaced detector-behaviour lists with recovery steps: flatten, reduce glare, move from illustrations, and tap again. | copy audit; live `/` and `/terms` check |
| F-2-8 | Removed the undefined “high-contrast” adjective. | README and `@claim:demo-sandbox`/`@claim:free-core` |
| F-2-9 | Corrected README to say “automated test,” covering both Vitest and Playwright. | README; `npm test` |
| F-2-10 | Corrected the counting rule and all affected counts. The release test derives each table count and checks audited text against the product source. | `tests/release-config.test.ts` |

## Evidence

- Unit/release suite: `npm test` — 12 passing tests.
- Build: `npm run build` — `dist/` created; main JS gzip 11.31 KB and CSS gzip 5.36 KB.
- Billing: `npm run test:billing` — production and pilot both reported INR 249.00 and HTTP 303.
- Claim commands run after the repair include `@claim:demo-sandbox`, `@claim:demo-reset`, `@claim:camera-states`, `@claim:local-only-reading`, `@claim:license-cache-24h`, and `@claim:license-verification-transfer`.
- Pre-deploy live verification is recorded in `.factory/handoff.md`; the final URL is <https://page-pointer.sociobot.in>.
