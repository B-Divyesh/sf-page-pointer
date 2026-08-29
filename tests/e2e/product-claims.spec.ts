import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { expect, test, type Download, type Page } from '@playwright/test';

async function readDownload(download: Download): Promise<unknown> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error('Download stream was not available');
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function exportFrom(page: Page): Promise<{ preferences: { mode: string; guideColor: string }; sessions: unknown[] }> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  return await readDownload(await pending) as { preferences: { mode: string; guideColor: string }; sessions: unknown[] };
}

test('@claim:camera-states the rear-camera guide opens, stops its stream, and explains denied, missing, and low-contrast states', async ({ page, context }) => {
  const origin = 'http://127.0.0.1:4173';
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await context.grantPermissions(['camera'], { origin });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL('/');
  await page.evaluate(() => {
    const mediaDevices = navigator.mediaDevices;
    const original = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = async (constraints) => {
      (window as typeof window & { requestedCameraConstraints?: MediaStreamConstraints }).requestedCameraConstraints = constraints;
      const stream = await original(constraints);
      (window as typeof window & { requestedCameraTrack?: MediaStreamTrack }).requestedCameraTrack = stream.getVideoTracks()[0];
      return stream;
    };
  });
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.getByRole('heading', { name: 'Place the guide' })).toBeVisible();
  await expect(page.locator('#camera-video')).toBeVisible();
  expect(await page.evaluate(() => {
    const constraints = (window as typeof window & { requestedCameraConstraints?: MediaStreamConstraints }).requestedCameraConstraints;
    return (constraints?.video as MediaTrackConstraints)?.facingMode;
  })).toEqual({ ideal: 'environment' });
  expect(await page.locator('#camera-video').evaluate((video: HTMLVideoElement) => (video.srcObject as MediaStream | null)?.getVideoTracks()[0]?.readyState)).toBe('live');

  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      const context = original.apply(this, args) as CanvasRenderingContext2D | null;
      if (args[0] === '2d' && context) {
        context.getImageData = (_x: number, _y: number, width: number, height: number) => {
          const data = new Uint8ClampedArray(width * height * 4).fill(255);
          return new ImageData(data, width, height);
        };
      }
      return context as ReturnType<typeof original>;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.locator('#viewfinder').click({ position: { x: 80, y: 80 } });
  await expect(page.locator('#guide-status')).toContainText('No clear line found.');
  await page.waitForTimeout(3_100);
  await page.getByRole('button', { name: 'Close guide' }).click();
  expect(await page.evaluate(() => (window as typeof window & { requestedCameraTrack?: MediaStreamTrack }).requestedCameraTrack?.readyState)).toBe('ended');
  expect(await page.locator('#camera-video').evaluate((video: HTMLVideoElement) => video.srcObject)).toBeNull();
  await page.locator('details.settings').evaluate((element: HTMLDetailsElement) => { element.open = true; });
  const cameraData = await exportFrom(page);
  expect(cameraData.sessions).toEqual([expect.objectContaining({ source: 'camera' })]);

  await page.reload();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => { throw new DOMException('Permission denied', 'NotAllowedError'); } }
    });
  });
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.locator('#camera-message')).toContainText('Camera access is off.');

  await page.reload();
  await page.evaluate(() => Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined }));
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.locator('#camera-message')).toContainText('This browser cannot open a camera.');
  expect([...new Set(requests.map((url) => new URL(url).origin))]).toEqual([origin]);
});

test('@claim:local-data-roundtrip real data imports, exports at a 50-session cap, and erases locally', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL('/');
  await page.locator('details.settings').evaluate((element: HTMLDetailsElement) => { element.open = true; });
  const sessions = Array.from({ length: 54 }, (_, index) => ({
    id: `session-${index}`,
    startedAt: new Date(Date.UTC(2026, 7, 29, 12, index)).toISOString(),
    durationSeconds: index + 3,
    source: 'camera'
  }));
  await page.locator('#import-data').setInputFiles({
    name: 'page-pointer-data.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, preferences: { mode: 'line', guideColor: '#6DE2E0', thickness: 12 }, sessions, exportedAt: new Date().toISOString() }))
  });
  await expect(page.locator('#data-status')).toHaveText('Local data imported.');
  await expect(page.locator('[data-mode="line"]')).toHaveAttribute('aria-pressed', 'true');
  const imported = await exportFrom(page);
  expect(imported.preferences.mode).toBe('line');
  expect(imported.sessions).toHaveLength(50);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Erase local data' }).click();
  await expect(page.locator('#data-status')).toHaveText('Local reading data erased.');
  const erased = await exportFrom(page);
  expect(erased.sessions).toEqual([]);
  expect(erased.preferences).toMatchObject({ mode: 'word', guideColor: '#F7C948' });
});

test('@claim:paid-supporter a purchase or restore activates saved colors and the ten-minute timer, while revocation locks them', async ({ page, context }) => {
  const billingFixture = JSON.parse(await readFile(resolve('tests/fixtures/sociobot-page-pointer.json'), 'utf8')) as {
    product: { currency: string; price_minor: number; billing_type: string };
    checkout: { pilot_url: string; status: number; provider: string };
  };
  expect(billingFixture.product).toMatchObject({ currency: 'INR', price_minor: 24900, billing_type: 'one_time' });
  expect(billingFixture.checkout).toMatchObject({ status: 303, provider: 'Sociobot hosted checkout' });
  const verifiedTokens: string[] = [];
  await page.route('https://pilot-api.sociobot.in/api/v1/products/page-pointer/verify?*', async (route) => {
    const token = new URL(route.request().url()).searchParams.get('license');
    if (token) verifiedTokens.push(token);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(token === 'revoked-license' ? { valid: false, reason: 'revoked' } : { valid: true, reason: 'ok' })
    });
  });
  await page.goto('/demo');
  await expect(page.locator('.supporter')).toHaveCount(0);
  await expect(page.locator('#buy-link')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: 'Add colors and a timer for ₹249' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy once for ₹249 on Sociobot/ })).toHaveAttribute('href', billingFixture.checkout.pilot_url);
  await page.goto('/?license=purchased-license');
  await expect(page).toHaveURL('/');
  await expect(page.locator('#license-status')).toHaveText('Purchase verified. The Supporter pack is active.');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:page-pointer'))).toBe('purchased-license');
  await expect(page.getByRole('link', { name: /Supporter pack active/ })).toHaveAttribute('href', billingFixture.checkout.pilot_url);

  await context.grantPermissions(['camera'], { origin: 'http://127.0.0.1:4173' });
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.locator('#supporter-tools')).toBeVisible();
  await page.getByRole('button', { name: 'Cyan guide' }).click();
  await expect(page.locator('#supporter-tools')).toHaveCSS('border-top-color', 'rgb(102, 134, 139)');
  expect(await page.locator('#instrument').evaluate((element) => element.style.getPropertyValue('--guide-color'))).toBe('#6DE2E0');
  await page.clock.install();
  await page.getByRole('button', { name: 'Start quiet 10-minute timer' }).click();
  await expect(page.locator('#timer-status')).toHaveText('10:00 remaining');
  await page.clock.fastForward(600_100);
  await expect(page.locator('#timer-status')).toHaveText('Ten minutes complete.');
  await page.getByRole('button', { name: 'Close guide' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.getByRole('button', { name: 'Cyan guide' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Close guide' }).click();
  expect(verifiedTokens.filter((token) => token === 'purchased-license')).toHaveLength(1);

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel('Already purchased? Paste your license').fill('restored-license');
  await page.getByRole('button', { name: 'Restore Supporter pack' }).click();
  await expect(page.locator('#license-status')).toHaveText('Purchase restored. The Supporter pack is active.');
  await page.getByLabel('Already purchased? Paste your license').fill('revoked-license');
  await page.getByRole('button', { name: 'Restore Supporter pack' }).click();
  await expect(page.locator('#license-status')).toHaveText('This license is not active. Check the token or buy the pack.');
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.locator('#supporter-tools')).toBeHidden();
  expect(verifiedTokens).toEqual(['purchased-license', 'restored-license', 'revoked-license']);
});

test('@claim:license-cache-24h automatic license verification reuses a verdict for 24 hours', async ({ page }) => {
  let verificationRequests = 0;
  await page.route('https://pilot-api.sociobot.in/api/v1/products/page-pointer/verify?*', async (route) => {
    verificationRequests += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.clock.install({ time: new Date('2026-08-29T12:00:00Z') });
  await page.goto('/');
  await page.getByLabel('Already purchased? Paste your license').fill('cache-test-license');
  await page.getByRole('button', { name: 'Restore Supporter pack' }).click();
  await expect(page.locator('#license-status')).toContainText('Purchase restored.');
  expect(verificationRequests).toBe(1);

  await page.clock.fastForward(86_399_000);
  await page.reload();
  await expect(page.locator('#license-status')).toContainText('Supporter pack is active');
  expect(verificationRequests).toBe(1);

  await page.clock.fastForward(2_000);
  await page.reload();
  await expect.poll(() => verificationRequests).toBe(2);
  await expect(page.locator('#license-status')).toContainText('Purchase verified.');
});

test('@claim:pwa-update the installable app precaches its shell and applies a waiting update from the prompt', async ({ page }) => {
  const root = resolve('dist');
  let generation = 1;
  const mime: Record<string, string> = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2'
  };
  const server: Server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    if (pathname === '/__generation/2') { generation = 2; response.end('ok'); return; }
    const relative = pathname === '/' || ['/demo', '/privacy', '/terms'].includes(pathname) ? '/index.html' : pathname;
    try {
      let body = await readFile(join(root, relative));
      if (pathname === '/sw.js') body = Buffer.concat([body, Buffer.from(`\n// claim-update-generation:${generation}\n`)]);
      response.setHeader('Content-Type', mime[extname(relative)] ?? 'application/octet-stream');
      if (pathname === '/sw.js') response.setHeader('Cache-Control', 'no-cache');
      response.end(body);
    } catch {
      response.statusCode = 404;
      response.end('not found');
    }
  });
  await new Promise<void>((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Update test server did not bind');
    const origin = `http://127.0.0.1:${address.port}`;
    const consoleErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.waitForFunction(async () => (await caches.keys()).includes('page-pointer-v1.1.3-shell'));
    const manifest = await page.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
    expect(manifest).toMatchObject({ display: 'standalone', start_url: '/?v=2&source=installed' });
    expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '192x192' }), expect.objectContaining({ sizes: '512x512' })]));

    await page.evaluate(async () => { await fetch('/__generation/2'); const registration = await navigator.serviceWorker.getRegistration(); await registration?.update(); });
    await expect(page.locator('#update-toast')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#update-toast')).toContainText('An app update is ready.');
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe('installed');
    await Promise.all([
      page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
      page.getByRole('button', { name: 'Install update' }).click()
    ]);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting)).toBeFalsy();
    expect(consoleErrors).toEqual([]);
  } finally {
    await new Promise<void>((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()));
  }
});
