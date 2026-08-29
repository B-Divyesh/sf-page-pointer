import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://page-pointer.sociobot.in';
const results = { generatedAt: new Date().toISOString(), base, viewports: {}, demoFlow: {}, camera: {}, reducedMotion: {} };

async function routeAudit(page, path) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const onConsole = (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); };
  const onPageError = (error) => pageErrors.push(String(error));
  const onFailed = (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onFailed);
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const state = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: document.querySelectorAll('h1').length,
    h1Text: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
    main: document.querySelectorAll('main').length,
    missingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  page.off('requestfailed', onFailed);
  return {
    path,
    status: response?.status(),
    headers: response?.headers(),
    ...state,
    axeViolations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
    seriousCritical: axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).length,
    consoleErrors,
    pageErrors,
    failedRequests
  };
}

async function viewportAudit(name, viewport) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const routes = [];
  for (const path of ['/', '/demo', '/privacy', '/terms', '/not-a-real-page']) routes.push(await routeAudit(page, path));

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.reload({ waitUntil: 'networkidle' });
  const firstScreen = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box ? { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom } : null;
    };
    return {
      headline: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
      audience: document.querySelector('.hero .lede')?.textContent?.trim(),
      camera: document.querySelector('#open-camera')?.textContent?.replace(/\s+/g, ' ').trim(),
      demo: document.querySelector('#try-demo')?.textContent?.trim(),
      actionNote: document.querySelector('.action-note')?.textContent?.trim(),
      facts: [...document.querySelectorAll('.privacy-note li')].map((node) => node.textContent?.trim()),
      headlineRect: rect('h1'),
      demoRect: rect('#try-demo'),
      viewportHeight: innerHeight
    };
  });
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return {
      text: document.activeElement?.textContent?.trim(),
      tag: document.activeElement?.tagName,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineColor: style.outlineColor
    };
  });
  const targets = await page.locator('a,button,input,summary,label.file-button,[tabindex="0"]').evaluateAll((nodes) => nodes.flatMap((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    if (style.visibility === 'hidden' || style.display === 'none' || rect.width === 0 || rect.height === 0) return [];
    return [{
      name: node.getAttribute('aria-label') || node.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) || node.id,
      tag: node.tagName,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10
    }];
  }));
  await page.screenshot({ path: `.factory/evidence/verification-3/${name}-cold.png`, fullPage: false });
  results.viewports[name] = {
    viewport,
    routes,
    firstScreen,
    firstScreenPass: Boolean(firstScreen.headline && firstScreen.audience && firstScreen.demo === 'Try it with sample data' && firstScreen.actionNote && firstScreen.demoRect?.bottom <= firstScreen.viewportHeight),
    focus,
    outgoingOrigins: [...new Set(requests.map((url) => new URL(url).origin))],
    targetsUnder44: targets.filter((target) => target.width < 44 || target.height < 44)
  };
  await context.close();
  await browser.close();
}

async function demoFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.locator('#focus-guide.is-visible').waitFor();
  const initial = await page.locator('#coordinate-label').textContent();
  await page.getByRole('button', { name: 'Next word' }).click();
  const afterNext = await page.locator('#coordinate-label').textContent();
  await page.getByRole('button', { name: 'Previous word' }).click();
  const afterPrevious = await page.locator('#coordinate-label').textContent();
  await page.locator('#viewfinder').focus();
  await page.keyboard.press('ArrowRight');
  const afterArrow = await page.locator('#coordinate-label').textContent();
  await page.keyboard.press(' ');
  const afterSpace = await page.locator('#coordinate-label').textContent();
  await page.getByRole('button', { name: 'Line' }).click();
  const lineMode = await page.evaluate(() => ({
    pressed: document.querySelector('[data-mode="line"]')?.getAttribute('aria-pressed'),
    status: document.querySelector('#guide-status')?.textContent?.replace(/\s+/g, ' ').trim(),
    guideWidth: document.querySelector('#focus-guide')?.getBoundingClientRect().width
  }));
  for (let index = 0; index < 30; index += 1) await page.getByRole('button', { name: 'Next word' }).click();
  const endState = await page.locator('#guide-status').textContent();
  await page.waitForTimeout(3_100);
  await page.getByRole('button', { name: 'Close guide' }).click();
  await page.locator('details.settings').evaluate((node) => { node.open = true; });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  await page.locator('#import-data').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":2}') });
  await page.getByText('This is not a Page Pointer export.').waitFor();
  const invalidImport = await page.locator('#data-status').textContent();
  const storageBeforeReset = await page.evaluate(async () => ({
    databases: (await indexedDB.databases()).map((database) => database.name),
    localStorageKeys: Object.keys(localStorage)
  }));
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForLoadState('networkidle');
  await page.locator('#focus-guide.is-visible').waitFor();
  const sessionsAfterReset = await page.evaluate(async () => new Promise((resolve, reject) => {
    const request = indexedDB.open('demo:page-pointer');
    request.onsuccess = () => {
      const database = request.result;
      const get = database.transaction('local-data').objectStore('local-data').get('sessions');
      get.onsuccess = () => { database.close(); resolve(get.result ?? []); };
      get.onerror = () => { database.close(); reject(get.error); };
    };
    request.onerror = () => reject(request.error);
  }));
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL(`${base}/`);
  const storageAfterReal = await page.evaluate(async () => ({
    databases: (await indexedDB.databases()).map((database) => database.name),
    banner: Boolean(document.querySelector('.demo-banner'))
  }));
  results.demoFlow = {
    initial, afterNext, afterPrevious, afterArrow, afterSpace, lineMode,
    endState: endState?.replace(/\s+/g, ' ').trim(),
    exported,
    exportedContainsPageContent: /kite|Mina|image|frame|canvas/i.test(JSON.stringify(exported)),
    invalidImport,
    storageBeforeReset,
    sessionsAfterReset,
    storageAfterReal,
    outgoingOrigins: [...new Set(requests.map((url) => new URL(url).origin))],
    consoleErrors,
    pageErrors
  };
  await context.close();
  await browser.close();
}

async function cameraChecks() {
  const deniedBrowser = await chromium.launch({ headless: true });
  const deniedContext = await deniedBrowser.newContext({ viewport: { width: 390, height: 844 } });
  await deniedContext.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => { throw new DOMException('Permission denied', 'NotAllowedError'); } }
    });
  });
  const deniedPage = await deniedContext.newPage();
  await deniedPage.goto(`${base}/`);
  await deniedPage.getByRole('button', { name: 'Open camera' }).click();
  await deniedPage.getByText('Camera access is off.').waitFor();
  results.camera.denied = await deniedPage.locator('#camera-message').textContent();
  await deniedBrowser.close();

  const fakeBrowser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const fakeContext = await fakeBrowser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'] });
  const fakePage = await fakeContext.newPage();
  const errors = [];
  fakePage.on('pageerror', (error) => errors.push(String(error)));
  await fakePage.goto(`${base}/`);
  await fakePage.getByRole('button', { name: 'Open camera' }).click();
  await fakePage.getByRole('heading', { name: 'Place the pointer' }).waitFor();
  const beforeClose = await fakePage.locator('#camera-video').evaluate((video) => ({
    hidden: video.hidden,
    readyState: video.readyState,
    trackStates: video.srcObject ? [...video.srcObject.getTracks()].map((track) => track.readyState) : []
  }));
  await fakePage.getByRole('button', { name: 'Close guide' }).click();
  const afterClose = await fakePage.locator('#camera-video').evaluate((video) => ({ hidden: video.hidden, srcObject: video.srcObject }));
  results.camera.fake = { beforeClose, afterClose, errors };
  await fakeBrowser.close();
}

async function reducedMotionCheck() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`);
  await page.locator('#focus-guide.is-visible').waitFor();
  results.reducedMotion = await page.evaluate(() => ({
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    focusTransitionDuration: getComputedStyle(document.querySelector('#focus-guide')).transitionDuration,
    animatedElements: document.getAnimations().filter((animation) => animation.playState === 'running').length
  }));
  await browser.close();
}

await viewportAudit('mobile-390', { width: 390, height: 844 });
await viewportAudit('desktop-1440', { width: 1440, height: 900 });
await demoFlow();
await cameraChecks();
await reducedMotionCheck();
console.log(JSON.stringify(results, null, 2));
