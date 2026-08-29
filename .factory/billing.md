# Page Pointer billing mapping

Page Pointer uses only the Sociobot billing API. The browser never loads a
payment-provider script or sends reading data to billing.

## One-time products

| Environment | Product route | Price | Hosted checkout |
| --- | --- | ---: | --- |
| Production | `https://api.sociobot.in/api/v1/products/page-pointer/checkout` | INR 249.00 once | Dodo live |
| Local and staging | `https://pilot-api.sociobot.in/api/v1/products/page-pointer/checkout` | INR 249.00 once | Dodo test |

Both mappings use the return URL `https://page-pointer.sociobot.in/`. The
return URL receives `?license=<token>`. The app stores that token under
`sb_license:page-pointer`, removes it from the address bar, and calls the
matching Sociobot verification route.

Run `npm run test:billing` to check both public catalogue records, prices, and
hosted-checkout redirects. The check does not submit payment.

## Verification request allowance

The app reuses an automatic verification result for 24 hours. An explicit
Restore action starts a new check. Independent checks on 29 August 2026
received 30 responses in one burst; request 31 returned HTTP 429 with a
`Retry-After` header. Treat 30 requests as the observed burst ceiling, not a
permanent provider guarantee. Clients must wait for `Retry-After` before
retrying after a 429 response.
