import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sameOrigin = (url: string) => new URL(url).origin === 'http://127.0.0.1:4173';

async function readStoredValue(page: Page, databaseName: string, key: string): Promise<unknown> {
  return await page.evaluate(async ({ databaseName, key }) => await new Promise<unknown>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onsuccess = () => {
      const database = request.result;
      const get = database.transaction('local-data').objectStore('local-data').get(key);
      get.onsuccess = () => { database.close(); resolve(get.result); };
      get.onerror = () => { database.close(); reject(get.error); };
    };
    request.onerror = () => reject(request.error);
  }), { databaseName, key });
}

async function installSyntheticCameraFrame(page: Page): Promise<void> {
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      const context = original.apply(this, args) as CanvasRenderingContext2D | null;
      if (args[0] === '2d' && context) {
        context.getImageData = (_x: number, _y: number, width: number, height: number) => {
          const data = new Uint8ClampedArray(width * height * 4).fill(255);
          for (const row of [Math.round(height * 0.3), Math.round(height * 0.6)]) {
            for (const start of [0.1, 0.28, 0.5, 0.72].map((ratio) => Math.round(width * ratio))) {
              for (let y = row; y < row + 12; y += 1) for (let x = start; x < start + 28; x += 1) {
                const offset = (y * width + x) * 4;
                data[offset] = 20; data[offset + 1] = 20; data[offset + 2] = 20;
              }
            }
          }
          return new ImageData(data, width, height);
        };
      }
      return context as ReturnType<typeof original>;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

test('@claim:demo-sandbox the direct sample demo opens a usable guide in its own storage namespace', async ({ page }) => {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (...args) => {
      (window as typeof window & { demoRequestedCamera?: boolean }).demoRequestedCamera = true;
      return await original(...args);
    };
  });
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Page Pointer');
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Place the guide' })).toBeVisible();
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  const initialWordWidth = await page.locator('#focus-guide').evaluate((element) => element.getBoundingClientRect().width);
  await page.locator('.demo-page p').nth(1).locator('span').first().click();
  await expect(page.locator('#coordinate-label')).toContainText('LINE 02 · WORD 01');
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.locator('#coordinate-label')).toContainText('LINE 02 · WORD 02');
  await page.getByRole('button', { name: 'Previous word' }).click();
  await expect(page.locator('#coordinate-label')).toContainText('LINE 02 · WORD 01');
  await page.locator('#viewfinder').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press(' ');
  await expect(page.locator('#coordinate-label')).toContainText('LINE 02 · WORD 03');
  await page.getByRole('button', { name: 'Line' }).click();
  await expect(page.getByRole('button', { name: 'Line' })).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(300);
  expect(await page.locator('#focus-guide').evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(initialWordWidth);
  await page.waitForTimeout(3_100);
  await page.getByRole('button', { name: 'Close guide' }).click();
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(names).toContain('demo:page-pointer');
  expect(names).not.toContain('page-pointer');
  expect(await page.evaluate(() => (window as typeof window & { demoRequestedCamera?: boolean }).demoRequestedCamera)).toBeUndefined();
});

test('@claim:demo-reset Reset demo discards populated sample data and Start for real preserves real data', async ({ page }) => {
  await page.goto('/');
  await page.locator('details.settings').evaluate((details: HTMLDetailsElement) => { details.open = true; });
  await page.locator('#import-data').setInputFiles({
    name: 'real-reading-data.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      version: 1,
      preferences: { mode: 'line', guideColor: '#FF8D8D', thickness: 12 },
      sessions: [],
      exportedAt: new Date().toISOString()
    }))
  });
  await expect(page.locator('#data-status')).toHaveText('Local data imported.');
  await page.goto('/demo');
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.getByRole('button', { name: 'Line' }).click();
  await page.waitForTimeout(3_100);
  await page.getByRole('button', { name: 'Close guide' }).click();
  await page.waitForFunction(async () => {
    const request = indexedDB.open('demo:page-pointer');
    return await new Promise<boolean>((resolve) => {
      request.onsuccess = () => {
        const database = request.result;
        const get = database.transaction('local-data').objectStore('local-data').get('sessions');
        get.onsuccess = () => { database.close(); resolve(Array.isArray(get.result) && get.result.length === 1); };
      };
    });
  });
  expect(await readStoredValue(page, 'demo:page-pointer', 'preferences')).toMatchObject({ mode: 'line' });
  expect(await readStoredValue(page, 'demo:page-pointer', 'sessions')).toEqual([expect.objectContaining({ source: 'demo' })]);
  expect(await readStoredValue(page, 'page-pointer', 'preferences')).toMatchObject({ mode: 'line', guideColor: '#FF8D8D' });
  await Promise.all([
    page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
    page.getByRole('button', { name: 'Reset demo' }).click()
  ]);
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  expect(await readStoredValue(page, 'demo:page-pointer', 'preferences')).toMatchObject({ mode: 'word', guideColor: '#F7C948' });
  expect(await readStoredValue(page, 'demo:page-pointer', 'sessions')).toBeUndefined();
  expect(await readStoredValue(page, 'page-pointer', 'preferences')).toMatchObject({ mode: 'line', guideColor: '#FF8D8D' });
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL('**/');
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toHaveCount(0);
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(names).not.toContain('demo:page-pointer');
  expect(await readStoredValue(page, 'page-pointer', 'preferences')).toMatchObject({ mode: 'line', guideColor: '#FF8D8D' });
});

test('@claim:local-only-reading sample reading sends no network request and does not export image or text data', async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await page.goto('/demo');
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  const loadedRequests = requests.length;
  await page.getByRole('button', { name: 'Next word' }).click();
  await page.getByRole('button', { name: 'Line' }).click();
  await page.waitForTimeout(800);
  expect(requests.slice(loadedRequests)).toEqual([]);
  await page.locator('details.settings').evaluate((details) => { (details as HTMLDetailsElement).open = true; });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const exported = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream!.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream!.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream!.on('error', reject);
  });
  const data = JSON.parse(exported);
  expect(requests.every((request) => sameOrigin(request.url))).toBe(true);
  expect(data.sessions).toEqual([]);
  expect(JSON.stringify({ data, storage: await page.evaluate(() => Object.entries(localStorage)) })).not.toMatch(/kite|Mina|data:image|base64|canvas/i);
});

test('@claim:offline-demo the camera and sample guides work offline after the first visit', async ({ browser, baseURL }) => {
  const offlineContext = await browser.newContext({ baseURL, permissions: ['camera'] });
  const page = await offlineContext.newPage();
  try {
    const consoleErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto('/');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; await document.fonts.ready; });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.waitForFunction(async () => (await caches.keys()).some((key) => key.includes('page-pointer-v1.1.3-shell')));
    expect(await page.evaluate(() => [...document.fonts].every((font) => font.status === 'loaded'))).toBe(true);

    await offlineContext.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await installSyntheticCameraFrame(page);
    expect(await page.evaluate(() => document.documentElement.classList.contains('is-offline'))).toBe(true);
    await page.getByRole('button', { name: 'Open camera' }).click();
    await expect(page.locator('#camera-video')).toBeVisible();
    await page.locator('#viewfinder').click({ position: { x: 110, y: 150 } });
    await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
    const cameraPosition = await page.locator('#coordinate-label').textContent();
    await page.getByRole('button', { name: 'Next word' }).click();
    await expect(page.locator('#coordinate-label')).not.toHaveText(cameraPosition ?? '');
    await page.getByRole('button', { name: 'Line' }).click();
    await expect(page.getByRole('button', { name: 'Line' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Close guide' }).click();

    await page.goto('/?demo=1', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('complementary', { name: 'Demo controls' })).toBeVisible();
    await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
    await page.getByRole('button', { name: 'Next word' }).click();
    await expect(page.locator('#coordinate-label')).toContainText('WORD');
    expect(consoleErrors).toEqual([]);
  } finally {
    await offlineContext.setOffline(false);
    await offlineContext.close();
  }
});

test('@claim:free-core parents and tutors can use the complete camera guide without an account or license', async ({ page, context }) => {
  await context.grantPermissions(['camera'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await expect(page.getByLabel('Page Pointer facts').getByText('No account needed.')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Keep emerging readers/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:page-pointer'))).toBeNull();
  await installSyntheticCameraFrame(page);
  await page.getByRole('button', { name: 'Open camera' }).click();
  await expect(page.getByRole('heading', { name: 'Place the guide' })).toBeVisible();
  await page.locator('#viewfinder').click({ position: { x: 110, y: 150 } });
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  const placed = await page.locator('#coordinate-label').textContent();
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.locator('#coordinate-label')).not.toHaveText(placed ?? '');
  await page.getByRole('button', { name: 'Previous word' }).click();
  await expect(page.locator('#coordinate-label')).toHaveText(placed ?? '');
  await page.getByRole('button', { name: 'Line' }).click();
  await expect(page.getByRole('button', { name: 'Line' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#viewfinder').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(page.locator('#supporter-tools')).toBeHidden();
  await expect(page.locator('text=/sign in/i')).toHaveCount(0);
});

test('@claim:private-runtime the sample flow loads no tracking, third-party code, remote fonts, or embedded checkout', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1');
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.getByRole('button', { name: 'Next word' }).click();
  await page.locator('details.settings').evaluate((details: HTMLDetailsElement) => { details.open = true; });
  const loaded = await page.evaluate(() => ({
    scripts: [...document.scripts].map((script) => script.src).filter(Boolean),
    frames: document.querySelectorAll('iframe').length,
    resources: performance.getEntriesByType('resource').map((entry) => entry.name),
    fontFamilies: [...document.fonts].map((font) => font.family)
  }));
  expect(requests.every(sameOrigin)).toBe(true);
  expect(loaded.scripts.every(sameOrigin)).toBe(true);
  expect(loaded.resources.every(sameOrigin)).toBe(true);
  expect(loaded.frames).toBe(0);
  expect(loaded.fontFamilies).toEqual(expect.arrayContaining(['Atkinson Hyperlegible', 'IBM Plex Mono']));
});

test('keyboard users can reach the skip link and advance the sample guide', async ({ page }) => {
  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await page.waitForTimeout(300);
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('#viewfinder').focus();
  const before = await page.locator('#coordinate-label').textContent();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#coordinate-label')).not.toHaveText(before ?? '');
  const afterArrow = await page.locator('#coordinate-label').textContent();
  await page.keyboard.press(' ');
  await expect(page.locator('#coordinate-label')).not.toHaveText(afterArrow ?? '');
});

test('route changes, Back, and Forward focus and announce the h1 without losing restored scroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('.local-section').scrollIntoViewIfNeeded();
  const homeScroll = await page.evaluate(() => scrollY);
  await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-announcement')).toContainText('How Page Pointer handles your data page loaded');

  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(homeScroll - 80);

  await page.goForward();
  await expect(page).toHaveURL('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('home, demo, legal pages, and the static 404 have no serious accessibility regressions', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const onConsole = (message: { type(): string; text(): string }) => { if (message.type() === 'error') consoleErrors.push(message.text()); };
    const onPageError = (error: Error) => pageErrors.push(error.message);
    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    await page.goto(path);
    const expectedTitle = path === '/' ? 'Page Pointer — follow words in physical books'
      : path === '/demo' ? 'Demo — Page Pointer'
        : path === '/privacy' ? 'Privacy — Page Pointer'
          : path === '/terms' ? 'Terms — Page Pointer' : 'Page not found — Page Pointer';
    await expect(page).toHaveTitle(expectedTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20}/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', expectedTitle);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.{20}/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /page-pointer-social-1200x630\.jpg$/);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', expectedTitle);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /.{20}/);
    if (path !== '/404.html') {
      const canonicalPath = path === '/' ? '/' : path;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://page-pointer.sociobot.in${canonicalPath}`);
    } else {
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://page-pointer.sociobot.in/404.html');
      await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/assets/icon-192.png');
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /page-pointer-social-1200x630\.jpg$/);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    }
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''));
    expect(serious, `${path}: ${serious.map((item) => item.id).join(', ')}`).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const smallTargets = await page.locator('a,button,summary,label.file-button').evaluateAll((elements) => elements.flatMap((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || !rect.width || !rect.height) return [];
      return rect.width < 44 || rect.height < 44 ? [{ text: element.textContent?.trim(), width: rect.width, height: rect.height }] : [];
    }));
    expect(smallTargets, `${path}: interactive targets below 44px`).toEqual([]);
    if (path === '/404.html') {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
      await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toBeVisible();
      await expect(page.locator('footer')).toContainText('v1.1.3');
    }
    expect([consoleErrors, pageErrors]).toEqual([[], []]);
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
});
