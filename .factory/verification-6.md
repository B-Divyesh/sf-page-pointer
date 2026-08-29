# Independent verification 6 — PASS

**Candidate:** `b5c18196948633089e8326dcc26e3f156ce972bb` (`main`)

**Live URL:** <https://page-pointer.sociobot.in>

**Date:** 2026-08-29 UTC

**Scope:** fresh clean-checkout install and claim execution, then an independent
live PWA and product-flow check. Product source was not changed by this
verification.

## Result

**PASS.** The deployed site matches the candidate production build byte for
byte for both `index.html` and its main JavaScript. All required claim commands
completed successfully from the demo entry point; the full test population was
also exercised (12 Vitest tests and 28 Playwright tests). No release-blocking
defect was found.

## First-read test (cold live page)

On a fresh desktop browser context, the first screen said:

> Keep emerging readers on the right word. For parents, tutors, and emerging
> readers, it marks the current word on a physical book.

It presents a visible **Try it with sample data** link beside **Open camera**
and says it opens “the sample guide with a short story.” The three plain facts
are visible in the same first screen: frames stay on this device, no account is
needed, and it works offline after the first visit. This clearly answers what
it does, for whom, and what to click first. **PASS.**

## Clean checkout and claim evidence

`npm ci` completed with 0 reported vulnerabilities. I then ran every literal
`test` command in `.factory/claims.json`; each e2e command rebuilt production
and ran against its local demo route in fresh browser contexts. The command
sequence would stop on the first failure; it completed all 12 entries.

| Claim ID | Exact registered command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS |
| `demo-reset` | `npm run test:e2e -- --grep @claim:demo-reset` | PASS |
| `local-ink-detection` | `npm test -- --testNamePattern @claim:local-ink-detection` | PASS |
| `camera-states` | `npm run test:e2e -- --grep @claim:camera-states` | PASS |
| `local-only-reading` | `npm run test:e2e -- --grep @claim:local-only-reading` | PASS |
| `local-data-roundtrip` | `npm run test:e2e -- --grep @claim:local-data-roundtrip` | PASS |
| `offline-demo` | `npm run test:e2e -- --grep @claim:offline-demo` | PASS |
| `pwa-update` | `npm run test:e2e -- --grep @claim:pwa-update` | PASS |
| `free-core` | `npm run test:e2e -- --grep @claim:free-core` | PASS |
| `paid-supporter` | `npm run test:e2e -- --grep @claim:paid-supporter` | PASS |
| `license-cache-24h` | `npm run test:e2e -- --grep @claim:license-cache-24h` | PASS |
| `private-runtime` | `npm run test:e2e -- --grep @claim:private-runtime` | PASS |

Additional clean-checkout gates:

- `npm test`: **12/12 passed** (including release configuration and local
  printed-ink detection).
- All 28 Playwright tests were covered: the 11 e2e claim tests above run on
  both mobile and desktop (22 tests), and the remaining keyboard, history, and
  accessibility checks passed on both browsers (6 tests).
- `npm run test:billing`: **PASS**; production and pilot both reported INR
  249.00 and HTTP 303 to their respective hosted checkout.
- `npm run build`: **PASS**; it type-checks and produces `dist/`. No separate
  lint script is defined in `package.json`.

Production bundle output was 33.10 KB JS raw / 11.39 KB gzip, 19.74 KB CSS raw
/ 5.36 KB gzip, and 49.79 KB WOFF2 fonts. These are within the static PWA
budgets (200 KB JS, 50 KB CSS, 120 KB fonts).

## Independent live product QA

### Normal flow, boundaries, recovery, desktop and mobile

- At 1440 × 900 and 390 × 844, selecting **Try it with sample data** opened
  `/demo`, showed the persistent “Demo — sample data, nothing is saved” banner,
  and rendered the local short-story guide. There was no horizontal overflow.
- The guide was visible immediately. Arrow Right moved `LINE 02 · WORD 04` to
  `LINE 02 · WORD 05` on desktop; Space then moved it to word 06. The same
  operation on mobile moved line 03 word 04 → 05 → 06.
- Reset and Start-for-real are covered by the dedicated passing claim check;
  real-mode malformed JSON import independently reported the JSON parse error
  after its async import completed. The normal import/export/50-session cap/
  erase cases are covered by the passing `local-data-roundtrip` claim.
- With `navigator.mediaDevices` deliberately absent, **Open camera** gave the
  recovery message: “This browser cannot open a camera. Try the sample guide,
  or open Page Pointer in a current mobile browser.” The denied, missing-camera,
  blank-frame, stream-release, and real fake-rear-camera paths are covered by
  the passing `camera-states` claim.
- Keyboard-only use passed: the first target is the skip link, the primary
  flow is operable by keyboard, and the live focus ring is an intentional
  `rgb(237, 152, 0) solid 3px`. Visible interactive controls measured at least
  44 px high; hidden conditional controls were not visible or operable.
- Under `prefers-reduced-motion: reduce`, computed document scroll behavior was
  `auto` and the stylesheet reduces transitions/animations to 0.01 ms.

### Privacy, security, deployment, and PWA

- A complete cold live home-to-demo flow recorded only
  `https://page-pointer.sociobot.in` requests. There were no third-party
  scripts, fonts, frames, tracking calls, or console/page errors. The dedicated
  local privacy claim also validates the complete exported JSON contains no
  image or recognized text.
- The live response has HSTS, `X-Content-Type-Options: nosniff`, strict
  origin-when-cross-origin referrer policy, a camera-only permissions policy,
  and a self-restricted CSP with `frame-ancestors 'none'`. The entry HTML cache
  is `public, must-revalidate, max-age=30`; hashed JavaScript is immutable for
  one year; `sw.js` is `no-cache`.
- A fresh context registered an active controller at `/sw.js` with site-root
  scope. After visiting `/demo`, setting the context offline, and reloading,
  the page showed “Offline · guide ready” and Arrow Right advanced word 04 to
  05 without errors. The separately executed `pwa-update` claim verifies the
  waiting-worker update action on a two-generation server.
- The live `index.html` SHA-256 and main `index-D0T8ubJv.js` SHA-256 exactly
  equal the locally rebuilt candidate values:
  `264ae69f22ba9244db09551e6e9971b5dc2072f147ceb582ccfd7f4de9641f5d`
  and `588202cadaa5b8ee9358f477626a8d7bed0089c2b328a6da99033abdad6dd3c0`.
  This confirms the deployment is this candidate rather than an earlier build.
- The documented product-unlock verification allowance was independently
  reproduced using an invalid license: requests 1–30 returned HTTP 200 and
  request 31 returned **429** with **`Retry-After: 4`**. The observed burst
  allowance is therefore 30 requests. There is no sign-in flow.

### Accessibility and route checks

- `/opt/fleet/lib/verify-url.sh https://page-pointer.sociobot.in/ <tempdir>`
  passed: HTTP 200; 727 ms navigation; correct title and `lang=en`; one h1 and
  main landmark; zero missing image alts; zero unlabeled buttons; zero console
  errors.
- Axe-core 4.10.3, injected into Playwright’s installed Chromium, reported
  **zero WCAG 2 A/AA violations** on `/`, `/demo`, `/privacy`, and `/terms`;
  therefore zero serious or critical issues.
- All discovered internal links (`/`, `/demo`, `/privacy`, `/terms`) returned
  200. The live home, demo and legal flows reported no page errors.

The standalone `npx @axe-core/cli` launcher and Lighthouse CLI could not find
or connect to a system Chrome binary in this container. This is an environment
tooling limitation, not a product failure: axe was run successfully through
the preinstalled Playwright Chromium, and the direct bundle measurements above
establish the declared budgets. No Lighthouse score is asserted by this report.

## Defects

| Severity | Finding |
| --- | --- |
| Blocker | None |
| Critical | None |
| Major | None |
| Minor | None |

## Limitations

Automated verification cannot replace a field study of actual families,
curved/glare-prone books, and differing rear-camera hardware. The product
plainly discloses those detection limits and offers tap and step recovery; this
is not a release-blocking defect for the stated PWA acceptance contract.
