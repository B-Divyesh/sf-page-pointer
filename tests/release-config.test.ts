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
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=(self)');
  expect(config.globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.routes.find((route) => route.route === '/demo')?.rewrite).toBe('/index.html');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  const notFound = readFileSync(resolve('public/404.html'), 'utf8');
  expect(notFound).toContain('<main id="main">');
  expect(notFound).toContain('<h1>This page is not here</h1>');
});
