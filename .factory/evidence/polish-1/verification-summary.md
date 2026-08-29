# Polish 1 verification summary

Date: 2026-08-29

Product commit: `bde48060efae17e90494f786f0a5d3ba30b7b0a7`

## Clean clone

Clone: `/tmp/page-pointer-clean-nIPXX5`

- Each of the 12 `test` commands in `.factory/claims.json` ran separately and
  passed.
- `npm test`: 12/12 passed.
- `npm run test:e2e`: 28/28 passed.
- `npm run build`: passed and produced `dist/`.

## Other local checks

- `npm run test:billing`: production and pilot catalogues returned INR 249.00
  and HTTP 303 to the correct hosted checkout.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100, LCP 1.5 s, CLS 0, TBT 0 ms.
- Browser report: `local/browser-report.json`.
- Lighthouse JSON: `local/lighthouse-mobile.json`.
- Screenshots: `local/home-mobile.png`, `local/home-desktop.png`, and
  `local/demo-mobile.png`.

## Deploy and cold live checks

Command:

```text
/opt/fleet/lib/deploy-static.sh page-pointer /work/repo/dist
```

Deployment ID: `61ea0464-e156-4c67-a5a3-aacd40b4b6e4`

- `node scripts/capture-evidence.mjs https://page-pointer.sociobot.in
  .factory/evidence/polish-1/live`: passed.
- `node scripts/verify-live.mjs https://page-pointer.sociobot.in
  .factory/evidence/polish-1/live/live-interaction-report.json`: passed.
- `/opt/fleet/lib/verify-url.sh https://page-pointer.sociobot.in
  .factory/evidence/polish-1/live/verify-url`: passed in 779 ms.
- Built and live root SHA-256:
  `264ae69f22ba9244db09551e6e9971b5dc2072f147ceb582ccfd7f4de9641f5d`.
- Browser report: `live/browser-report.json`.
- Interaction report: `live/live-interaction-report.json`.
- Accessibility report: `live/verify-url/verify.json`.
- Screenshots: `live/home-mobile.png`, `live/home-desktop.png`,
  `live/demo-mobile.png`, and `live/verify-url/screenshot-*.png`.
