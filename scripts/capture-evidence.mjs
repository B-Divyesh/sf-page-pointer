import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const [base = 'http://127.0.0.1:4173', evidenceDir = '.factory/evidence/polish-1/local'] = process.argv.slice(2);
mkdirSync(evidenceDir, { recursive: true });
const browser = await chromium.launch();
const report = { base, routes: [], firstScreen: {}, links: [] };

for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const firstScreen = await page.evaluate(() => {
    const action = document.querySelector('#try-demo')?.getBoundingClientRect();
    const facts = document.querySelector('.privacy-note')?.getBoundingClientRect();
    return {
      h1: document.querySelector('h1')?.textContent?.trim(),
      action: document.querySelector('#try-demo')?.textContent?.trim(),
      actionBottom: action?.bottom,
      factsBottom: facts?.bottom,
      viewportHeight: innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  report.firstScreen[viewport.name] = firstScreen;
  await page.screenshot({ path: `${evidenceDir}/home-${viewport.name}.png`, fullPage: true });
  if (errors.length) throw new Error(`${viewport.name} home console errors: ${errors.join('; ')}`);
  if (firstScreen.horizontalOverflow || firstScreen.factsBottom > viewport.height) throw new Error(`${viewport.name} first screen does not fit`);
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
for (const path of ['/', '/?demo=1', '/demo', '/privacy', '/terms', base.startsWith('https://') ? '/not-a-real-page' : '/404.html']) {
  const errors = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  const route = {
    path,
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator('h1').count(),
    main: await page.locator('main').count(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    seriousAxe: serious.map((violation) => violation.id),
    errors
  };
  report.routes.push(route);
  if (route.h1 !== 1 || route.main !== 1 || serious.length || errors.length) throw new Error(`${path} failed browser checks: ${JSON.stringify(route)}`);
  if (path === '/?demo=1') {
    await page.screenshot({ path: `${evidenceDir}/demo-mobile.png`, fullPage: true });
    if (await page.locator('.demo-banner').count() !== 1 || await page.locator('.supporter').count() !== 0) throw new Error('demo isolation UI failed');
  }
}

await page.goto(`${base}/`);
const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => link.href))]);
for (const href of hrefs) {
  if (!href.startsWith(base)) continue;
  const response = await context.request.get(href);
  report.links.push({ href, status: response.status() });
  if (!response.ok()) throw new Error(`dead link ${href}: ${response.status()}`);
}

writeFileSync(`${evidenceDir}/browser-report.json`, `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(report, null, 2));
