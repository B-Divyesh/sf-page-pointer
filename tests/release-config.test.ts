import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

test('static deployment keeps security, immutable asset caching, manifest type, and a real 404 response', () => {
  const config = JSON.parse(readFileSync(resolve('staticwebapp.config.json'), 'utf8')) as {
    globalHeaders: Record<string, string>;
    mimeTypes: Record<string, string>;
    routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['Content-Security-Policy']).toContain("font-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=(self)');
  expect(config.globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.routes.find((route) => route.route === '/demo')?.rewrite).toBe('/index.html');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  const notFound = readFileSync(resolve('public/404.html'), 'utf8');
  expect(notFound).toContain('class="skip-link"');
  expect(notFound).toContain('<main id="main" tabindex="-1">');
  expect(notFound).toContain('<h1>This page is not here</h1>');
  expect(notFound).toContain('href="/privacy"');
  expect(notFound).toContain('href="/terms"');
  expect(notFound).toContain('v1.1.2');
});

test('social metadata uses an exact 1200 by 630 product image and complete Twitter fields', () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  const socialPath = resolve('public/assets/page-pointer-social-1200x630.jpg');
  const image = readFileSync(socialPath);
  let offset = 2;
  let width = 0;
  let height = 0;
  while (offset < image.length) {
    if (image[offset] !== 0xff) { offset += 1; continue; }
    const marker = image[offset + 1];
    const length = image.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      height = image.readUInt16BE(offset + 5);
      width = image.readUInt16BE(offset + 7);
      break;
    }
    offset += 2 + length;
  }
  expect({ width, height }).toEqual({ width: 1200, height: 630 });
  expect(html).toContain('property="og:image:width" content="1200"');
  expect(html).toContain('property="og:image:height" content="630"');
  for (const field of ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    expect(html).toContain(`name="${field}"`);
  }
});

test('the copy audit covers static and dynamic landing sentences without unresolved flags', () => {
  const audit = readFileSync(resolve('.factory/copy-audit.md'), 'utf8');
  expect(audit).toContain('## Landing page: static sentences');
  expect(audit).toContain('## Landing page: dynamic states');
  expect(audit).toContain('No audited sentence exceeds 22 words.');
  expect(audit).not.toMatch(/\|\s*(Fail|Flag)\s*\|/i);
  const counts = [...audit.matchAll(/\|\s*(\d+)\s*\|\s*Pass\s*\|/g)].map((match) => Number(match[1]));
  expect(counts.length).toBeGreaterThan(50);
  expect(Math.max(...counts)).toBeLessThanOrEqual(22);
});

test('every declared claim has exactly one tagged regression and required behavior groups are registered', () => {
  const claims = JSON.parse(readFileSync(resolve('.factory/claims.json'), 'utf8')) as Array<{ id: string; test: string }>;
  const ids = claims.map((claim) => claim.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toEqual(expect.arrayContaining([
    'camera-states', 'local-ink-detection', 'local-data-roundtrip', 'pwa-update', 'paid-supporter'
  ]));
  const testSources = [
    'tests/detection.test.ts', 'tests/e2e/app.spec.ts', 'tests/e2e/product-claims.spec.ts'
  ].map((file) => readFileSync(resolve(file), 'utf8')).join('\n');
  for (const claim of claims) {
    expect(claim.test).toContain(`@claim:${claim.id}`);
    expect(testSources.match(new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')) ?? []).toHaveLength(1);
  }
});

test('billing documentation and live verifier pin the one-time INR 249 production and pilot mappings', () => {
  const billing = readFileSync(resolve('.factory/billing.md'), 'utf8');
  const verifier = readFileSync(resolve('scripts/verify-billing.mjs'), 'utf8');
  const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as { scripts: Record<string, string> };
  expect(billing).toContain('INR 249.00 once');
  expect(billing).toContain('30 responses in one burst');
  expect(billing).toContain('HTTP 429');
  expect(billing).toContain('`Retry-After`');
  expect(verifier).toContain("price_minor !== 24900");
  expect(verifier).toContain("checkout.status !== 303");
  expect(packageJson.scripts['test:billing']).toBe('node scripts/verify-billing.mjs');
});

test('the browser suite builds its production server from a clean clone', () => {
  const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };
  expect(packageJson.scripts['test:e2e']).toBe('npm run build && playwright test');
});

test('the service worker precaches build assets and supports an in-app update', () => {
  const worker = readFileSync(resolve('public/sw.js'), 'utf8');
  expect(worker).toContain('/* BUILD_ASSETS */');
  expect(worker).toContain("event.data?.type === 'SKIP_WAITING'");
  expect(worker).toContain('self.skipWaiting()');
  expect(worker).toContain('self.clients.claim()');
  expect(worker).toContain("caches.match(event.request, { ignoreVary: true })");
});

test('the production build preloads its self-hosted WOFF2 fonts', () => {
  const viteConfig = readFileSync(resolve('vite.config.ts'), 'utf8');
  expect(viteConfig).toContain("file.endsWith('.woff2')");
  expect(viteConfig).toContain('as="font" type="font/woff2" crossorigin');
});
