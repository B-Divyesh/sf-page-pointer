# Independent verification 2 — FAIL

**Candidate:** 2d191facbb07fc004de2d6d6ae6f7f5c4d8478d1
**Live URL:** https://page-pointer.sociobot.in
**Verified:** 2026-08-29 UTC
**Verdict:** **FAIL — release blocked.**

## First read

**Pass.** A cold live visit says it marks the current word on a physical book,
names parents, tutors, and emerging readers, and exposes the one-click **Try it
with sample data** link with “Opens a practice page with a short sample story.”
The link opens a usable guide.

## Release-blocking findings

### BLOCKER V1 — every declared claim command fails from the clean clone

.factory/claims.json exists with five entries. After the required clean npm ci,
each exact command listed in that file exited 1 before a test ran:

    npm run test:e2e -- --grep @claim:demo-sandbox
    npm run test:e2e -- --grep @claim:demo-reset
    npm run test:e2e -- --grep @claim:local-only-reading
    npm run test:e2e -- --grep @claim:offline-demo
    npm run test:e2e -- --grep @claim:free-guide-and-price

Each reports: Error: Timed out waiting 60000ms from config.webServer.
The configured web server runs npm run preview, but a clean checkout has no
dist directory; the listed commands do not build it or otherwise start a
usable demo server. The claims contract makes any failed claim test
release-blocking.

### BLOCKER V2 — the offline claim test fails after a production build

After npm run build, the exact demo-sandbox, demo-reset, local-only-reading,
and free-guide-and-price commands passed on mobile and desktop. The exact
offline-demo command reproducibly failed its mobile Chromium project twice:

    Failed to load resource: net::ERR_FAILED
    .../ibm-plex-mono-latin-500-normal-C_OblDzq.woff2
    .../atkinson-hyperlegible-latin-700-normal-BriLmxM2.woff2
    .../atkinson-hyperlegible-latin-400-normal-BKTgBNmI.woff2

Desktop passed, but the mobile failure means the required claim test is not
reliable. The full npm run test:e2e also failed: 13 passed and 1 failed. Its
desktop keyboard test did not focus the skip link after the first Tab. A direct
fresh live check did focus it on desktop and mobile, so this looks like test or
runtime flakiness rather than a confirmed deployed keyboard defect; it remains
a failed repository quality gate.

## Independent live results

- **Candidate/deployment identity:** rebuilt dist/index.html and live / have
  SHA-256 9da04247f29854a32e7c94ba8cc495b5e423306d7010431909a6926313d06829.
  This is not a deployment-only failure.
- **Workflow:** /demo immediately opens *The Small Red Kite*. Next, arrow
  navigation, and the end-of-text recovery message worked at 390 px. Export
  contained preferences and an empty session array, with no page image or
  text. Reset, Start for real, invalid JSON recovery, camera denial, and fake
  permitted camera open/close all worked.
- **Privacy:** cold-home and complete-demo request logs were same-origin only;
  there were no console/page errors. Demo used demo:page-pointer and did not
  create real reading storage.
- **PWA:** fresh 390 px context was controlled by /sw.js. Offline /demo reload
  showed the guide and advanced WORD 04 to WORD 05 with no errors or failed
  requests. No waiting worker existed. Source has SKIP_WAITING, clients.claim,
  and an in-app update listener; a changed server worker could not be induced.
- **Accessibility/responsiveness:** live Axe scans at 390 px of /, /demo,
  /privacy, /terms, and the 404 found 0 serious/critical and 0 total
  violations. Each had one h1 and main. There was no 390 px horizontal
  overflow. The skip link was first focusable with a visible 3 px
  rgb(237, 152, 0) outline. Reduced-motion scrolling was auto and transitions
  were 0.00001s.
- **Headers/routes/cache:** /, /demo, /privacy, and /terms returned 200; an
  unknown route returned the styled page with 404. Responses had CSP with
  response-header frame-ancestors 'none', HSTS, Referrer-Policy, nosniff, and
  a camera-only Permissions-Policy. /sw.js was no-cache; manifest media type
  was application/manifest+json; hashed font caching was one-year immutable.
- **Billing request allowance:** no allowance documentation exists in the repo.
  A single-client sequential probe allowed 30 verification requests; request
  31 and later returned 429 with Retry-After: 2. No sign-in flow exists.
- **Budget:** npm run build reported 30.51 KB JS (10.94 KB gzip) and 19.13 KB
  CSS (5.26 KB gzip), under the static budgets. Fonts are self-hosted.

## Local quality checks

- npm ci passed; audit reported 0 vulnerabilities.
- npm test passed: 4 tests.
- npm run build passed: tsc --noEmit plus Vite, producing dist.
- No lint script exists.
- npm run test:e2e failed: 13 passed / 1 failed, as described above.

## Required remediation

1. Make every claims.json command executable from a clean clone, then run each
   exact command before the remaining suite.
2. Fix the mobile offline-reload font-cache failure so offline-demo passes
   consistently.
3. Stabilize the desktop keyboard test or correct the focus behavior it
   exposes, then make the complete e2e suite pass.

*** Delete File: .factory/handoff.md
