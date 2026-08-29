import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from '@playwright/test';

const root = '/work/repo/dist';
let generation = 1;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  if (pathname === '/__generation/2') {
    generation = 2;
    response.end('ok');
    return;
  }
  let relative = pathname === '/' || ['/demo', '/privacy', '/terms'].includes(pathname) ? '/index.html' : pathname;
  try {
    let body = await readFile(join(root, relative));
    if (pathname === '/sw.js') body = Buffer.concat([body, Buffer.from(`\n// independent-update-generation:${generation}\n`)]);
    response.setHeader('Content-Type', mime[extname(relative)] ?? 'application/octet-stream');
    if (pathname === '/sw.js') response.setHeader('Cache-Control', 'no-cache');
    response.end(body);
  } catch {
    response.statusCode = 404;
    response.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
await page.evaluate(async () => navigator.serviceWorker.ready);
await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
const before = await page.evaluate(async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  return { controller: navigator.serviceWorker.controller?.state, active: registration?.active?.state, waiting: registration?.waiting?.state };
});
await fetch(`${origin}/__generation/2`);
await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration?.update(); });
await page.locator('#update-toast:not([hidden])').waitFor({ timeout: 15_000 });
const waiting = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state);
await Promise.all([
  page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
  page.getByRole('button', { name: 'Update' }).click()
]);
await page.waitForLoadState('networkidle');
const after = await page.evaluate(async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  return { controller: navigator.serviceWorker.controller?.state, active: registration?.active?.state, waiting: registration?.waiting?.state, caches: await caches.keys() };
});
console.log(JSON.stringify({ origin, before, toastShown: true, waiting, after, errors }, null, 2));
await browser.close();
await new Promise((resolve) => server.close(resolve));
