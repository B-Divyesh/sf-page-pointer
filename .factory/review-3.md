# Adversarial first-read review 3 — Page Pointer

Date: 2026-08-30 UTC  
Live URL: <https://page-pointer.sociobot.in>  
Reviewed repository commit: `f72a16a010bb3744392eef19f51a78c8e63cc4db`

## Verdict: PASS

This review found zero blocking, major, or minor findings. Every registered
claim command passed from a clean clone, the live page was clear at 390 px and
desktop before scrolling, and the one-click demo was isolated from real data.

## Cold first screen

Fresh Chromium contexts were used at 390 × 844 and 1440 × 900.

| Check | 390 px phone | 1440 px desktop |
| --- | --- | --- |
| What does it do? | Marks the current word or line in a physical book with a phone camera. | Same. |
| For whom? | Parents, tutors, and emerging readers. | Same. |
| What should I click first? | **Open camera** for a real book, or **Try it with sample data** to see it immediately. | Same. |

The exact headline, “Keep emerging readers on the right word.”, names the
job. The supporting sentence says, “For parents, tutors, and emerging
readers, it marks the current word on a physical book.” Both actions, their
result text, and the three facts were visible without scrolling. On the phone,
the final fact ended at y=635; on desktop it ended at y=781. This check passes.

## Demo and sandbox

The visible **Try it with sample data** action opened `/demo` in one click. Its
first product screen already showed *The Small Red Kite* with a placed guide at
`LINE 03 · WORD 04`. The persistent banner read “Demo — sample data, nothing
is saved” and contained **Reset demo** and **Start for real**.

Live interaction confirmed that Next changed the guide to `WORD 05`, Line
changed its pressed state, and no request occurred after guide interaction.
A completed sample session and the changed mode appeared only in
`demo:page-pointer`. The registered reset test also seeded distinct real data,
proved it survived Reset and Start for real, and proved that the demo database
was removed when leaving demo mode. The direct demo uses no camera request.

## Claims and clean-clone verification

A disposable clean clone was installed with `npm ci`. Each exact command in
`.factory/claims.json` was run individually. All 13 passed; the final
Playwright result was `{"status":"passed","failedTests":[]}`.

| Claim ID | Result | Verification |
| --- | --- | --- |
| `demo-sandbox` | PASS | Sample guide works with controls and only `demo:page-pointer`. |
| `demo-reset` | PASS | Populated demo reset and real-data preservation. |
| `local-ink-detection` | PASS | In-memory two-line pixel fixture. |
| `camera-states` | PASS | Rear-camera constraints, recovery states, stream release, and no post-load request. |
| `local-only-reading` | PASS | No reading request; export contains no page image or story text. |
| `local-data-roundtrip` | PASS | Import, 50-summary cap, export, and erase. |
| `offline-demo` | PASS | Camera and sample guides operated after an offline reload. |
| `pwa-update` | PASS | Precaching and a waiting-worker update flow. |
| `free-core` | PASS | Full camera guide works without account or license. |
| `paid-supporter` | PASS | Recorded INR 249 one-time fixture, saved color, timer, restore, and lock. |
| `license-verification-transfer` | PASS | Bodyless GET sends only the encoded license to Sociobot. |
| `license-cache-24h` | PASS | Controlled clock verifies the 24-hour reuse boundary. |
| `private-runtime` | PASS | Demo requests/resources/scripts/fonts are same-origin; no frame. |

`npm test` passed 12 Vitest tests. `npm run build` passed and produced `dist/`
with 11.31 KB gzip JavaScript. `npm run test:e2e` was also run from the clean
clone; its 30 mobile/desktop tests completed without failures.

## Claims, privacy, and missed leverage

The live landing and README claim-like statements map to the registered tests
above. In particular, the camera and sample guide have distinct no-request
checks after the shell load; neither test merely accepts same-origin uploads.
The live request log contained only page-pointer.sociobot.in documents and
self-hosted assets, then no request after moving the guide.

The brief calls for a local, non-distracting physical-book guide. Import,
export, local session summaries, a direct sample, and offline use are already
present. An AI feature would not improve this local, immediate placement task,
so no AI feature is expected and none is decorative or key-bearing.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, and the
  manifest returned 200. An unknown route returned the designed 404 with HTTP
  404. All crawled internal links returned 200; checkout correctly resolved to
  its hosted Sociobot/Dodo destination.
- Route titles are “Page Pointer — follow words in physical books”, “Demo —
  Page Pointer”, “Privacy — Page Pointer”, “Terms — Page Pointer”, and “Page
  not found — Page Pointer”. Each route has one h1, main, description,
  canonical, OG/Twitter metadata, favicon, and apple touch icon where required.
- Footer/header navigation is consistent. Deep links, Back, Forward, h1 focus,
  route announcement, and restored scroll are covered by the browser suite.
- Live response headers include a response-header CSP with
  `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and
  the camera-only permissions policy. There was no console error on load.
- Axe scans in the browser suite have zero serious or critical violations.
  Keyboard, 44 px target, 390 px overflow, skip link, and reduced-motion
  checks pass.
- The cyan drafting grid, clipped instrument controls, yellow guide, and
  original book/phone artwork match the documented blueprint drafting-sheet
  identity. This is not a generic SaaS-template surface.

## Earlier findings rechecked

Every earlier finding was checked against live behavior and the current source
or regression. “Fixed” below means confirmed, not merely marked fixed.

| Earlier ID | Result | Current confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | `offline-demo` operates both real and sample guides after offline reload. |
| F-1-2 | Fixed | `free-core` operates the unauthenticated real camera guide. |
| F-1-3 | Fixed | `paid-supporter` asserts the INR 24900 one-time fixture. |
| F-1-4 | Fixed | Copy says only “Checkout opens on Sociobot”; paid test covers it. |
| F-1-5 | Fixed | Refund-revocation causal copy is absent. |
| F-1-6 | Fixed | `license-cache-24h` asserts the exact boundary. |
| F-1-7 | Fixed | `private-runtime` checks requests, resources, scripts, fonts, and frames. |
| F-1-8 | Fixed | Route test confirms focus, announcement, Back/Forward, and scroll. |
| F-1-9 | Fixed | Static 404 test confirms canonical, OG/Twitter, and Apple icon. |
| F-1-10 | Fixed | Demo has no Supporter section or purchase link. |
| F-1-11 | Fixed | Checkout label identifies Sociobot and opening checkout. |
| F-1-12 | Fixed | README demo copy is split; no sentence exceeds 22 words. |
| F-1-13 | Fixed | Built-in content is consistently “sample guide”. |
| F-1-14 | Fixed | Account fact consistently says “No account needed.” |
| F-1-15 | Fixed | Privacy copy uses “reads, uploads, or stores the book’s words.” |
| F-1-16 | Fixed | Camera-frame handling is explained in plain language. |
| F-1-17 | Fixed | Unsupported script-version wording was removed. |
| F-1-18 | Fixed | Step heading is “Aim the rear camera.” |
| F-1-19 | Fixed | Step heading is “Tap the current word.” |
| F-1-20 | Fixed | Step heading is “Follow with Next.” |
| F-1-21 | Fixed | Button says “Restore Supporter pack.” |
| F-1-22 | Fixed | Button says “Install update.” |
| F-1-23 | Fixed | Timer repeat action names the ten-minute timer. |
| F-1-24 | Fixed | In-page camera button has no external-link arrow. |
| F-1-25 | Fixed | README gives camera recovery guidance. |
| F-1-26 | Fixed | README uses plain printed-line/word-space wording. |
| F-1-27 | Fixed | README uses the public control names. |
| F-1-28 | Fixed | README describes offline use without PWA/precache jargon. |
| F-1-29 | Fixed | README gives the user outcome for local import/export/erase. |
| F-1-30 | Fixed | Billing documentation sentence is concise. |
| F-1-31 | Fixed | Architecture names Vite/TypeScript plainly. |
| F-1-32 | Fixed | Frame handling says in-memory color removal and purpose. |
| F-1-33 | Fixed | Detection wording says dark marks, lines, and approximate boxes. |
| F-1-34 | Fixed | License storage is described as browser local storage. |
| F-1-35 | Fixed | Runtime privacy wording matches `private-runtime`. |
| F-1-36 | Fixed | 404 action says “Open Page Pointer.” |
| F-2-1 | Fixed | Both reading tests assert zero requests after interaction; camera test also requires GET/no body. |
| F-2-2 | Fixed | Reset test proves populated demo data, default reset state, and unchanged real data. |
| F-2-3 | Fixed | “Quiet” was removed; the tested promise is a ten-minute timer. |
| F-2-4 | Fixed | `license-verification-transfer` registers and tests the disclosure. |
| F-2-5 | Fixed | Comparative landscape claim became an operating instruction. |
| F-2-6 | Fixed | Untested support-envelope promise was removed. |
| F-2-7 | Fixed | Failure-condition list became direct recovery guidance. |
| F-2-8 | Fixed | Undefined “high-contrast” claim was removed from README. |
| F-2-9 | Fixed | README says “automated test,” not Playwright-only. |
| F-2-10 | Fixed | Release test derives audit word counts from the documented rule. |

## Copy audit

Counting rule: whitespace-delimited tokens containing a letter or number;
hyphenated terms count as one word and standalone punctuation does not. No
landing or README sentence exceeds 22 words. No banned marketing word,
inconsistent term, mood heading, or non-result-naming button was found.

### Landing: static sentences

| Sentence | Words |
| --- | ---: |
| Demo — sample data, nothing is saved. | 6 |
| Try the guide without using your reading data. | 8 |
| Keep emerging readers on the right word. | 7 |
| For parents, tutors, and emerging readers, it marks the current word on a physical book. | 15 |
| Opens the sample guide with a short story. | 8 |
| Frames stay on this device. | 5 |
| No account needed. | 3 |
| Works offline after its first visit. | 6 |
| An open illustrated book and phone are arranged on a cyan drafting mat. | 13 |
| A yellow guide crosses the phone screen. | 7 |
| Hold the phone steady above the page, then tap the word being read. | 13 |
| Camera view. | 2 |
| Tap or press Enter to place the reading guide. | 9 |
| The kite danced above the hill. | 6 |
| Mina held the string and smiled. | 6 |
| Up, up, it climbed into the blue. | 7 |
| Ready to place. | 3 |
| Tap a printed word. | 4 |
| Hold the rear camera above the page. | 7 |
| Turn the phone sideways before you aim. | 7 |
| Touch the word being read. | 5 |
| Page Pointer finds the nearest ink line—without reading it. | 9 |
| Use Next or the arrow keys to travel word by word. | 11 |
| Switch to a full-line guide anytime. | 6 |
| Flatten the page, reduce glare, move away from illustrations, and tap again. | 12 |
| You can also use Previous and Next. | 7 |
| The app checks each camera frame in memory, then discards it. | 11 |
| It never reads, uploads, or stores the book’s words. | 9 |
| Preferences and brief session summaries stay in this browser. | 9 |
| Export, import, or erase them whenever you like. | 8 |
| The complete reading guide stays free. | 6 |
| One purchase adds saved guide colors and a ten-minute session timer. | 11 |
| Checkout opens on Sociobot. | 4 |
| No account needed. | 3 |
| An app update is ready. | 5 |
| A reading guide for shared physical books. | 7 |

### Landing: dynamic sentences

| Sentence | Words |
| --- | ---: |
| Word guide placed. | 3 |
| Line guide placed. | 3 |
| Use Next when the reader moves. | 6 |
| Low contrast—tap again if this missed. | 6 |
| No clear line found. | 4 |
| Move closer, reduce glare, and tap the printed words again. | 10 |
| Waiting for camera permission… | 4 |
| This browser cannot open a camera. | 6 |
| Try the sample guide, or open Page Pointer in a current mobile browser. | 13 |
| Camera access is off. | 4 |
| Allow it in your browser's site settings, then try again—or try the sample guide. | 14 |
| The rear camera did not open. | 6 |
| Close other camera apps and try again, or try the sample guide. | 12 |
| End of detected text. | 4 |
| Start of detected text. | 4 |
| Turn the page or tap the next line. | 8 |
| Timer stopped. | 2 |
| Ten minutes complete. | 3 |
| Export downloaded. | 2 |
| Local data imported. | 3 |
| This is not a Page Pointer export. | 7 |
| This export is incomplete or damaged. | 6 |
| Import failed. | 2 |
| Erase preferences and session summaries stored by Page Pointer on this device? | 12 |
| Your license will not be removed. | 6 |
| Local reading data erased. | 4 |
| Supporter pack active on this device. | 6 |
| Paste the license token from your receipt. | 7 |
| Checking this license… | 3 |
| Purchase restored. | 2 |
| The Supporter pack is active. | 5 |
| This license is not active. | 5 |
| Check the token or buy the pack. | 7 |
| Could not check the license. | 5 |
| Wait a few seconds, then try again. | 7 |
| Could not check while offline. | 5 |
| Reconnect and try again. | 4 |
| Purchase verified. | 2 |
| License no longer active. | 4 |
| You can purchase again below. | 5 |
| Offline: using the last valid license check. | 7 |
| Close other Page Pointer demo tabs before resetting the demo. | 10 |
| The demo could not reset. | 5 |
| Reload and try again. | 4 |
| The demo could not close. | 5 |

### README sentences

| Sentence | Words |
| --- | ---: |
| Page Pointer helps parents, tutors, and emerging readers follow the current word in a physical book. | 16 |
| Aim a phone at the page and tap the current word. | 11 |
| A guide marks one word or line. | 7 |
| The app checks each camera frame in memory, then discards it. | 11 |
| It never reads, uploads, or stores the book’s words. | 9 |
| Live product: https://page-pointer.sociobot.in | 3 |
| Try the isolated sample guide at https://page-pointer.sociobot.in/demo. | 7 |
| It opens *The Small Red Kite* and stores data only in `demo:page-pointer`. | 12 |
| Reset it or discard it before starting for real. | 9 |
| The app explains how to recover when camera permission is denied, no camera is available, or page contrast is low. | 20 |
| The app finds printed lines and word spaces on your device. | 11 |
| It does not read the text. | 6 |
| Tap the current word, choose a word or line guide, or move it with Next, Previous, Arrow, and Space. | 19 |
| The sample guide works without camera permission. | 7 |
| Install the web app, use both guides offline after one visit, and install updates when prompted. | 16 |
| Save preferences and 50 brief session summaries in this browser. | 10 |
| Import, export, or erase them as JSON. | 7 |
| Optional ₹249 one-time Supporter pack through Sociobot billing; the complete reading guide stays free. | 14 |
| Requires Node.js 20.19+ (or 22.12+). | 5 |
| The development server prints its local URL. | 7 |
| Camera access requires localhost or HTTPS. | 6 |
| The factory deployment command is exactly `npm ci && npm test && npm run build`; `dist/index.html` is the static entry point. | 21 |
| `/demo`, `/privacy`, and `/terms` are configured static routes. | 8 |
| `dist/staticwebapp.config.json` supplies the required deployment headers, cache policy, and 404 response. | 11 |
| Every visitor-facing claim is listed in `.factory/claims.json` with an executable automated test. | 12 |
| The sandbox behavior and storage namespace are documented in `.factory/demo.md`. | 10 |
| `.factory/billing.md` records both checkout environments, the daily license check, and the measured request limit. | 14 |
| Run `npm run test:billing` to confirm both ₹249 checkout mappings against the live Sociobot catalogues. | 15 |
| The app uses Vite and TypeScript without a UI framework. | 10 |
| `src/detection.ts` removes color from each in-memory camera frame before checking page contrast. | 12 |
| It groups dark marks into printed lines and approximate word boxes. | 11 |
| It does not recognize or retain text. | 7 |
| IndexedDB stores only preferences and up to 50 session summaries. | 9 |
| A supplied license stays in this browser’s local storage. | 9 |
| Automatic license checks reuse a result for 24 hours. | 9 |
| The app loads no tracking, third-party code, remote fonts, or embedded checkout. | 12 |
| Hold the phone over a flat page and turn it sideways before you aim. | 14 |
| If placement misses, tap again or use the step controls. | 10 |
| Page Pointer does not diagnose or treat dyslexia. | 8 |
| Visual direction and asset provenance are in `.factory/design.md`. | 8 |
| Build verification and remaining product validation are in `.factory/handoff.md`. | 9 |
| MIT — see `LICENSE`. | 4 |

Headings name their sections and controls name their outcomes. Terminology is
consistent: **demo**, **sample guide**, **guide**, **physical book**, **local
data**, **session summary**, **Supporter pack**, and **license**.

## What would make this perfect

No corrective product work is indicated by this review. Preserve the existing
claim-to-test discipline when changing wording, demo behavior, billing, or the
service worker; a new visitor-facing promise should ship with an observable
clean-sandbox regression.
