# Independent verification 3 — FAIL

**Candidate:** `6e5826ddebea21be5734082ebce23d1eb8648f06`
**Live URL:** <https://page-pointer.sociobot.in>
**Verified:** 2026-08-29 UTC
**Verdict:** **FAIL — release blocked.**

The core reading guide, demo, privacy behavior, offline PWA, accessibility
scans, performance budgets, and repository gates pass. The release still
fails because its advertised paid checkout is dead and visitor-facing claims
remain outside the mandatory claims registry.

## Required first checks

### First read — PASS

A cold visit says Page Pointer marks the current word on a physical book,
names parents, tutors, and emerging readers, and shows **Try it with sample
data** beside **Open camera**. The note says the demo opens a practice page
with a short sample story. At 390 × 844, the demo action ends at 514 px and is
visible without scrolling. All three first-read questions and the one-click
demo requirement are satisfied.

### Declared claim commands — PASS after the required clean install

The initial pre-install invocations exited 127 because a clean clone has no
`node_modules` (`tsc: not found`). After `npm ci`, all five exact commands from
`.factory/claims.json` built their own production artifact and passed in both
390 px mobile and desktop Chromium:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | 2/2 passed |
| `demo-reset` | 2/2 passed |
| `local-only-reading` | 2/2 passed |
| `offline-demo` | 2/2 passed |
| `free-guide-and-price` | 2/2 passed |

Outputs are in `.factory/evidence/verification-3/claim-*.txt`.

## Release-blocking findings

### BLOCKER V3-1 — the claims registry is incomplete

The five declared claim tests pass, but the live product and README make
additional claims that are not entries in `.factory/claims.json`. The claims
contract explicitly makes any unlisted visitor-facing claim a failed review.
Examples include:

- Live **How it works** copy says the app finds the nearest ink line without
  reading it and can switch to a full-line guide.
- Live local-data copy promises browser-only preferences/session summaries,
  JSON import/export, and erasure. The declared privacy test checks a demo
  export, not the real import/erase lifecycle.
- Live Supporter copy says a purchase adds saved guide colors and a quiet
  ten-minute timer. No tagged claim test proves purchase, unlock, either paid
  feature, or restore.
- README claims rear-camera permission/denial/no-camera/low-contrast states,
  an update prompt, and capped session persistence. None is registered.

Some of these behaviors passed independent manual checks, but that does not
replace the required claim inventory and exactly tagged tests.

### HIGH V3-2 — the advertised ₹249 checkout returns 404

The live **Buy once · ₹249** link points to the required Sociobot endpoint,
but a fresh non-following GET returned:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Thus a visitor cannot buy the advertised Supporter pack. Invalid-token restore
and query-string capture behave correctly, but no successful purchase can be
completed. This also violates the no-dead-links and end-to-end requirements.
The candidate handoff's statement that factory registration remains necessary
is confirmed as an active release blocker, not an acceptable known gap.

## Other findings

### MEDIUM V3-3 — two mobile legal links miss the 44 px touch target

At 390 px, the inline **privacy** and **terms** links in the Supporter legal
copy measure 43 × 17 px and 37 × 17 px. Their text contrast and focus outline
pass, but their hit areas do not meet the attached 44 × 44 px baseline. The
1 × 1 px file input reported by geometry inspection is intentionally covered
by a visible 48 px label and is not counted as a defect.

### MEDIUM V3-4 — the real 404 omits required navigation aids

`/not-a-real-page` correctly returns a designed HTTP 404 with one `h1` and a
way home, but `public/404.html` has no skip link. Its footer also omits the
Privacy/Terms links and version/build identifier required on every route.

### LOW V3-5 — social metadata does not meet the supplied image contract

The declared Open Graph image is 1024 × 683, not a dedicated 1200 × 630 social
image. Only `twitter:card` is present; the explicit Twitter title,
description, and image fields requested by the site contract are absent.

### LOW V3-6 — required documentation audits are incomplete

`.factory/copy-audit.md` audits only the first screen rather than every landing
sentence. No repository documentation states the billing API request
allowance. Independently observed behavior was 30 successful requests in one
burst; request 31 and later returned 429 with `Retry-After: 4`.

## Functional evidence

- `/demo` immediately opened *The Small Red Kite* in `demo:page-pointer` and
  did not create the real database. Next, Previous, ArrowRight, Space, tap,
  word/line mode, and end-of-text recovery worked.
- After a six-second demo session, export contained one summary with start,
  duration, and `source: demo`; it contained no page text, image, frame, or
  canvas data. Invalid version-2 JSON produced the stated recovery error.
- **Reset demo** removed the session. **Start for real** deleted the demo
  database, removed the banner, and entered the real namespace.
- A fake permitted camera produced a live video track (`readyState` 4); Close
  guide removed `srcObject` and stopped the flow. A simulated browser denial
  showed actionable permission recovery copy.
- A three-second real camera session exported correctly. Erase emptied the
  session list, and importing the export restored it.
- Invalid license paste reached only `api.sociobot.in`, stayed locked, and
  showed the expected error. `?license=` was stored and stripped from the URL.
- No sign-in flow exists, so the Entra authority requirement is not applicable.
- This is a static PWA, not a package/CLI or product backend; consumer packing,
  server concurrency, and persistence-boundary checks are not applicable.

## Privacy, requests, and headers

- Cold home, complete demo, and fake-camera request logs contained only
  `https://page-pointer.sociobot.in`. There were no analytics, CDN fonts,
  image uploads, OCR calls, or other runtime origins.
- License verification is the only observed product-originated external API
  call and occurs after explicit restore/query-token use.
- Root responses send HSTS, `nosniff`, strict-origin referrer policy, a
  camera-only Permissions Policy, and CSP as a response header with
  `frame-ancestors 'none'`.
- `/sw.js` sends `Cache-Control: no-cache`; the manifest has
  `application/manifest+json`; hashed fonts send one-year immutable caching.
- The product-unlock verify endpoint allowed requests 1–30, then returned 429
  from request 31 with `Retry-After: 4`.

## Accessibility and responsive checks

- Axe on `/`, `/demo`, `/privacy`, `/terms`, and a real unknown/404 route at
  both 390 × 844 and 1440 × 900 found **0 total violations**, therefore zero
  serious/critical findings.
- Each route had `lang=en`, one `h1`, one `main`, image alternatives, and no
  horizontal overflow. Root and demo had no console/page errors. Chromium
  logs the expected top-level failed-resource message for the intentional 404.
- First Tab focused **Skip to main content** with a visible 3 px
  `rgb(237, 152, 0)` outline. Keyboard guide movement and Escape/close worked;
  there was no focus trap.
- Reduced motion matched, changed root scrolling to `auto`, reduced guide
  transitions to `0.00001s`, and left no running animations.
- Visual inspection of desktop, mobile, and the mobile demo found no clipping,
  obscured controls, or generic framework artifacts.

## PWA and offline checks

- A fresh live 390 px context registered and was controlled by `/sw.js`; the
  shell cache was `page-pointer-v1.1.1-shell`.
- After going offline, `/demo` reloaded with no failed requests or errors,
  advanced from word 4 to word 5, and `/privacy` also loaded.
- A controlled two-generation local-server check made a changed worker install
  and wait, exposed the in-app update toast, accepted **Update**, activated the
  new worker, reloaded, and produced no console/page errors.

## Performance and build

- `npm ci`: passed; 63 packages audited, 0 vulnerabilities.
- `npm test`: 7/7 passed.
- `npm run build`: passed TypeScript `--noEmit` and Vite; `dist/` produced.
- `npm run test:e2e`: 14/14 passed across 390 px and desktop projects.
- No lint script/configuration exists; TypeScript is the available static check.
- Build output: JS 30.60 KB (10.96 KB gzip), CSS 19.36 KB (5.28 KB gzip),
  WOFF2 fonts 49.79 KB total, and 27.16 KB mobile AVIF hero. All budgets pass.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.2 s, LCP 1.2 s, TBT 40 ms, CLS 0, total transfer 97 KiB.
  Five synthetic guide interactions had a maximum event duration of 24 ms.

## Deployment identity

The rebuilt candidate `dist/index.html` and the live root response are exactly
equal at 51,960 bytes with SHA-256:

```text
54df16bc0518d2effbae4bb9914eb76dabc842cd94854a8ea884605e6c792659
```

The live footer and worker report v1.1.1. This is not a stale-deployment or
candidate-mismatch failure.

## Test limitation

The environment can emulate permission, denial, a real browser video track,
mobile layout, network loss, and update installation, but not a family holding
a physical phone above a curved book. The brief's 20-family success study was
not repeated here. Detection fixtures and deterministic fallback controls did
pass.
