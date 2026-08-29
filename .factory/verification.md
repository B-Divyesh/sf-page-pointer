# Independent verification 1 — FAIL

**Candidate:** `610e760e013205391830e878653ca490d74a7c14`  
**Live URL:** https://page-pointer.sociobot.in  
**Verified:** 2026-08-29 (UTC)  
**Verdict:** **FAIL — release blocked.**

## Release-blocking findings

### BLOCKER V1 — required claim contract is absent

`.factory/claims.json` does not exist in the clean candidate. Per the product
contract, this is itself release-blocking; consequently there were no listed
claim commands to run. This also leaves the prominent observable claims
(`Frames stay on this device`, `No account`, `No OCR archive`, offline use,
and paid-feature statements) without the required one-to-one sandbox tests.
`rg` found no `@claim:` tests in the test suite.

### BLOCKER V2 — the sample demo is not a sandbox or a direct demo entry point

The landing button is `Try without a camera`, and does show a useful sample
page in one click. However it does not meet the demo-sandbox contract:

- `https://page-pointer.sociobot.in/?demo=1` loads the landing state with the
  instrument hidden; `/demo` also returns the landing state with the
  instrument hidden.
- There is no persistent `Demo — sample data, nothing is saved` banner and no
  `Reset demo` or `Start for real` control.
- A fresh live-browser test ran the demo for four seconds, closed it, and found
  its `{ source: "demo", durationSeconds: 4 }` session in the ordinary
  `page-pointer` IndexedDB database. The demo uses the real storage namespace,
  not `demo:` storage, so it can affect real data.
- `.factory/demo.md` is absent.

### BLOCKER V3 — cold first read fails the plain-words acceptance test

At both 390 px and desktop, the initial screen reads:

> Keep their eyes with the story.
>
> Aim your phone at a physical book, tap the word being read, and leave the
> pointing to a calm, high-contrast guide.

This gives a method, but neither the heading nor the sentence names the people
it is for (parents, tutors, or emerging readers). The heading is a metaphor,
not the job in plain words. The CTA says `Try without a camera`, not the
required visible `Try it with sample data`. Therefore the first screen does
not answer what, for whom, and what to click first in the mandated shape.

## Other defects

### HIGH V4 — required browser security and caching headers are missing

The live HTML, service worker, manifest, legal pages, and hashed JS asset have
HSTS, `Referrer-Policy`, and `X-Content-Type-Options`, but none has a
`Content-Security-Policy`, `Permissions-Policy`, or frame-ancestor protection.
All were served with `Cache-Control: public, must-revalidate, max-age=30`,
including `/assets/index-BEX0cPWA.js`; this does not provide the required
long-lived immutable caching for hashed assets. The manifest is served as
`application/octet-stream` rather than a manifest media type.

### MEDIUM V5 — no real 404 route or deployment routing configuration

`/not-a-real-page` returns the app and HTTP 200. There is no
`staticwebapp.config.json` and no designed 404 route. This misses the site
structure requirement for a real 404 response with a way back.

### MEDIUM V6 — site navigation is incomplete

The home header has only a wordmark and status/install area; it has no Demo,
Privacy, or other navigational links. Legal pages have only the wordmark.
This does not supply the required consistent header/navigation skeleton.

## Checks that passed

- Clean candidate state: `git rev-parse HEAD` returned the candidate commit;
  the worktree was clean before verification.
- `npm ci` passed with 0 audited vulnerabilities.
- `npm test` passed: 3/3 Vitest tests.
- `npm run build` passed (`tsc --noEmit` plus Vite) and produced `dist/`.
  No separate lint script exists.
- `npm run test:e2e` passed: 6/6 Playwright tests on Pixel 5 and desktop
  Chromium.
- The live `index.html` is byte-for-byte identical to this candidate's
  rebuilt `dist/index.html` (SHA-256
  `b3cc5497a17305d2f00e6133db56d8b271b68732c7ccbe855a10b00f1d683153`).
- Live cold loads at 390 px and desktop had no console or page errors, no
  horizontal overflow at 390 px, self-hosted fonts/assets only, and no
  outgoing origin other than `https://page-pointer.sociobot.in` during the
  full sample-demo flow. This supports the observed privacy behavior, but does
  not substitute for the missing claims test.
- Keyboard smoke test: the first Tab reaches a visible skip link; the demo
  button receives a 3 px visible focus outline. In the demo, ArrowRight and
  Space advanced the selected word (03/04 → 03/05 → 03/06). Reduced-motion
  computed transition duration was `0.00001s` and scroll behavior was `auto`.
- Live axe scans on home/demo, privacy, and terms returned zero serious or
  critical (and zero total) violations.
- Fake rear-camera smoke test opened a live 1280×720 video track and `Close
  guide` hid/stopped the workspace. Without camera access, the page stayed
  usable and offered the no-camera demo. Invalid JSON import announced the
  parse error; export produced the documented JSON schema; confirmed erase
  announced completion.
- PWA: a fresh live browser registered and was controlled by `/sw.js`, cached
  the app shell, then reloaded offline with HTTP 200 and ran the sample guide.
  The current worker had no waiting version. Source inspection confirms
  `SKIP_WAITING` and `clients.claim()` update handling; a real changed-worker
  update could not be induced against this unchanged deployment.
- Bundle output: JS 28.34 KB (10.40 KB gzip) and CSS 18.03 KB (5.03 KB gzip),
  within the static budgets. Independent Lighthouse mobile report: Performance
  98, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.3 s,
  TBT 140 ms, CLS 0.
- Billing verification endpoint allowance: sequential requests from this test
  client received 200 through request 31; request 32 returned `429 Too Many
  Requests` with `Retry-After: 4` and `X-RateLimit-After: 4`. No documented
  allowance was found in the repository, so 31 requests per observed burst is
  evidence, not a documented contract.

## Required remediation before acceptance

1. Add `.factory/claims.json`, one real `@claim:<id>` sandbox test for every
   listed claim, and run every listed command from the demo entry point.
2. Implement `/demo` or `?demo=1` as an isolated demo namespace with the
   banner, Reset/Start-real controls, sample data, and `.factory/demo.md`.
3. Rewrite the first screen in plain words to name the audience and job, and
   expose `Try it with sample data` with a short adjacent result description.
4. Add the required security/caching/deployment headers and real 404 route,
   then complete the consistent site navigation.
