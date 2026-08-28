import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('practice flow places and advances the pointer', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Page Pointer/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('button', { name: 'Try without a camera' }).click();
  await expect(page.getByRole('heading', { name: 'Place the pointer' })).toBeVisible();
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
  const before = await page.locator('#coordinate-label').textContent();
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.locator('#coordinate-label')).not.toHaveText(before ?? '');
  await page.getByRole('button', { name: 'Line', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Line', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(consoleErrors).toEqual([]);
});

test('home and legal pages have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/privacy', '/terms']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''));
    expect(serious, `${path}: ${serious.map((item) => item.id).join(', ')}`).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

test('app shell and practice guide work offline after first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Keep their eyes');
  await page.getByRole('button', { name: 'Try without a camera' }).click();
  await expect(page.locator('#focus-guide')).toHaveClass(/is-visible/);
});
