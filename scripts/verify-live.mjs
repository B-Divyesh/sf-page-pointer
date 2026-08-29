import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [base = 'https://page-pointer.sociobot.in', evidenceDir = '.factory/evidence/polish-1/live'] = process.argv.slice(2);
mkdirSync(evidenceDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const report = { base, demo: {}, routes: {}, offline: {}, supporter: {} };

const directDemoContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const directDemoPage = await directDemoContext.newPage();
await directDemoPage.goto(`${base}/?demo=1`);
await directDemoPage.locator('#focus-guide').waitFor({ state: 'visible' });
const directDemoDatabases = await directDemoPage.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
await directDemoContext.close();

const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'] });
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
const realDataBeforeDemo = await page.evaluate(async () => new Promise((resolve, reject) => {
  const request = indexedDB.open('page-pointer');
  request.onsuccess = () => {
    const database = request.result;
    const transaction = database.transaction('local-data');
    const store = transaction.objectStore('local-data');
    const keys = store.getAllKeys();
    const values = store.getAll();
    transaction.oncomplete = () => { database.close(); resolve({ keys: keys.result, values: values.result }); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  };
  request.onerror = () => reject(request.error);
}));
report.supporter = {
  heading: await page.locator('#supporter-title').textContent(),
  checkoutLabel: await page.locator('#buy-link').textContent(),
  checkoutHref: await page.locator('#buy-link').getAttribute('href')
};
await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.waitForURL(`${base}/demo`);
await page.locator('#focus-guide').waitFor({ state: 'visible' });
const databasesBeforeReset = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
const realDataDuringDemo = await page.evaluate(async () => new Promise((resolve, reject) => {
  const request = indexedDB.open('page-pointer');
  request.onsuccess = () => {
    const database = request.result;
    const transaction = database.transaction('local-data');
    const store = transaction.objectStore('local-data');
    const keys = store.getAllKeys();
    const values = store.getAll();
    transaction.oncomplete = () => { database.close(); resolve({ keys: keys.result, values: values.result }); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  };
  request.onerror = () => reject(request.error);
}));
const positionBefore = await page.locator('#coordinate-label').textContent();
await page.getByRole('button', { name: 'Next word' }).click();
const positionAfter = await page.locator('#coordinate-label').textContent();
report.demo = {
  banner: await page.locator('.demo-banner').textContent(),
  directDemoDatabases,
  supporterSections: await page.locator('.supporter').count(),
  purchaseLinks: await page.locator('#buy-link').count(),
  databasesBeforeReset,
  realDataUnchanged: JSON.stringify(realDataBeforeDemo) === JSON.stringify(realDataDuringDemo),
  positionMoved: positionBefore !== positionAfter,
  thirdPartyRequests: requests.filter((url) => new URL(url).origin !== new URL(base).origin)
};
await Promise.all([
  page.waitForNavigation(),
  page.getByRole('button', { name: 'Reset demo' }).click()
]);
await page.locator('#focus-guide').waitFor({ state: 'visible' });
report.demo.resetReturnedCleanGuide = true;

await page.goto(`${base}/`);
await page.locator('.local-section').scrollIntoViewIfNeeded();
const scrollBefore = await page.evaluate(() => scrollY);
await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
report.routes = {
  privacyTitle: await page.title(),
  privacyHeadingFocused: await page.locator('h1').evaluate((heading) => heading === document.activeElement),
  announcement: await page.locator('#route-announcement').textContent()
};
await page.goBack();
report.routes.backHeadingFocused = await page.locator('h1').evaluate((heading) => heading === document.activeElement);
report.routes.backScrollRestored = await page.evaluate((before) => scrollY >= before - 80, scrollBefore);

await context.close();

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'] });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${base}/`);
await offlinePage.evaluate(async () => navigator.serviceWorker.ready);
await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
await offlinePage.waitForFunction(async () => (await caches.keys()).includes('page-pointer-v1.1.3-shell'));
await offlineContext.setOffline(true);
await offlinePage.reload({ waitUntil: 'domcontentloaded' });
await offlinePage.getByRole('button', { name: 'Open camera' }).click();
await offlinePage.locator('#camera-video').waitFor({ state: 'visible' });
report.offline.realCameraVisible = true;
await offlinePage.getByRole('button', { name: 'Close guide' }).click();
await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'domcontentloaded' });
await offlinePage.locator('#focus-guide').waitFor({ state: 'visible' });
const offlineDemoBefore = await offlinePage.locator('#coordinate-label').textContent();
await offlinePage.getByRole('button', { name: 'Next word' }).click();
report.offline.sampleGuideMoved = offlineDemoBefore !== await offlinePage.locator('#coordinate-label').textContent();
await offlineContext.setOffline(false);
await offlineContext.close();

const notFoundContext = await browser.newContext();
const notFound = await notFoundContext.newPage();
const notFoundResponse = await notFound.goto(`${base}/not-a-real-page`);
report.routes.notFound = {
  status: notFoundResponse?.status(),
  title: await notFound.title(),
  canonical: await notFound.locator('link[rel="canonical"]').getAttribute('href'),
  ogImage: await notFound.locator('meta[property="og:image"]').getAttribute('content'),
  twitterCard: await notFound.locator('meta[name="twitter:card"]').getAttribute('content'),
  action: await notFound.getByRole('link', { name: 'Open Page Pointer' }).textContent()
};
await notFoundContext.close();

const failures = [
  errors.length > 0,
  report.demo.supporterSections !== 0,
  report.demo.purchaseLinks !== 0,
  report.demo.directDemoDatabases.includes('page-pointer'),
  !report.demo.realDataUnchanged,
  !report.demo.positionMoved,
  report.demo.thirdPartyRequests.length > 0,
  !report.routes.privacyHeadingFocused,
  !report.routes.backHeadingFocused,
  !report.routes.backScrollRestored,
  !report.offline.realCameraVisible,
  !report.offline.sampleGuideMoved,
  report.routes.notFound.status !== 404
];
report.errors = errors;
writeFileSync(`${evidenceDir}/live-interaction-report.json`, `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
if (failures.some(Boolean)) throw new Error(`live verification failed: ${JSON.stringify(report)}`);
console.log(JSON.stringify(report, null, 2));
