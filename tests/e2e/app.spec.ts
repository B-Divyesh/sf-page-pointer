import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sameOrigin = (url: string) => new URL(url).origin === 'http://127.0.0.1:4173';

test('@claim:demo-sandbox the direct sample demo opens a usable guide in its own storage namespace', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Page Pointer');
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Place the pointer' })).toBeVisible();
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.locator('#coordinate-label')).toContainText('WORD');
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
  await page.waitForFunction(async () => (await caches.keys()).some((key) => key.includes('page-pointer-v1.1.0-shell')));
  const cachedShell = await page.evaluate(async () => {
    const resources = [...document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>('link[rel="stylesheet"], script[type="module"]')]
      .map((node) => node.getAttribute('href') ?? node.getAttribute('src'))
      .filter((url): url is string => Boolean(url));
    return Promise.all(resources.map(async (url) => Boolean(await caches.match(url))));
  });
  expect(cachedShell).toEqual(cachedShell.map(() => true));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);
  expect([consoleErrors, failedRequests]).toEqual([[], []]);
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toBeVisible();
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.locator('#coordinate-label')).toContainText('WORD');
});

test('@claim:free-guide-and-price parents and tutors can try the complete core guide without an account', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('No account needed.')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Keep emerging readers/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toHaveAttribute('href', '/demo');
  await expect(page.getByRole('link', { name: /Buy once.*₹249/ })).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { name: 'Place the pointer' })).toBeVisible();
});

test('keyboard users can reach the skip link and advance the sample guide', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
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
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''));
    expect(serious, `${path}: ${serious.map((item) => item.id).join(', ')}`).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
});
