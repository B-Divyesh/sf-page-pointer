import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sameOrigin = (url: string) => new URL(url).origin === 'http://127.0.0.1:4173';

test('@claim:demo-sandbox the direct sample demo opens a usable guide in its own storage namespace', async ({ page }) => {
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
});

test('@claim:demo-reset Reset demo discards its sample session and Start for real returns to real mode', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.waitForTimeout(3_100);
  await page.getByRole('button', { name: 'Close guide' }).click();
  await Promise.all([
    page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
    page.getByRole('button', { name: 'Reset demo' }).click()
  ]);
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  const sessions = await page.evaluate(async () => new Promise<unknown[]>((resolve, reject) => {
    const request = indexedDB.open('demo:page-pointer');
    request.onsuccess = () => {
      const database = request.result;
      const get = database.transaction('local-data').objectStore('local-data').get('sessions');
      get.onsuccess = () => { database.close(); resolve(get.result ?? []); };
      get.onerror = () => { database.close(); reject(get.error); };
    };
    request.onerror = () => reject(request.error);
  }));
  expect(sessions).toEqual([]);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL('**/');
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toHaveCount(0);
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(names).not.toContain('demo:page-pointer');
});

test('@claim:local-only-reading sample reading sends no third-party request and does not export image or text data', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
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
  expect(requests.every(sameOrigin)).toBe(true);
  expect(data.sessions).toEqual([]);
  expect(JSON.stringify(data)).not.toMatch(/kite|Mina|image|frame|canvas/i);
});

test('@claim:offline-demo the sample guide works offline after the first visit', async ({ page, context }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  await page.goto('/?demo=1');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(async () => (await caches.keys()).some((key) => key.includes('page-pointer-v1.1.2-shell')));
  await page.evaluate(async () => { await document.fonts.ready; });
  expect(await page.evaluate(() => document.fonts.size)).toBe(3);
  expect(await page.evaluate(() => [...document.fonts].every((font) => font.status === 'loaded'))).toBe(true);
  // Let Chromium deliver any final online resource events before the test
  // starts attributing failures to the offline reload.
  await page.waitForTimeout(250);
  expect([consoleErrors, failedRequests]).toEqual([[], []]);
  consoleErrors.length = 0;
  failedRequests.length = 0;
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => document.documentElement.classList.contains('is-offline'))).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('system-ui');
  expect([consoleErrors, failedRequests]).toEqual([[], []]);
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toBeVisible();
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.locator('#coordinate-label')).toContainText('WORD');
});

test('@claim:free-core parents and tutors can try the complete core guide without an account', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('No account needed.')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Keep emerging readers/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toHaveAttribute('href', '/demo');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { name: 'Place the guide' })).toBeVisible();
});

test('keyboard users can reach the skip link and advance the sample guide', async ({ page }) => {
  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await page.waitForTimeout(300);
  await expect(skipLink).toBeFocused();
  await page.locator('#viewfinder').focus();
  const before = await page.locator('#coordinate-label').textContent();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#coordinate-label')).not.toHaveText(before ?? '');
  const afterArrow = await page.locator('#coordinate-label').textContent();
  await page.keyboard.press(' ');
  await expect(page.locator('#coordinate-label')).not.toHaveText(afterArrow ?? '');
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
    if (path !== '/404.html') {
      const canonicalPath = path === '/' ? '/' : path;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://page-pointer.sociobot.in${canonicalPath}`);
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
      await expect(page.locator('footer')).toContainText('v1.1.2');
    }
    expect([consoleErrors, pageErrors]).toEqual([[], []]);
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
});
