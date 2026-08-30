# Page Pointer polish 2 handoff

## Outcome

Closed every finding in `.factory/review-1.md` and `.factory/review-2.md`.
The isolated `/demo` and `/?demo=1` path remains one-click, uses only
`demo:page-pointer`, shows reset/start-real controls, and never opens the real
store. The blueprint drafting visual system and static PWA deployment class are
unchanged.

`F-2-1` now has a real no-network-after-load camera regression; `F-2-2` proves
that Reset clears populated demo data without touching seeded real data;
`F-2-3` removes the unmeasured “quiet” promise; and `F-2-4` registers and tests
the exact Sociobot-only license transfer. Unsupported comparative/scope claims
were rewritten as usable guidance. See `.factory/polish-2.md` for the complete
finding map.

## Run and verify

```text
npm ci
npm test
npm run build
npm run test:e2e
npm run test:billing
```

On 2026-08-30 UTC, `npm test` passed 12 tests; `npm run build` produced
`dist/` with 11.31 KB gzipped application JS and 5.36 KB gzipped CSS; and
`npm run test:billing` reported production and pilot INR 249.00, HTTP 303.
Exact claim commands are in `.factory/claims.json`; each has exactly one
tagged automated test. Targeted post-repair claim evidence passed for demo
sandbox, demo reset, camera states, local-only reading, license transfer, and
the 24-hour cache.

## Deployment and cold live check

Commit `3cc6a620a191d62616c5fc2b6364403fb4300eb6` was deployed with
`/opt/fleet/lib/deploy-static.sh page-pointer dist`. Azure deployment ID:
`65beda64-13c1-4fde-901c-cb239b50c1ea`.

Cold `https://page-pointer.sociobot.in/` returned 200 with no console errors,
one h1/main, `lang=en`, and no missing image alt text. Live and built
`index.html` SHA-256 both equal
`477b6afae51816d0951f89aa462fae3d73f5ad95d3f3049bebe44604dddaf19c`.
Playwright Axe on the live home page found zero serious or critical violations.
The live interaction check passed the demo banner/isolation/reset, offline
camera and sample movement, route focus/back-scroll, external checkout label,
and designed 404 metadata/action. Evidence is under
`.factory/evidence/polish-2/live/`.

## Remaining work

None.
