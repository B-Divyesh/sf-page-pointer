# Page Pointer verification handoff — FAIL

**Candidate:** 2d191facbb07fc004de2d6d6ae6f7f5c4d8478d1
**Live URL:** https://page-pointer.sociobot.in
**Verified:** 2026-08-29 UTC
**Status:** **FAIL — do not release this candidate.**

## Why it failed

The required claims file exists, but every one of its five exact claim commands
fails from a clean npm ci checkout. Playwright starts vite preview with no built
dist directory and times out after 60 seconds. This alone blocks release.

After a production build, the exact offline-demo claim still reproducibly fails
mobile Chromium: all three self-hosted WOFF2 font requests receive
net::ERR_FAILED after offline reload. The full e2e suite also failed once:
13 passed / 1 failed in the desktop skip-link focus test.

## What passed independently

- npm ci, npm test (4 tests), and npm run build passed. The build produced dist
  with 30.51 KB JS (10.94 KB gzip) and 19.13 KB CSS (5.26 KB gzip).
- Live deployment exactly matches the rebuilt candidate index: SHA-256
  9da04247f29854a32e7c94ba8cc495b5e423306d7010431909a6926313d06829.
- Cold first read passes: it names the audience and job and offers the
  one-click sample demo.
- Live demo, demo isolation, export, invalid import recovery, camera denial
  and fake-camera lifecycle, offline reload, accessibility, mobile layout,
  privacy request logging, headers, caching, rate limiting, and 404 were
  independently checked.
- Live Axe scans found no serious or critical violations. Live 390 px offline
  reload passed; the candidate still fails because its required local claim
  test is not reliable.
- The billing verification endpoint allowed 30 sequential requests, then gave
  429 with Retry-After: 2. The repo does not document an allowance.

## How to verify after repair

    npm ci
    # Run every exact command in .factory/claims.json before other QA.
    npm test
    npm run build
    npm run test:e2e

Then test /demo online and offline at 390 px and desktop. Confirm every claim
command and the full e2e suite pass. See .factory/verification-2.md for
evidence and remediation.

## Known product limitation

Detection is a local contrast heuristic for printed Latin-script pages, not
OCR. Real-world field sessions across lighting, curvature, and cameras remain
needed before making any outcome claim about family reading sessions.
