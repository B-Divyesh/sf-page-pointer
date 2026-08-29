const mappings = [
  {
    name: 'production',
    base: 'https://api.sociobot.in',
    checkoutHost: 'checkout.dodopayments.com'
  },
  {
    name: 'pilot',
    base: 'https://pilot-api.sociobot.in',
    checkoutHost: 'test.checkout.dodopayments.com'
  }
];

for (const mapping of mappings) {
  const catalogue = await fetch(`${mapping.base}/api/v1/products`);
  if (!catalogue.ok) throw new Error(`${mapping.name} product catalogue returned ${catalogue.status}`);
  const body = await catalogue.json();
  const product = body.data?.find((entry) => entry.slug === 'page-pointer');
  if (!product) throw new Error(`${mapping.name} catalogue has no page-pointer product`);
  if (product.currency !== 'INR' || product.price_minor !== 24900) {
    throw new Error(`${mapping.name} page-pointer price is not INR 249.00`);
  }

  const checkout = await fetch(`${mapping.base}/api/v1/products/page-pointer/checkout`, { redirect: 'manual' });
  const location = checkout.headers.get('location');
  if (checkout.status !== 303 || !location) throw new Error(`${mapping.name} checkout returned ${checkout.status}`);
  const redirect = new URL(location);
  if (redirect.hostname !== mapping.checkoutHost || !redirect.pathname.startsWith('/session/')) {
    throw new Error(`${mapping.name} checkout returned an unexpected redirect`);
  }
  console.log(`${mapping.name}: INR 249.00, HTTP 303 -> ${mapping.checkoutHost}/session/…`);
}
