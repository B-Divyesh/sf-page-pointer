# Adversarial first-read review 1 — Page Pointer

Date: 2026-08-29

Live URL: <https://page-pointer.sociobot.in>

Reviewed candidate: `bb296019baa02f11434f0f4022ef30f8b5be0fa1`

Viewport checks: 390 × 844 and 1440 × 900, fresh Chromium contexts

## Verdict: FAIL

The product is clear and genuinely tryable, but it does not meet the zero-finding
standard. Three registered claims have tests that pass without proving the full
public wording, four public claim sentences are not represented accurately in
the claims registry, and there are route-focus, metadata, link, and copy defects.

## First screen, before scrolling

### Phone, 390 × 844

- What it does: it uses a phone camera to keep an emerging reader on the current
  word in a physical book.
- For whom: parents, tutors, and emerging readers.
- What to click first: **Open camera** is the visually primary action. **Try it
  with sample data** is also fully visible, with “Opens a practice page with a
  short sample story.” immediately below it.

The exact first-screen text was “Keep emerging readers on the right word.” and
“For parents, tutors, and emerging readers, it marks the current word on a
physical book.” The sample action ended at y=514 in an 844 px viewport. This
check passes.

### Desktop, 1440 × 900

The same three questions have the same answers. Both actions, the action note,
and all three facts are visible without scrolling. The sample action ended at
y=680 in a 900 px viewport. This check passes.

## Findings, ordered by severity

### Blocking

#### F-1-1 — The public offline claim is broader than its registered test

- Exact quote/location: landing first-screen fact, “Works offline after its
  first visit.” README: “Installable PWA with first-visit precaching, offline
  navigation, and an update action.”
- Evidence: `offline-demo` passes, but its claim and test cover only the sample
  guide at `/demo`. The test never opens or operates the real camera guide while
  offline. A first-time visitor reads the hero sentence as a claim about the
  whole product.
- Why this fails: the public claim is not fully tested. The claim contract
  requires the observable promise, not a narrower substitute.
- Concrete fix: either change the public fact to “The sample guide works offline
  after its first visit,” or expand `offline-demo` to open and operate the real
  guide with a fake camera after `context.setOffline(true)`.

#### F-1-2 — The “complete reading guide” claim is not proved by its test

- Exact quote/location: landing Supporter section and README, “The complete
  reading guide stays free.” Registered claim: “Parents and tutors can use the
  complete reading guide without an account.”
- Evidence: `@claim:free-core` checks the no-account text and opens `/demo`; it
  does not open the real rear-camera guide or exercise its controls without a
  license.
- Why this fails: “complete” promises more than access to the sample path.
- Concrete fix: in `@claim:free-core`, start in a clean unauthenticated real
  context, open the fake rear camera, place and move the guide, switch modes,
  and confirm no license or sign-in gate appears.

#### F-1-3 — The quantitative ₹249 claim passes without testing ₹249

- Exact quote/location: `.factory/claims.json` `paid-supporter`, “The optional
  Supporter pack costs ₹249 once…”; landing heading, “Add colors and a timer for
  ₹249”; README, “Optional ₹249 one-time Supporter pack…”
- Evidence: the exact registered command passes, but the tagged Playwright test
  only checks a fixed checkout URL and mocked license responses. It never reads
  the live or fixture catalogue, never asserts `INR`, `24900`, or one-time
  billing. `npm run test:billing` does prove production and pilot at INR 249.00,
  but that command is not the registered claim test.
- Why this fails: a quantitative public claim remains untested by its declared
  regression even though a separate verifier happens to pass.
- Concrete fix: make the tagged claim test invoke or incorporate the catalogue
  and checkout assertions from `scripts/verify-billing.mjs`, using a recorded
  fixture for deterministic builds and a separate optional live verification.

#### F-1-4 — Payment and refund handling is an unlisted claim

- Exact quote/location: landing, “Sociobot/Dodo handles payment and refunds.”
- Evidence: no entry in `.factory/claims.json` states or tests who handles both
  payment and refunds.
- Why this fails: a buyer may rely on the named merchant and refund handler.
- Concrete fix: add a claim and a no-charge test of the checkout merchant and
  published refund route/notice, or rewrite to the narrower tested fact:
  “Checkout opens on Sociobot.”

#### F-1-5 — Refund revocation is an unlisted and untested claim

- Exact quote/location: landing, “A refund revokes the license.” Terms repeats,
  “It handles refunds, and a refund revokes the associated license.”
- Evidence: `paid-supporter` injects an arbitrary mocked revoked-license
  response. It does not connect a refund event to revocation, and no claims entry
  promises that connection.
- Why this fails: this is a material purchase condition.
- Concrete fix: register a refund-revocation claim and test a recorded refunded
  licence response from the Sociobot contract, or remove this sentence until
  that behavior is verifiable.

#### F-1-6 — The 24-hour license-cache claim is unlisted

- Exact quote/location: README, “Automatic checks use the cached result for 24
  hours.”
- Evidence: no claims entry states the 24-hour duration. `paid-supporter` only
  verifies that one immediate reload does not repeat a check.
- Why this fails: the number is a quantitative behavior a user may rely on,
  especially offline.
- Concrete fix: add a `license-cache-24h` claim using a controlled clock that
  checks no request before 24 hours and a new request at or after 24 hours.

#### F-1-7 — The README privacy-stack sentence exceeds the registered privacy claim

- Exact quote/location: README, “The app contains no analytics, third-party
  runtime scripts, CDN fonts, or payment widgets.”
- Evidence: `local-only-reading` records requests during the sample reading
  flow, but its registered wording covers reading requests and export contents,
  not the four broader implementation promises in this sentence.
- Why this fails: the registry says every visitor-facing claim is listed, but
  this broader claim is not.
- Concrete fix: register a static/runtime supply-chain claim that inspects built
  HTML, scripts, font URLs, and the full demo request log, or narrow the README
  to the tested sentence “The sample reading flow sends no third-party request.”

### Major

#### F-1-8 — Route changes do not move focus to or announce the new h1

- Exact location: links between `/`, `/demo`, `/privacy`, and `/terms`.
- Evidence: after activating Privacy from the home page, `document.activeElement`
  is `BODY`; the same is true after Back. There is no route announcement region.
  Back does restore the prior scroll position.
- Why this fails: keyboard and screen-reader users are not placed at the new
  page heading as required by the site-structure contract.
- Concrete fix: focus a `tabindex="-1"` h1 after navigation and announce its
  text in a polite live region; add forward/back tests for focus and scroll.

#### F-1-9 — The designed 404 lacks required route metadata

- Exact location: an unknown URL such as `/not-a-real-page`.
- Evidence: the 404 returns HTTP 404 with a unique title, description, h1, and
  favicon, but it has no canonical, Open Graph fields, Twitter card, or
  apple-touch icon.
- Why this fails: the metadata checklist applies per route.
- Concrete fix: add a canonical for `/404.html`, the product social image and
  OG/Twitter fields, and the apple-touch icon to `public/404.html`.

#### F-1-10 — Demo DOM contains a dead purchase link

- Exact location: `/demo`, hidden Supporter section, “Buy once · ₹249” with
  resolved URL `https://page-pointer.sociobot.in/demo#`.
- Evidence: the section is visually hidden, but the anchor remains in the DOM
  with `href="#"`; the link crawl resolves it to the current page and no action.
- Why this fails: source crawlers still encounter a non-result URL, and the site
  contract permits no dead links.
- Concrete fix: do not render the Supporter section in demo mode, or assign the
  real checkout URL and remove it from the accessibility tree while hidden.

#### F-1-11 — The checkout link does not identify an external destination

- Exact location: landing Supporter section, “Buy once · ₹249”.
- Evidence: it navigates from Page Pointer to `api.sociobot.in`, then redirects
  to `checkout.dodopayments.com`; the label and accessible name do not say this.
- Why this fails: the site-structure contract says external links must say so.
- Concrete fix: use “Buy once for ₹249 on Sociobot (opens checkout)” and expose
  the destination in the accessible name.

### Minor — copy audit findings

Each row is a separate finding and includes the required rewrite.

| ID | Exact quote/location | Why it is flagged | Proposed rewrite |
| --- | --- | --- | --- |
| F-1-12 | README demo paragraph: “It opens with *The Small Red Kite*, stores only in `demo:page-pointer`, and lets you reset the sample or discard it before starting for real.” | 24 words; exceeds the 22-word cap. | “It opens *The Small Red Kite* and stores data only in `demo:page-pointer`. Reset it or discard it before starting for real.” |
| F-1-13 | Landing/README: “sample data”, “practice page”, “sample story”, “sample guide”, “practice page”, and “sample page” | Six terms name the same built-in trial content. | Use **sample guide** throughout: “Opens the sample guide with a short story.” |
| F-1-14 | Landing: “No account needed.” and “No account required.” | The same fact uses two terms. | Use “No account needed.” in both places. |
| F-1-15 | Landing: “It creates no photos, transcripts, child profiles, scores, trackers, or cloud OCR.” README: “The app creates no OCR record…” | “OCR” is unexplained jargon for the parent/tutor audience. | “It never reads, uploads, or stores the book’s words.” |
| F-1-16 | Landing: “Line detection uses temporary pixels inside this browser.” | “Temporary pixels” does not explain what happens to a camera frame. | “The app checks each camera frame in memory, then discards it.” |
| F-1-17 | Landing: “v1 is designed for printed Latin-script text.” README repeats “printed Latin-script pages.” | “v1” and “Latin-script” are technical shorthand. | “This version works with printed text that uses the Latin alphabet.” |
| F-1-18 | Landing h3: “Aim” | The heading does not name its section out of context. | “Aim the rear camera” |
| F-1-19 | Landing h3: “Tap” | The heading does not name its section out of context. | “Tap the current word” |
| F-1-20 | Landing h3: “Follow” | The heading does not name its section out of context. | “Follow with Next” |
| F-1-21 | Landing restore button: “Restore” | The button does not name the result. | “Restore Supporter pack” |
| F-1-22 | Landing update notice button: “Update” | The button does not name the result. | “Install update” |
| F-1-23 | Timer button after completion: “Start again” | The button does not say what starts. | “Start 10-minute timer again” |
| F-1-24 | Primary button: “Open camera ↗” | The arrow convention suggests an external link although the control opens an in-page camera. | Remove “↗”; keep “Open camera”. |
| F-1-25 | README feature: “Rear-camera capture with clear permission, denial, no-camera, and low-contrast states.” | Compressed implementation language; “states” gives the reader no action. | “The app explains how to recover when camera permission is denied, no camera is available, or page contrast is low.” |
| F-1-26 | README feature: “Local line and word-gap detection from contrasting pixels.” | “Word-gap detection” and “contrasting pixels” are unexplained jargon. | “The app finds printed lines and word spaces on your device.” |
| F-1-27 | README feature: “Tap-to-orient, word/line modes, Previous/Next controls, and Arrow/Space keyboard controls.” | Compressed compound labels make the sentence hard to scan. | “Tap the current word, choose a word or line guide, or move it with Next, Previous, Arrow, and Space.” |
| F-1-28 | README feature: “Installable PWA with first-visit precaching, offline navigation, and an update action.” | “PWA” and “precaching” are unexplained jargon. | “Install the web app, use the sample guide offline after one visit, and install updates when prompted.” |
| F-1-29 | README feature: “IndexedDB preferences and up to 50 brief session summaries, with JSON import, export, and erasure.” | Storage implementation names replace the user outcome. | “Save preferences and 50 brief session summaries in this browser. Import, export, or erase them as JSON.” |
| F-1-30 | README claims section: “Production and test checkout mapping, the one-check-per-day client cache, and the observed API request allowance are documented…” | A dense chain of implementation nouns obscures the useful result. | “`.factory/billing.md` records both checkout environments, the daily license check, and the measured request limit.” |
| F-1-31 | README architecture: “The app is Vite with strict vanilla TypeScript.” | “Strict vanilla” is insider phrasing and “strict” reads as an unsupported quality adjective. | “The app uses Vite and TypeScript without a UI framework.” |
| F-1-32 | README architecture: “`src/detection.ts` converts each temporary canvas frame to grayscale.” | “Canvas frame” and “grayscale” are implementation terms without a stated outcome. | “`src/detection.ts` removes color from each in-memory camera frame before checking page contrast.” |
| F-1-33 | README architecture: “It estimates ink rows and groups local gaps into word-like rectangles.” | “Ink rows” and “local gaps” are unexplained algorithm jargon. | “It groups dark marks into printed lines and approximate word boxes.” |
| F-1-34 | README architecture: “A supplied license stays in localStorage.” | `localStorage` is not explained. | “A supplied license stays in this browser’s local storage.” |
| F-1-35 | README privacy: “The app contains no analytics, third-party runtime scripts, CDN fonts, or payment widgets.” | “Runtime scripts”, “CDN”, and “widgets” are implementation jargon; this sentence is also unlisted under F-1-7. | “The app loads no tracking, outside code, web fonts, or embedded checkout.” |
| F-1-36 | 404 action: “Go to Page Pointer” | “Go” is a generic button/link verb. | “Open Page Pointer” |

No audited sentence contains a banned marketing word. F-1-12 is the only
sentence over 22 words. Landing/demo sentences average 6.4 words; README
sentences average 10.4 words.

## Full sentence inventory and word counts

Words are counted by whitespace; hyphenated terms count as one word. UI labels
and headings are audited separately after the sentence tables.

### Landing and demo UI sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved. | 6 | Pass |
| Try the guide without using your reading data. | 8 | Pass |
| Keep emerging readers on the right word. | 7 | Pass |
| For parents, tutors, and emerging readers, it marks the current word on a physical book. | 15 | Pass |
| Opens a practice page with a short sample story. | 9 | Flag F-1-13 |
| Frames stay on this device. | 6 | Pass |
| No account needed. | 3 | Flag F-1-14 |
| Works offline after its first visit. | 7 | Claim gap F-1-1 |
| An open illustrated book and phone are arranged on a cyan drafting mat. | 13 | Pass |
| A yellow guide crosses the phone screen. | 7 | Pass |
| Hold the phone steady above the page, then tap the word being read. | 13 | Pass |
| Camera view. | 2 | Pass |
| Tap or press Enter to place the reading guide. | 9 | Pass |
| The kite danced above the hill. | 6 | Pass |
| Mina held the string and smiled. | 7 | Pass |
| Up, up, it climbed into the blue. | 8 | Pass |
| Ready to place. | 3 | Pass |
| Tap a printed word. | 4 | Pass |
| Hold the rear camera above a well-lit printed page. | 9 | Pass |
| Landscape works best. | 3 | Pass |
| Touch the word being read. | 5 | Pass |
| Page Pointer finds the nearest ink line—without reading it. | 9 | Pass |
| Use Next or the arrow keys to travel word by word. | 11 | Pass |
| Switch to a full-line guide anytime. | 6 | Pass |
| v1 is designed for printed Latin-script text. | 7 | Flag F-1-17 |
| Curved pages, glare, illustrations, or unusual layouts can confuse placement. | 10 | Pass |
| Tap again or use Previous and Next. | 7 | Pass |
| Line detection uses temporary pixels inside this browser. | 8 | Flag F-1-16 |
| It creates no photos, transcripts, child profiles, scores, trackers, or cloud OCR. | 12 | Flag F-1-15 |
| Preferences and brief session summaries stay in this browser. | 9 | Pass |
| Export, import, or erase them whenever you like. | 8 | Pass |
| The complete reading guide stays free. | 6 | Claim gap F-1-2 |
| One purchase adds saved guide colors and a quiet ten-minute session timer. | 12 | Pass |
| Sociobot/Dodo handles payment and refunds. | 5 | Claim gap F-1-4 |
| A refund revokes the license. | 5 | Claim gap F-1-5 |
| No account required. | 3 | Flag F-1-14 |
| An app update is ready. | 5 | Pass |
| A reading guide for shared physical books. | 7 | Pass |
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
| Allow it in your browser’s site settings, then try again—or try the sample guide. | 14 | Pass |
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

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Page Pointer helps parents, tutors, and emerging readers follow the current word in a physical book. | 16 | Pass |
| Aim a phone at the page and tap the current word. | 11 | Pass |
| A high-contrast guide marks one word or line. | 8 | Pass |
| Pixel analysis stays in memory on the device. | 8 | Pass |
| The app creates no OCR record, image upload, child profile, or reading assessment. | 13 | Flag F-1-15 |
| Try the isolated sample guide at `https://page-pointer.sociobot.in/demo`. | 7 | Pass |
| It opens with *The Small Red Kite*, stores only in `demo:page-pointer`, and lets you reset the sample or discard it before starting for real. | 24 | Flag F-1-12 |
| Rear-camera capture with clear permission, denial, no-camera, and low-contrast states. | 10 | Flag F-1-25 |
| Local line and word-gap detection from contrasting pixels. | 8 | Flag F-1-26 |
| It does not read the text. | 6 | Pass |
| Tap-to-orient, word/line modes, Previous/Next controls, and Arrow/Space keyboard controls. | 9 | Flag F-1-27 |
| A built-in practice page that works without camera permission. | 9 | Flag F-1-13 |
| Installable PWA with first-visit precaching, offline navigation, and an update action. | 11 | Flag F-1-28; claim gap F-1-1 |
| IndexedDB preferences and up to 50 brief session summaries, with JSON import, export, and erasure. | 15 | Flag F-1-29 |
| Optional ₹249 one-time Supporter pack through Sociobot billing; the complete reading guide stays free. | 14 | Claim gaps F-1-2/F-1-3 |
| Requires Node.js 20.19+ (or 22.12+). | 5 | Pass |
| The development server prints its local URL. | 7 | Pass |
| Camera access requires localhost or HTTPS. | 6 | Pass |
| The factory deployment command is exactly `npm ci && npm test && npm run build`; `dist/index.html` is the static entry point. | 21 | Pass |
| `/demo`, `/privacy`, and `/terms` are configured static routes. | 7 | Pass |
| `dist/staticwebapp.config.json` supplies the required deployment headers, cache policy, and 404 response. | 11 | Pass |
| Every visitor-facing claim is listed in `.factory/claims.json` with an executable Playwright regression. | 12 | False; F-1-1–F-1-7 |
| The sandbox behavior and storage namespace are documented in `.factory/demo.md`. | 10 | Pass |
| Production and test checkout mapping, the one-check-per-day client cache, and the observed API request allowance are documented in `.factory/billing.md`. | 19 | Flag F-1-30 |
| Run `npm run test:billing` to confirm both ₹249 checkout mappings against the live Sociobot catalogues. | 15 | Pass |
| The app is Vite with strict vanilla TypeScript. | 8 | Flag F-1-31 |
| `src/detection.ts` converts each temporary canvas frame to grayscale. | 8 | Flag F-1-32 |
| It estimates ink rows and groups local gaps into word-like rectangles. | 11 | Flag F-1-33 |
| It does not recognize or retain text. | 7 | Pass |
| IndexedDB stores only preferences and up to 50 session summaries. | 10 | Flag F-1-29 |
| A supplied license stays in localStorage. | 6 | Flag F-1-34 |
| Automatic checks use the cached result for 24 hours. | 9 | Claim gap F-1-6 |
| The app contains no analytics, third-party runtime scripts, CDN fonts, or payment widgets. | 13 | Flag F-1-35; claim gap F-1-7 |
| Atkinson Hyperlegible and IBM Plex Mono are bundled under their open licenses. | 12 | Pass |
| V1 is designed for well-lit, horizontal, printed Latin-script pages. | 9 | Flag F-1-17 |
| Curvature, glare, columns, illustrations, handwriting, vertical text, and decorative layouts can reduce placement quality. | 14 | Pass |
| Users can tap again or use the step controls. | 9 | Pass |
| Page Pointer does not diagnose or treat dyslexia. | 8 | Pass |
| Visual direction and asset provenance are in `.factory/design.md`. | 8 | Pass |
| Build verification and remaining product validation are in `.factory/handoff.md`. | 9 | Pass |
| MIT — see `LICENSE`. | 4 | Pass |

### Headings, labels, and controls

Clear headings and labels include “Camera reading guide”, “Place the guide”,
“Follow each word in a physical book”, “Reading stays private on this device”,
“Add colors and a timer for ₹249”, “How it works”, “Local data settings”,
“Privacy”, “Terms”, and all README section headings. Findings F-1-18 through
F-1-24 and F-1-36 cover every unclear or non-result-naming heading/control found.

## Demo and sandbox result

PASS.

- One click from the first screen opens `/demo`.
- The first post-click viewport is the working sample itself: *The Small Red
  Kite*, a visible word guide at `LINE 03 · WORD 04`, mode buttons, and movement
  controls.
- The sticky banner reads “Demo — sample data, nothing is saved” and shows
  Reset demo and Start for real.
- Next, Previous, ArrowRight, Space, and line mode changed the guide.
- Before reset, the only database was `demo:page-pointer`; localStorage was
  empty. Reset returned session summaries to `[]`. Start for real removed the
  demo database and banner before opening the real namespace.
- Export contained preferences and one demo session summary, with no story,
  image, frame, or canvas content.
- Every request during the demo flow was same-origin.
- After a priming visit, the sample reloaded and moved offline with local fonts.

## Claims execution

Every exact command in `.factory/claims.json` was run from the clean candidate
checkout after `npm ci`.

| Claim | Exact command result | Coverage result |
| --- | --- | --- |
| `demo-sandbox` | PASS, 2 browser projects | PASS |
| `demo-reset` | PASS, 2 browser projects | PASS |
| `local-ink-detection` | PASS, 1 unit test | PASS |
| `camera-states` | PASS, 2 browser projects | PASS |
| `local-only-reading` | PASS, 2 browser projects | PASS |
| `local-data-roundtrip` | PASS, 2 browser projects | PASS |
| `offline-demo` | PASS, 2 browser projects | FAIL for broader public wording; F-1-1 |
| `pwa-update` | PASS, 2 browser projects | PASS |
| `free-core` | PASS, 2 browser projects | FAIL for “complete”; F-1-2 |
| `paid-supporter` | PASS, 2 browser projects | FAIL for price/one-time assertion; F-1-3 |

`npm run test:billing` separately passed production and pilot at INR 249.00 with
HTTP 303 checkout redirects. That evidence does not repair the declared-test
mismatch. F-1-4 through F-1-7 identify unlisted public claims.

## Structure, accessibility, links, and visual identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown URL returns the
  designed 404 with HTTP 404.
- Every audited route has `lang=en`, one h1, one main, no horizontal overflow,
  no missing image alt, and no Axe violation at either viewport.
- Root, demo, privacy, and terms have correct route-specific titles,
  descriptions, canonicals, OG/Twitter data, favicon, and apple-touch icon.
  F-1-9 covers the 404 exception.
- The skip link is first in tab order and visibly focused. Demo keyboard
  movement works. F-1-8 covers focus after route changes.
- Back restores scroll. Deep links reload to the right route.
- All visible internal links return 200. The checkout returns HTTP 303 to Dodo.
  `mailto:` links are explicit. F-1-10 and F-1-11 cover the remaining link
  defects.
- No console or page errors occurred on successful routes. Chromium reports the
  expected failed-document message for the deliberate HTTP 404 response.
- Reduced motion produced instant guide transitions, auto scrolling, and no
  running animation.
- The pale drafting grid, clipped ruler marks, petrol/cyan/yellow palette,
  mono annotations, and original book/phone image are product-specific. It is
  not a generic centered SaaS hero or three-card template.
- First-load JS is 32.00 kB raw / 11.17 kB gzip.

## History recheck

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The existing handoff contains nine historical repair bullets rather than stable
finding IDs.

| Earlier handoff repair | Current result |
| --- | --- |
| Expanded claims coverage | Regressed/incomplete: F-1-1 through F-1-7 |
| Production and pilot ₹249 mappings | Confirmed by `npm run test:billing` |
| License verdict bound to token | Confirmed by `paid-supporter` test |
| 44 px targets | Confirmed for visible controls at both widths |
| Designed 404 with shared links | Confirmed; new metadata gap is F-1-9 |
| 1200 × 630 social image | Confirmed on app routes; 404 omission is F-1-9 |
| Landing copy audit | Landing sentence lengths pass; README and copy flags are F-1-12–F-1-36 |
| Billing documentation and allowance | Files present; billing verifier passes |
| Route titles and skip-link focus | Titles/skip link pass; route-change focus is F-1-8 |

## Missed leverage

No additional AI feature is justified. The brief asks for deterministic,
private camera guidance, and a model call would add latency, cost, and privacy
risk without improving the core placement step. Import/export already exists;
cloud sync would conflict with the local-first promise. No provider key is
embedded.

## Verification commands and evidence

Executed successfully:

```text
npm ci
all 10 exact claim commands from .factory/claims.json
npm run test:billing
npm test                         # 11 passed
npm run build                    # dist/ produced
npm run test:e2e                 # 22 passed
```

The rebuilt `dist/index.html` and live root response both have SHA-256
`4bfd32e274725255d6ef7386d58913d35f4236c8201f5fd56d46a75a9953adee`,
so the live observations apply to the reviewed candidate.

## What would make this perfect

Close F-1-1 through F-1-36, then rerun the full review from fresh browser
contexts. In particular, align every public claim with one test that proves its
full wording, remove or test the refund and cache promises, focus and announce
route headings, complete 404 metadata, remove the demo `#` link, mark checkout
as external, and accept no copy-audit flags. PASS requires zero remaining
findings and no untested claim.
