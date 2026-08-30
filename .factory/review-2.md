# Adversarial first-read review 2 — Page Pointer

Date: 2026-08-30 UTC

Live URL: <https://page-pointer.sociobot.in>

Reviewed candidate: `e1b7fd77c8bac42bfc8e491ba8fc81a034bd4df7`

Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict: FAIL

The first screen, live demo, routing, accessibility, and visual identity pass.
All 12 commands in `.factory/claims.json` also exit successfully. The product
still fails the zero-finding standard: four tagged tests do not prove their
full registered or public wording, five public capability statements are not
represented in the claims registry, one README sentence misstates the test
harness, and the checked-in copy audit contains incorrect counts.

## First screen, before scrolling

### Phone, 390 × 844

- What it does: it uses a phone camera to mark the word or line being read in a
  physical book.
- For whom: parents, tutors, and emerging readers.
- What to click first: **Open camera** for a real page, or **Try it with sample
  data** to see the guide immediately.

The exact headline was “Keep emerging readers on the right word.” The audience
sentence was “For parents, tutors, and emerging readers, it marks the current
word on a physical book.” Both actions, the sample-result sentence, and all
three facts were visible without scrolling; the last fact ended at y=635 in an
844 px viewport. This check passes.

### Desktop, 1440 × 900

The answers were the same. Both actions, the sample-result sentence, all three
facts, and the product image were visible without scrolling. The last fact
ended at y=781 in a 900 px viewport. This check passes.

## Findings, ordered by severity

### Blocking

#### F-2-1 — The privacy tests would allow a same-origin frame upload

- Exact quote/location: landing fact, “Frames stay on this device.” Privacy,
  “Page Pointer does not send, record, or save pictures of books” and “Nothing
  leaves during reading.” Registered `camera-states` claim: “without sending
  frames.”
- Evidence: `@claim:camera-states` only checks that every request origin equals
  the app origin. `@claim:local-only-reading` likewise checks only
  `requests.every(sameOrigin)`. A new `POST /frames` to the Page Pointer origin
  would leave both tests green. Neither assertion checks methods, request
  bodies, nor that camera interaction creates no network request. The current
  code and live request log showed no upload, but the claimed regression does
  not guard that behavior.
- Why this fails: “stays on this device” and “nothing leaves” prohibit an upload
  to the product's own origin as well as to a third party.
- Concrete fix: register the exact no-network-during-reading wording. In a
  camera flow, snapshot requests after the shell loads, interact with a frame,
  and assert that no later HTTP request occurs. Also fail on any request body
  or storage value containing frame/image bytes.

#### F-2-2 — The Reset claim test does not prove a populated demo was reset

- Exact quote/location: `.factory/claims.json` `demo-reset` sandbox, “records a
  sample session, resets it, verifies an empty demo store, then starts real
  mode”; live button, “Reset demo.”
- Evidence: the tagged test waits, clicks **Close guide**, immediately clicks
  **Reset demo**, and only checks that `sessions` is empty after reload. It
  never asserts that a session existed before Reset, never changes and checks a
  demo preference, never verifies an empty store, and never seeds real data to
  prove it survived. `stopWorkspace()` starts `addSession()` through a `void`
  event handler, so the Reset click can race the unobserved write. My live
  manual flow did confirm that Reset and real-data isolation currently work;
  the registered regression does not prove the stated sandbox.
- Why this fails: a no-op Reset or a Reset that clears only sessions could pass
  the current claim test.
- Concrete fix: seed a unique real preference, change the demo mode, keep the
  demo open long enough to save a session, and assert both demo values before
  Reset. After Reset, assert default demo preferences, no sessions, and the
  unchanged real value. After **Start for real**, assert the demo database is
  gone and the real value remains.

#### F-2-3 — The paid test does not prove that the timer is “quiet”

- Exact quote/location: landing and Terms, “quiet ten-minute session timer”;
  registered `paid-supporter` claim, “a quiet ten-minute timer.”
- Evidence: the tagged test asserts `10:00 remaining` and “Ten minutes
  complete.” It does not assert the absence of audio playback or otherwise
  define “quiet.”
- Why this fails: “quiet” is part of the paid feature promise, but the test
  proves duration and completion only.
- Concrete fix: either change all copy and the registered claim to
  “ten-minute timer,” or define “quiet” as “plays no sound” and assert that no
  audio element, `play()` call, or audio context is used through completion.

#### F-2-4 — The privacy route contains an unlisted data-transfer claim

- Exact quote/location: `/privacy`, “If you buy or restore the Supporter pack,
  Page Pointer sends the license to Sociobot for purchase verification.”
- Evidence: no `.factory/claims.json` entry states what purchase data leaves
  the device or its destination. The paid-feature test happens to intercept a
  verification URL, but its registered claim only covers price and unlocked
  features.
- Why this fails: this is a material privacy disclosure that a buyer may rely
  on.
- Concrete fix: add a privacy-transfer claim and a test that restores a fixture
  license, records every request, and asserts the exact Sociobot destination
  and that only the license value is sent.

#### F-2-5 — “Landscape works best” is an unlisted comparative claim

- Exact quote/location: landing, How it works, “Landscape works best.”
- Evidence: no claim entry defines or compares portrait and landscape success.
  The detection fixture has one fixed horizontal geometry.
- Why this fails: “best” promises a measured advantage without a definition or
  test.
- Concrete fix: replace it with the actionable “Turn the phone sideways for a
  wider camera view,” or register a measurable orientation claim and fixture.

#### F-2-6 — The supported text envelope is unlisted and untested

- Exact quote/location: landing and Terms, “This version works with printed
  text that uses the Latin alphabet.” README adds “well-lit, horizontal.”
- Evidence: `local-ink-detection` uses anonymous rectangles, not a photographed
  Latin-text fixture, and no claims entry states the supported script,
  orientation, or lighting envelope.
- Why this fails: a parent deciding whether the app supports a book can rely on
  this sentence, but the sandbox does not prove it.
- Concrete fix: add a support-envelope claim with representative horizontal
  Latin print and low-light boundary fixtures, or rewrite as a scope
  instruction that does not promise tested performance.

#### F-2-7 — The listed failure conditions are unregistered capability claims

- Exact quote/location: landing, “Curved pages, glare, illustrations, or unusual
  layouts can confuse placement.” README additionally lists columns,
  handwriting, vertical text, and decorative layouts; Terms adds low contrast.
- Evidence: only a blank low-contrast frame is tested. There are no registered
  fixtures for curvature, glare, illustrations, columns, handwriting, vertical
  text, or decorative layouts.
- Why this fails: honest limitations are useful, but these are still factual
  statements about detector behavior and the claims contract requires them to
  be testable.
- Concrete fix: add named fixtures and one registered limits claim, or rewrite
  the copy as recovery guidance: “If placement misses, flatten the page,
  reduce glare, move away from illustrations, and tap again.”

#### F-2-8 — “High-contrast” is an undefined, unlisted product claim

- Exact quote/location: README introduction, “A high-contrast guide marks one
  word or line.”
- Evidence: no claims entry defines a contrast ratio or tests the guide against
  the camera/page backgrounds. Axe does not evaluate this canvas overlay.
- Why this fails: “high-contrast” is a measurable accessibility adjective, not
  a substitute for a concrete visual description.
- Concrete fix: write “A yellow outline and underline mark one word or line,”
  or register a contrast threshold and test every guide/background pair.

### Minor

#### F-2-9 — The README incorrectly says every claim uses Playwright

- Exact quote/location: README, Claims, demo, and billing: “Every
  visitor-facing claim is listed in `.factory/claims.json` with an executable
  Playwright regression.”
- Evidence: `local-ink-detection` runs with Vitest via `npm test`, not
  Playwright.
- Why this fails: a verifier following the README receives an inaccurate
  description of the test suite; “Playwright regression” is also unnecessary
  tool jargon here.
- Concrete fix: “Every visitor-facing claim is listed in
  `.factory/claims.json` with an executable automated test.”

#### F-2-10 — The checked-in copy audit contains six incorrect word counts

- Exact location: `.factory/copy-audit.md`, which says “Words are counted by
  whitespace.”
- Evidence: the recorded counts are wrong for “Frames stay on this device.”
  (recorded 6, actual 5), “Works offline after its first visit.” (7/6), “Mina
  held the string and smiled.” (7/6), “Up, up, it climbed into the blue.”
  (8/7), and “The app checks each camera frame in memory, then discards it.”
  (10/11). “Demo — sample data, nothing is saved.” is recorded as 6 only if the
  punctuation-only dash is excluded, contradicting the stated whitespace
  method.
- Why this fails: the audit's release test trusts the typed numbers instead of
  deriving them, so future over-limit copy can be hidden by a wrong count.
- Concrete fix: choose and document one counting rule, correct these rows, and
  generate or validate counts from the source strings in the release test.

## Copy audit

Counting rule: a word is a whitespace-delimited token containing at least one
letter or number; hyphenated terms count as one and standalone punctuation does
not count. No sentence exceeds 22 words. No banned marketing word appears.
F-2-8 flags the undefined marketing/accessibility adjective “high-contrast.”
F-2-9 flags the inaccurate README test-tool wording.

### Landing and demo: static sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved. | 6 | Pass |
| Try the guide without using your reading data. | 8 | Pass |
| Keep emerging readers on the right word. | 7 | Pass |
| For parents, tutors, and emerging readers, it marks the current word on a physical book. | 15 | Pass |
| Opens the sample guide with a short story. | 8 | Pass |
| Frames stay on this device. | 5 | Claim coverage F-2-1 |
| No account needed. | 3 | Pass |
| Works offline after its first visit. | 6 | Pass |
| An open illustrated book and phone are arranged on a cyan drafting mat. | 13 | Pass |
| A yellow guide crosses the phone screen. | 7 | Pass |
| Hold the phone steady above the page, then tap the word being read. | 13 | Pass |
| Camera view. | 2 | Pass |
| Tap or press Enter to place the reading guide. | 9 | Pass |
| The kite danced above the hill. | 6 | Pass |
| Mina held the string and smiled. | 6 | Pass |
| Up, up, it climbed into the blue. | 7 | Pass |
| Ready to place. | 3 | Pass |
| Tap a printed word. | 4 | Pass |
| Hold the rear camera above a well-lit printed page. | 9 | Pass |
| Landscape works best. | 3 | Unlisted claim F-2-5 |
| Touch the word being read. | 5 | Pass |
| Page Pointer finds the nearest ink line—without reading it. | 9 | Pass |
| Use Next or the arrow keys to travel word by word. | 11 | Pass |
| Switch to a full-line guide anytime. | 6 | Pass |
| This version works with printed text that uses the Latin alphabet. | 11 | Unlisted claim F-2-6 |
| Curved pages, glare, illustrations, or unusual layouts can confuse placement. | 10 | Unlisted claim F-2-7 |
| Tap again or use Previous and Next. | 7 | Pass |
| The app checks each camera frame in memory, then discards it. | 11 | Pass |
| It never reads, uploads, or stores the book’s words. | 9 | Claim coverage F-2-1 |
| Preferences and brief session summaries stay in this browser. | 9 | Pass |
| Export, import, or erase them whenever you like. | 8 | Pass |
| The complete reading guide stays free. | 6 | Pass |
| One purchase adds saved guide colors and a quiet ten-minute session timer. | 12 | Claim coverage F-2-3 |
| Checkout opens on Sociobot. | 4 | Pass |
| No account needed. | 3 | Pass |
| An app update is ready. | 5 | Pass |
| A reading guide for shared physical books. | 7 | Pass |

Static landing sentences average 7.4 words; maximum 15.

### Landing and demo: dynamic sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Word guide placed. | 3 | Pass |
| Line guide placed. | 3 | Pass |
| Use Next when the reader moves. | 6 | Pass |
| Low contrast—tap again if this missed. | 6 | Pass |
| No clear line found. | 4 | Pass |
| Move closer, reduce glare, and tap the printed words again. | 10 | Pass |
| Waiting for camera permission… | 4 | Pass |
| This browser cannot open a camera. | 6 | Pass |
| Try the sample guide, or open Page Pointer in a current mobile browser. | 13 | Pass |
| Camera access is off. | 4 | Pass |
| Allow it in your browser's site settings, then try again—or try the sample guide. | 14 | Pass |
| The rear camera did not open. | 6 | Pass |
| Close other camera apps and try again, or try the sample guide. | 12 | Pass |
| End of detected text. | 4 | Pass |
| Start of detected text. | 4 | Pass |
| Turn the page or tap the next line. | 8 | Pass |
| Timer stopped. | 2 | Pass |
| Ten minutes complete. | 3 | Pass |
| Export downloaded. | 2 | Pass |
| Local data imported. | 3 | Pass |
| This is not a Page Pointer export. | 7 | Pass |
| This export is incomplete or damaged. | 6 | Pass |
| Import failed. | 2 | Pass |
| Erase preferences and session summaries stored by Page Pointer on this device? | 12 | Pass |
| Your license will not be removed. | 6 | Pass |
| Local reading data erased. | 4 | Pass |
| Supporter pack active on this device. | 6 | Pass |
| Paste the license token from your receipt. | 7 | Pass |
| Checking this license… | 3 | Pass |
| Purchase restored. | 2 | Pass |
| The Supporter pack is active. | 5 | Pass |
| This license is not active. | 5 | Pass |
| Check the token or buy the pack. | 7 | Pass |
| Could not check the license. | 5 | Pass |
| Wait a few seconds, then try again. | 7 | Pass |
| Could not check while offline. | 5 | Pass |
| Reconnect and try again. | 4 | Pass |
| Purchase verified. | 2 | Pass |
| License no longer active. | 4 | Pass |
| You can purchase again below. | 5 | Pass |
| Offline: using the last valid license check. | 7 | Pass |
| Close other Page Pointer demo tabs before resetting the demo. | 10 | Pass |
| The demo could not reset. | 5 | Pass |
| Reload and try again. | 4 | Pass |
| The demo could not close. | 5 | Pass |

Dynamic sentences average 5.6 words; maximum 14.

### README sentences

URLs, code spans, and titles count as one token when they contain no spaces.

| Sentence | Words | Result |
| --- | ---: | --- |
| Page Pointer helps parents, tutors, and emerging readers follow the current word in a physical book. | 16 | Pass |
| Aim a phone at the page and tap the current word. | 11 | Pass |
| A high-contrast guide marks one word or line. | 8 | Unlisted/marketing claim F-2-8 |
| The app checks each camera frame in memory, then discards it. | 11 | Pass |
| It never reads, uploads, or stores the book’s words. | 9 | Claim coverage F-2-1 |
| Try the isolated sample guide at `https://page-pointer.sociobot.in/demo`. | 7 | Pass |
| It opens *The Small Red Kite* and stores data only in `demo:page-pointer`. | 12 | Pass |
| Reset it or discard it before starting for real. | 9 | Claim coverage F-2-2 |
| The app explains how to recover when camera permission is denied, no camera is available, or page contrast is low. | 20 | Pass |
| The app finds printed lines and word spaces on your device. | 11 | Pass |
| It does not read the text. | 6 | Pass |
| Tap the current word, choose a word or line guide, or move it with Next, Previous, Arrow, and Space. | 19 | Pass |
| The sample guide works without camera permission. | 7 | Pass |
| Install the web app, use both guides offline after one visit, and install updates when prompted. | 16 | Pass |
| Save preferences and 50 brief session summaries in this browser. | 10 | Pass |
| Import, export, or erase them as JSON. | 7 | Pass |
| Optional ₹249 one-time Supporter pack through Sociobot billing; the complete reading guide stays free. | 14 | Pass |
| Requires Node.js 20.19+ (or 22.12+). | 5 | Pass |
| The development server prints its local URL. | 7 | Pass |
| Camera access requires localhost or HTTPS. | 6 | Pass |
| The factory deployment command is exactly `npm ci && npm test && npm run build`; `dist/index.html` is the static entry point. | 21 | Pass |
| `/demo`, `/privacy`, and `/terms` are configured static routes. | 8 | Pass |
| `dist/staticwebapp.config.json` supplies the required deployment headers, cache policy, and 404 response. | 11 | Pass |
| Every visitor-facing claim is listed in `.factory/claims.json` with an executable Playwright regression. | 12 | Inaccurate; F-2-9 |
| The sandbox behavior and storage namespace are documented in `.factory/demo.md`. | 10 | Pass |
| `.factory/billing.md` records both checkout environments, the daily license check, and the measured request limit. | 14 | Pass |
| Run `npm run test:billing` to confirm both ₹249 checkout mappings against the live Sociobot catalogues. | 15 | Pass |
| The app uses Vite and TypeScript without a UI framework. | 10 | Pass |
| `src/detection.ts` removes color from each in-memory camera frame before checking page contrast. | 12 | Pass |
| It groups dark marks into printed lines and approximate word boxes. | 11 | Pass |
| It does not recognize or retain text. | 7 | Pass |
| IndexedDB stores only preferences and up to 50 session summaries. | 10 | Pass |
| A supplied license stays in this browser’s local storage. | 9 | Pass |
| Automatic license checks reuse a result for 24 hours. | 9 | Pass |
| The app loads no tracking, third-party code, remote fonts, or embedded checkout. | 12 | Pass |
| Atkinson Hyperlegible and IBM Plex Mono are bundled under their open licenses. | 12 | Pass |
| This version works with well-lit, horizontal, printed text that uses the Latin alphabet. | 13 | Unlisted claim F-2-6 |
| Curvature, glare, columns, illustrations, handwriting, vertical text, and decorative layouts can reduce placement quality. | 14 | Unlisted claim F-2-7 |
| Users can tap again or use the step controls. | 9 | Pass |
| Page Pointer does not diagnose or treat dyslexia. | 8 | Pass |
| Visual direction and asset provenance are in `.factory/design.md`. | 8 | Pass |
| Build verification and remaining product validation are in `.factory/handoff.md`. | 9 | Pass |
| MIT — see `LICENSE`. | 4 | Pass |

README sentences average 10.7 words; maximum 21.

### Headings, labels, terminology, and controls

Landing headings name their sections: “Keep emerging readers on the right
word,” “Place the guide,” “Follow each word in a physical book,” “Aim the rear
camera,” “Tap the current word,” “Follow with Next,” “Reading stays private on
this device,” and “Add colors and a timer for ₹249.” README headings also make
sense out of context. Controls name results: “Open camera,” “Try it with sample
data,” “Close guide,” “Reset demo,” “Start for real,” “Export JSON,” “Import
JSON,” “Erase local data,” “Restore Supporter pack,” and “Install update.” Word,
Line, Previous, and Next are unambiguous inside their named control groups.

Terminology is consistent: **demo** for the isolated mode, **sample guide** for
its content, **guide** for the marker, **physical book** for the material,
**local data** for stored information, **session summary** for usage records,
**Supporter pack** for the paid add-on, and **license** for purchase proof.

## Demo and sandbox

The live demo behavior passes manual verification.

- One click on **Try it with sample data** opened `/demo` and automatically
  showed *The Small Red Kite* with a placed guide at `LINE 03 · WORD 04`.
- The persistent banner said “Demo — sample data, nothing is saved” and showed
  **Reset demo** and **Start for real**.
- Next changed the coordinate to `WORD 05`; Line changed `aria-pressed` and
  widened the guide.
- A six-second sample session was stored only in `demo:page-pointer`.
- I seeded `page-pointer` with a unique real preference before entering demo.
  Reset restored demo defaults, Start for real deleted the demo database, and
  the real preference remained unchanged.
- The complete live flow requested only `page-pointer.sociobot.in` resources.
- After a priming visit, `/demo` reloaded offline and Next moved the guide from
  `WORD 04` to `WORD 05`; no request failed.

F-2-2 is about missing regression proof, not a reproduced live data leak.

## Claims execution and coverage

Every exact command was run separately from the clean candidate checkout after
`npm ci`.

| Claim | Exact command | Command | Coverage |
| --- | --- | --- | --- |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 2 projects | PASS |
| `demo-reset` | `npm run test:e2e -- --grep @claim:demo-reset` | PASS, 2 projects | FAIL; F-2-2 |
| `local-ink-detection` | `npm test -- --testNamePattern @claim:local-ink-detection` | PASS, 1 test | PASS |
| `camera-states` | `npm run test:e2e -- --grep @claim:camera-states` | PASS, 2 projects | FAIL; F-2-1 |
| `local-only-reading` | `npm run test:e2e -- --grep @claim:local-only-reading` | PASS, 2 projects | FAIL for broader privacy wording; F-2-1 |
| `local-data-roundtrip` | `npm run test:e2e -- --grep @claim:local-data-roundtrip` | PASS, 2 projects | PASS |
| `offline-demo` | `npm run test:e2e -- --grep @claim:offline-demo` | PASS, 2 projects | PASS |
| `pwa-update` | `npm run test:e2e -- --grep @claim:pwa-update` | PASS, 2 projects | PASS |
| `free-core` | `npm run test:e2e -- --grep @claim:free-core` | PASS, 2 projects | PASS |
| `paid-supporter` | `npm run test:e2e -- --grep @claim:paid-supporter` | PASS, 2 projects | FAIL for “quiet”; F-2-3 |
| `license-cache-24h` | `npm run test:e2e -- --grep @claim:license-cache-24h` | PASS, 2 projects | PASS |
| `private-runtime` | `npm run test:e2e -- --grep @claim:private-runtime` | PASS, 2 projects | PASS |

F-2-4 through F-2-8 are unlisted claims. No registered command returned a
non-zero exit code; the failures above are assertion-scope failures.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown URL returned
  the designed 404 with HTTP 404.
- Titles were route-specific: “Page Pointer — follow words in physical books,”
  “Demo — Page Pointer,” “Privacy — Page Pointer,” “Terms — Page Pointer,” and
  “Page not found — Page Pointer.” Each route had one h1, one main, `lang=en`, a
  description, canonical, OG/Twitter image data, SVG favicon, and Apple icon.
- Deep links reloaded correctly. A footer navigation to Privacy focused and
  announced the new h1. Back restored the home scroll position and focused and
  announced the home h1; Forward also passed in the full suite.
- Internal links, `robots.txt`, `sitemap.xml`, the manifest, icons, and social
  image returned their expected 200 status. The checkout endpoint returned 303
  to the named Dodo checkout host. Mail links were explicit. No dead link was
  found.
- Live Axe WCAG 2 A/AA scans reported zero violations on all five routes at
  390 px. There was no horizontal overflow, missing image alternative, running
  animation under reduced motion, or console/page error on successful routes.
  The deliberate 404 produced only Chromium's expected failed-document log.
- The blueprint grid, drafting marks, clipped geometry, petrol/cyan/yellow
  palette, self-hosted type pairing, and original book/phone art are distinct
  and match `.factory/design.md`; this is not a generic SaaS template.
- Production application JavaScript is 33.10 kB raw / 11.39 kB gzip. The built
  and live `index.html` files had the same SHA-256,
  `264ae69f22ba9244db09551e6e9971b5dc2072f147ceb582ccfd7f4de9641f5d`.

## Earlier finding recheck

Every F-1 finding was checked in the live site and source, not accepted from
the polish report alone. None recurred under its original ID.

| Earlier finding | Current live/code result |
| --- | --- |
| F-1-1 | Fixed: offline test operates both real camera and sample guides in a dedicated context; live demo also moved offline. |
| F-1-2 | Fixed: unauthenticated real camera controls are exercised without a license gate. |
| F-1-3 | Fixed: tagged fixture asserts INR 24900 and one-time billing; live billing verifier confirms both catalogues. |
| F-1-4 | Fixed: payment/refund-handler copy was replaced by the tested “Checkout opens on Sociobot.” |
| F-1-5 | Fixed: refund-to-revocation copy is absent. |
| F-1-6 | Fixed: `license-cache-24h` is registered and tests both sides of 24 hours. |
| F-1-7 | Fixed: `private-runtime` covers tracking, outside code, fonts, and embedded checkout in demo. |
| F-1-8 | Fixed: route h1 focus, polite announcement, Back/Forward, and restored scroll pass live and locally. |
| F-1-9 | Fixed: live 404 has canonical, OG/Twitter data, Apple icon, and favicon. |
| F-1-10 | Fixed: the demo DOM has no Supporter section or purchase link. |
| F-1-11 | Fixed: checkout says “on Sociobot (opens checkout)” in visible and accessible text. |
| F-1-12 | Fixed: the README demo copy is split into 12- and 9-word sentences. |
| F-1-13 | Fixed: trial content is consistently called the “sample guide.” |
| F-1-14 | Fixed: “No account needed.” is consistent. |
| F-1-15 | Fixed: public copy says the app never reads, uploads, or stores the book's words. |
| F-1-16 | Fixed: frame handling now says it is checked in memory and discarded. |
| F-1-17 | Fixed: version/script shorthand was replaced by plain Latin-alphabet wording; F-2-6 is a new claims-registration issue. |
| F-1-18 | Fixed: heading is “Aim the rear camera.” |
| F-1-19 | Fixed: heading is “Tap the current word.” |
| F-1-20 | Fixed: heading is “Follow with Next.” |
| F-1-21 | Fixed: control is “Restore Supporter pack.” |
| F-1-22 | Fixed: control is “Install update.” |
| F-1-23 | Fixed: completed control is “Start 10-minute timer again.” |
| F-1-24 | Fixed: Open camera has no external-link arrow. |
| F-1-25 | Fixed: README gives concrete recovery cases. |
| F-1-26 | Fixed: README describes printed lines and word spaces on-device. |
| F-1-27 | Fixed: README uses the exact control labels. |
| F-1-28 | Fixed: README describes install, offline use, and updates without PWA/precaching jargon. |
| F-1-29 | Fixed: README states the 50-summary outcome and import/export/erase actions. |
| F-1-30 | Fixed: billing documentation sentence is shorter and concrete. |
| F-1-31 | Fixed: architecture says Vite and TypeScript without a UI framework. |
| F-1-32 | Fixed: the frame color-removal sentence explains its purpose. |
| F-1-33 | Fixed: the detector sentence uses dark marks, lines, and approximate word boxes. |
| F-1-34 | Fixed: license storage is described as this browser's local storage. |
| F-1-35 | Fixed: runtime privacy wording matches `private-runtime`. |
| F-1-36 | Fixed: the 404 action is “Open Page Pointer.” |

## Missed leverage

No additional product feature is an obvious omission from the brief. Local
JSON import/export already exists. Cloud sync would conflict with the
local-first privacy model. An AI call would add cost, latency, and data transfer
to a deterministic geometry task, so no Sociobot gateway feature is justified.
No model/provider key or decorative AI feature is present.

## Verification commands

The following completed successfully:

```text
npm ci
all 12 exact test commands from .factory/claims.json
npm test                         # 12 passed
npm run build                    # dist/ produced
npm run test:e2e                 # 28 passed
npm run test:billing             # production and pilot INR 249.00; HTTP 303
```

Live checks additionally covered first-screen geometry, demo isolation and
Reset, offline reload, request origins, five-route metadata, link status,
route focus/history, reduced motion, and Axe.

## What would make this perfect

Close F-2-1 through F-2-10, then rerun every registered command and the full
live checklist from fresh contexts. In particular, make the privacy and Reset
tests fail under the regressions their wording forbids, register or remove each
remaining capability claim, replace the inaccurate Playwright sentence, and
derive copy counts instead of trusting hand-entered numbers. PASS requires zero
findings and no untested claim.
