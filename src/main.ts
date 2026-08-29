import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './style.css';
import { detectText, nearestPosition, stepPosition, type DetectionResult } from './detection';
import { addSession, clearData, exportData, getPreferences, importData, resetDemoData, savePreferences, setStorageNamespace, type Preferences } from './storage';
import { cachedUnlock, captureLicenseFromUrl, checkoutUrl, LICENSE_KEY, removeLicense, saveLicense, verifyLicense } from './license';

declare global {
  interface WindowEventMap { beforeinstallprompt: BeforeInstallPromptEvent }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const app = document.querySelector<HTMLDivElement>('#app')!;

const route = location.pathname.replace(/\/$/, '');
const isDemo = route === '/demo' || (route === '' && new URLSearchParams(location.search).get('demo') === '1');
setStorageNamespace(isDemo ? 'demo' : 'real');
setRouteMetadata(route, isDemo);

if (route === '/privacy' || route === '/terms') renderLegal(route);
else {
  renderHome();
}

function setRouteMetadata(path: string, demo: boolean): void {
  const metadata = path === '/privacy'
    ? { title: 'Privacy — Page Pointer', description: 'How Page Pointer keeps camera frames and reading data on your device.', canonicalPath: '/privacy' }
    : path === '/terms'
      ? { title: 'Terms — Page Pointer', description: 'Terms for the free Page Pointer guide and optional one-time Supporter pack.', canonicalPath: '/terms' }
      : demo
        ? { title: 'Demo — Page Pointer', description: 'Try the isolated Page Pointer sample guide without using real reading data.', canonicalPath: '/demo' }
        : { title: 'Page Pointer — follow words in physical books', description: 'A private, offline camera guide that helps emerging readers stay with the exact word or line in a physical book.', canonicalPath: '/' };
  const canonical = `https://page-pointer.sociobot.in${metadata.canonicalPath}`;
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', metadata.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', metadata.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', metadata.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
}

function renderLegal(route: string): void {
  const privacy = route === '/privacy';
  app.innerHTML = `
    <header class="site-header compact"><a class="brand" href="/" aria-label="Page Pointer home"><img src="/assets/mark.svg" alt="" width="36" height="36"><span>Page Pointer</span></a><nav class="site-nav" aria-label="Primary"><a href="/demo">Demo</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></header>
    <main id="main" class="legal-page" tabindex="-1">
      <p class="eyebrow">${privacy ? 'Privacy' : 'Terms'} · effective 28 August 2026</p>
      <h1>${privacy ? 'How Page Pointer handles your data' : 'Terms for using Page Pointer'}</h1>
      ${privacy ? `
        <p class="lede">Your camera frames stay on your device. Page Pointer does not send, record, or save pictures of books.</p>
        <h2>What stays on this device</h2><p>Your guide preferences and up to 50 brief session summaries are stored in IndexedDB. Each summary contains a start time, duration, and camera source. The demo uses a separate temporary database. Page Pointer deletes it when you start for real. A purchased license and its last check are stored in localStorage. You can export or erase local reading data in Settings.</p>
        <h2>What leaves the device</h2><p>Nothing leaves during reading. If you buy or restore the Supporter pack, Page Pointer sends the license to Sociobot for purchase verification. Sociobot/Dodo handles payment and checkout information under its own notices.</p>
        <h2>Camera and network</h2><p>The browser provides camera access only after you agree. Analysis uses a temporary canvas in memory. Frames are discarded immediately and never written to storage. The app has no analytics, advertising, profiling, or cloud OCR.</p>
        <h2>Your choices</h2><p>You can stop the camera, deny permission, use the demo, export local data, or erase it. Removing this site's browser data also removes all preferences and the saved license.</p>
        <h2>Contact</h2><p>Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p>
      ` : `
        <p class="lede">Page Pointer is a reading aid provided as-is. It is not a diagnostic, medical, tutoring, or assessment service.</p>
        <h2>Using the guide</h2><p>You may use the app at home, in class, or while tutoring. Keep control of the phone and protect it from falls. Do not rely on automatic detection where a mistake could cause harm.</p>
        <h2>Supporter purchase</h2><p>The optional Supporter pack costs ₹249 once. It adds saved visual presets and the quiet ten-minute timer. The camera guide, manual controls, privacy controls, and data export remain free. Sociobot/Dodo is the merchant of record. It handles refunds, and a refund revokes the associated license.</p>
        <h2>Availability and limits</h2><p>The app is designed for printed Latin-script text in v1. Curved pages, glare, illustrations, unusual layouts, or low contrast can affect detection. We may improve or discontinue the service. Where the law permits, the service has no warranties. Liability is limited to the amount you paid.</p>
        <h2>Respectful use</h2><p>Do not record people without permission or violate copyright. Do not interfere with the app or billing service.</p>
        <h2>Contact</h2><p>Questions can be sent to <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p>
      `}
      <p><a class="text-link" href="/">← Return to Page Pointer</a></p>
    </main>
    <footer><div class="footer-brand">Page Pointer</div><p>A reading guide for shared physical books.</p><nav aria-label="Legal"><a href="/demo">Demo</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><p class="generated-note">Built by Param Factory · v1.1.2</p></footer>`;
}

function renderHome(): void {
  app.innerHTML = `
    <header class="site-header">
      <a class="brand" href="/" aria-label="Page Pointer home"><img src="/assets/mark.svg" alt="" width="36" height="36"><span>Page Pointer</span></a>
      <nav class="site-nav" aria-label="Primary"><a href="/demo">Demo</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      <div class="header-tools"><span class="network-state" id="network-state"><i aria-hidden="true"></i><span>Checking…</span></span><button class="quiet-button" id="install-button" type="button" hidden>Install app</button></div>
    </header>
    ${isDemo ? '<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Try the guide without using your reading data.</span><button class="quiet-button" id="reset-demo" type="button">Reset demo</button><button class="quiet-button" id="start-real" type="button">Start for real</button></aside>' : ''}
    <main id="main" tabindex="-1">
      <section class="hero" id="top">
        <div class="hero-copy">
          <p class="eyebrow">Camera reading guide</p>
          <h1>Keep emerging readers<br><em>on the right word.</em></h1>
          <p class="lede">For parents, tutors, and emerging readers, it marks the current word on a physical book.</p>
          <div class="hero-actions">
            <button class="primary-button" id="open-camera" type="button"><span>Open camera</span><span aria-hidden="true">↗</span></button>
            <a class="secondary-button" id="try-demo" href="/demo">Try it with sample data</a>
          </div>
          <p class="action-note">Opens a practice page with a short sample story.</p>
          <ul class="privacy-note" aria-label="Page Pointer facts"><li>Frames stay on this device.</li><li>No account needed.</li><li>Works offline after its first visit.</li></ul>
          <div class="camera-message" id="camera-message" role="status" aria-live="polite"></div>
        </div>
        <figure class="hero-visual">
          <picture><source type="image/avif" srcset="/assets/page-pointer-hero-768.avif 768w, /assets/page-pointer-hero-1024.avif 1024w" sizes="(max-width: 800px) calc(100vw - 48px), 56vw"><source type="image/webp" srcset="/assets/page-pointer-hero-768.webp 768w, /assets/page-pointer-hero-1024.webp 1024w, /assets/page-pointer-hero-1536.webp 1536w" sizes="(max-width: 800px) calc(100vw - 48px), 56vw"><img src="/assets/page-pointer-hero-1024.jpg" width="1536" height="1024" alt="An open illustrated book and phone are arranged on a cyan drafting mat. A yellow guide crosses the phone screen." fetchpriority="high" decoding="async"></picture>
          <figcaption><span>Setup</span> Phone over a physical book · tap to set the guide</figcaption>
        </figure>
      </section>

      <section class="instrument" id="instrument" hidden aria-labelledby="instrument-title">
        <div class="instrument-heading">
          <div><p class="eyebrow">Camera guide · runs on this device</p><h2 id="instrument-title">Place the guide</h2></div>
          <button class="quiet-button light" id="stop-guide" type="button">Close guide</button>
        </div>
        <p class="instrument-help" id="instrument-help">Hold the phone steady above the page, then tap the word being read.</p>
        <div class="viewfinder-shell">
          <div class="viewfinder" id="viewfinder" role="button" tabindex="0" aria-label="Camera view. Tap or press Enter to place the reading guide.">
            <video id="camera-video" autoplay muted playsinline hidden></video>
            <div class="demo-page" id="demo-page" hidden aria-hidden="true">
              <span class="demo-kicker">THE SMALL RED KITE</span>
              <p><span>The</span> <span>kite</span> <span>danced</span> <span>above</span> <span>the</span> <span>hill.</span></p>
              <p><span>Mina</span> <span>held</span> <span>the</span> <span>string</span> <span>and</span> <span>smiled.</span></p>
              <p><span>Up,</span> <span>up,</span> <span>it</span> <span>climbed</span> <span>into</span> <span>the</span> <span>blue.</span></p>
            </div>
            <div class="reticle" aria-hidden="true"><i></i></div>
            <div class="focus-guide" id="focus-guide" aria-hidden="true"></div>
            <div class="baseline-guide" id="baseline-guide" aria-hidden="true"></div>
            <span class="view-label top-left" id="source-label">REAR CAMERA</span>
            <span class="view-label top-right" id="coordinate-label">NO POINT SET</span>
            <span class="view-label bottom-left">FRAME STAYS LOCAL</span>
          </div>
          <canvas id="analysis-canvas" hidden></canvas>
        </div>
        <div class="guide-status" id="guide-status" aria-live="polite"><strong>Ready to place.</strong><span>Tap a printed word.</span></div>
        <div class="instrument-controls">
          <div class="mode-control" role="group" aria-label="Guide size">
            <button type="button" data-mode="word" aria-pressed="true">Word</button>
            <button type="button" data-mode="line" aria-pressed="false">Line</button>
          </div>
          <div class="step-controls"><button type="button" id="previous-word" aria-label="Previous word"><span aria-hidden="true">←</span><span>Previous</span></button><button type="button" id="next-word" aria-label="Next word"><span>Next</span><span aria-hidden="true">→</span></button></div>
        </div>
        <p class="key-hint"><kbd>←</kbd><kbd>→</kbd> move · <kbd>Space</kbd> next · tap again to re-orient</p>
        <div class="supporter-tools" id="supporter-tools" hidden>
          <div><p class="eyebrow">Supporter pack</p><strong>Saved guide color</strong></div>
          <div class="swatches" role="group" aria-label="Guide color"><button type="button" data-color="#F7C948" style="--swatch:#F7C948" aria-label="Yellow guide"></button><button type="button" data-color="#6DE2E0" style="--swatch:#6DE2E0" aria-label="Cyan guide"></button><button type="button" data-color="#FF8D8D" style="--swatch:#FF8D8D" aria-label="Coral guide"></button></div>
          <button class="quiet-button light" id="timer-button" type="button">Start quiet 10-minute timer</button>
          <span id="timer-status" aria-live="polite"></span>
        </div>
      </section>

      <section class="method" aria-labelledby="method-title">
        <div class="section-rule"><span>How it works</span><span>Three steps</span></div>
        <h2 id="method-title">Follow each word in a physical book</h2>
        <ol class="method-grid">
          <li><span class="method-number">01</span><div><h3>Aim</h3><p>Hold the rear camera above a well-lit printed page. Landscape works best.</p></div></li>
          <li><span class="method-number">02</span><div><h3>Tap</h3><p>Touch the word being read. Page Pointer finds the nearest ink line—without reading it.</p></div></li>
          <li><span class="method-number">03</span><div><h3>Follow</h3><p>Use Next or the arrow keys to travel word by word. Switch to a full-line guide anytime.</p></div></li>
        </ol>
        <div class="limits"><strong>Limits:</strong> v1 is designed for printed Latin-script text. Curved pages, glare, illustrations, or unusual layouts can confuse placement. Tap again or use Previous and Next.</div>
      </section>

      <section class="local-section" aria-labelledby="local-title">
        <div class="local-diagram" aria-hidden="true"><div class="phone-outline"><span></span><i></i><b></b></div><span class="dimension horizontal">NO UPLOAD</span><span class="dimension vertical">FRAME / FRAME</span></div>
        <div><p class="eyebrow">Local data</p><h2 id="local-title">Reading stays private on this device</h2><p>Line detection uses temporary pixels inside this browser. It creates no photos, transcripts, child profiles, scores, trackers, or cloud OCR.</p><details class="settings"><summary>Local data settings</summary><div class="settings-body"><p>Preferences and brief session summaries stay in this browser. Export, import, or erase them whenever you like.</p><div class="settings-actions"><button type="button" class="secondary-button" id="export-data" aria-label="Export JSON">Export JSON</button><label class="secondary-button file-button">Import JSON<input id="import-data" type="file" accept="application/json"></label><button type="button" class="danger-button" id="clear-data" aria-label="Erase local data">Erase local data</button></div><p id="data-status" role="status" aria-live="polite"></p></div></details></div>
      </section>

      <section class="supporter" aria-labelledby="supporter-title" ${isDemo ? 'hidden' : ''}>
        <div><p class="eyebrow">Optional Supporter pack · one-time</p><h2 id="supporter-title">Add colors and a timer for ₹249</h2><p>The complete reading guide stays free. One purchase adds saved guide colors and a quiet ten-minute session timer.</p><p class="legal-copy">Sociobot/Dodo handles payment and refunds. A refund revokes the license.</p><nav class="supporter-legal" aria-label="Supporter purchase policies"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></div>
        <div class="purchase-panel" id="purchase-panel">
          <a class="primary-button" id="buy-link" href="#">Buy once · ₹249</a>
          <form id="restore-form"><label for="license-input">Already purchased? Paste your license</label><div><input id="license-input" name="license" autocomplete="off" spellcheck="false"><button type="submit" class="secondary-button">Restore</button></div></form>
          <p id="license-status" role="status" aria-live="polite">No account required.</p>
        </div>
      </section>
    </main>
    <div class="toast" id="update-toast" role="status" hidden><span>An app update is ready.</span><button type="button" id="update-button">Update</button></div>
    <footer><div class="brand footer-brand"><img src="/assets/mark.svg" alt="" width="32" height="32"><span>Page Pointer</span></div><p>A reading guide for shared physical books.</p><nav aria-label="Legal"><a href="/demo">Demo</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><p class="generated-note">Built by Param Factory · v1.1.2 · original hero artwork</p></footer>`;
  void initialiseHome();
}

async function initialiseHome(): Promise<void> {
  const byId = <T extends HTMLElement>(id: string): T => {
    const element = document.getElementById(id) as T | null;
    if (!element) throw new Error(`Missing ${id}`);
    return element;
  };
  const instrument = byId<HTMLElement>('instrument');
  const viewfinder = byId<HTMLDivElement>('viewfinder');
  const video = byId<HTMLVideoElement>('camera-video');
  const demo = byId<HTMLDivElement>('demo-page');
  const canvas = byId<HTMLCanvasElement>('analysis-canvas');
  const focus = byId<HTMLDivElement>('focus-guide');
  const baseline = byId<HTMLDivElement>('baseline-guide');
  const guideStatus = byId<HTMLDivElement>('guide-status');
  const cameraMessage = byId<HTMLDivElement>('camera-message');
  const coordinateLabel = byId<HTMLSpanElement>('coordinate-label');
  const sourceLabel = byId<HTMLSpanElement>('source-label');
  const licenseStatus = byId<HTMLParagraphElement>('license-status');
  const supporterTools = byId<HTMLDivElement>('supporter-tools');
  const initialLicenseToken = isDemo ? null : captureLicenseFromUrl();
  let preferences: Preferences = await getPreferences().catch(() => ({ mode: 'word', guideColor: '#F7C948', thickness: 12 }));
  let stream: MediaStream | null = null;
  let result: DetectionResult = { lines: [], confidence: 'low' };
  let position: { line: number; word: number } | null = null;
  let source: 'camera' | 'demo' | null = null;
  let sessionStarted = 0;
  let trackingTimer = 0;
  let supporterUnlocked = isDemo ? false : cachedUnlock();
  let timerInterval = 0;
  let timerStarted = 0;

  const applyGuideColor = (color: string) => {
    instrument.style.setProperty('--guide-color', color);
    document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.color === color)));
  };
  const setGuideColor = (color: string) => {
    preferences.guideColor = color;
    applyGuideColor(color);
    void savePreferences(preferences);
  };
  applyGuideColor(supporterUnlocked ? preferences.guideColor : '#F7C948');

  const setMode = (mode: 'word' | 'line') => {
    preferences.mode = mode;
    document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    void savePreferences(preferences);
    drawGuide();
  };
  setMode(preferences.mode);

  const setSupporter = (unlocked: boolean, message?: string) => {
    supporterUnlocked = unlocked;
    supporterTools.hidden = !unlocked;
    applyGuideColor(unlocked ? preferences.guideColor : '#F7C948');
    licenseStatus.textContent = message ?? (unlocked ? 'Supporter pack active on this device.' : 'No account required.');
    const panel = byId<HTMLDivElement>('purchase-panel');
    panel.classList.toggle('is-unlocked', unlocked);
    byId<HTMLAnchorElement>('buy-link').textContent = unlocked ? 'Supporter pack active ✓' : 'Buy once · ₹249';
  };
  setSupporter(supporterUnlocked);

  function buildDemoResult(): DetectionResult {
    const frame = viewfinder.getBoundingClientRect();
    const lines = Array.from(demo.querySelectorAll<HTMLParagraphElement>('p')).map((line) => {
      const lineRect = line.getBoundingClientRect();
      const words = Array.from(line.querySelectorAll<HTMLSpanElement>('span')).map((word) => {
        const rect = word.getBoundingClientRect();
        return { x: rect.left - frame.left, y: rect.top - frame.top, width: rect.width, height: rect.height };
      });
      return { top: lineRect.top - frame.top, bottom: lineRect.bottom - frame.top, baseline: lineRect.bottom - frame.top - 4, words };
    });
    return { lines, confidence: 'high' };
  }

  function drawGuide(): void {
    if (!position || !result.lines[position.line]) {
      focus.classList.remove('is-visible');
      baseline.classList.remove('is-visible');
      return;
    }
    const line = result.lines[position.line];
    const word = line.words[position.word];
    if (!word) return;
    const frame = viewfinder.getBoundingClientRect();
    const scaleX = source === 'camera' ? frame.width / canvas.width : 1;
    const scaleY = source === 'camera' ? frame.height / canvas.height : 1;
    const first = line.words[0];
    const last = line.words[line.words.length - 1];
    const selected = preferences.mode === 'line'
      ? { x: first.x, y: line.top, width: last.x + last.width - first.x, height: line.bottom - line.top }
      : word;
    focus.style.setProperty('--x', `${Math.max(0, selected.x * scaleX - 6)}px`);
    focus.style.setProperty('--y', `${Math.max(0, selected.y * scaleY - 5)}px`);
    focus.style.setProperty('--w', `${Math.min(frame.width, selected.width * scaleX + 12)}px`);
    focus.style.setProperty('--h', `${Math.max(22, selected.height * scaleY + 10)}px`);
    baseline.style.setProperty('--y', `${line.baseline * scaleY + 5}px`);
    focus.classList.add('is-visible');
    baseline.classList.add('is-visible');
    coordinateLabel.textContent = `LINE ${String(position.line + 1).padStart(2, '0')} · WORD ${String(position.word + 1).padStart(2, '0')}`;
    guideStatus.innerHTML = `<strong>${preferences.mode === 'word' ? 'Word' : 'Line'} guide placed.</strong><span>${result.confidence === 'high' ? 'Use Next when the reader moves.' : 'Low contrast—tap again if this missed.'}</span>`;
  }

  function analyseCamera(): DetectionResult | null {
    if (video.readyState < 2) return null;
    const frame = viewfinder.getBoundingClientRect();
    const width = Math.min(640, Math.max(320, Math.round(frame.width * devicePixelRatio)));
    const height = Math.round(width * frame.height / frame.width);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let x = 0;
    let y = 0;
    if (videoRatio > canvasRatio) { drawWidth = height * videoRatio; x = (width - drawWidth) / 2; }
    else { drawHeight = width / videoRatio; y = (height - drawHeight) / 2; }
    context.drawImage(video, x, y, drawWidth, drawHeight);
    return detectText(context.getImageData(0, 0, width, height));
  }

  function placeAt(clientX?: number, clientY?: number): void {
    const frame = viewfinder.getBoundingClientRect();
    const localX = (clientX ?? frame.left + frame.width / 2) - frame.left;
    const localY = (clientY ?? frame.top + frame.height / 2) - frame.top;
    if (source === 'demo') result = buildDemoResult();
    else result = analyseCamera() ?? result;
    const x = source === 'camera' ? localX * canvas.width / frame.width : localX;
    const y = source === 'camera' ? localY * canvas.height / frame.height : localY;
    position = nearestPosition(result, x, y);
    if (!position) {
      guideStatus.innerHTML = '<strong>No clear line found.</strong><span>Move closer, reduce glare, and tap the printed words again.</span>';
      coordinateLabel.textContent = 'NO LINE FOUND';
      drawGuide();
      return;
    }
    drawGuide();
  }

  function startWorkspace(nextSource: 'camera' | 'demo', scrollBehavior: ScrollBehavior = 'smooth'): void {
    source = nextSource;
    sessionStarted = Date.now();
    instrument.hidden = false;
    instrument.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    video.hidden = nextSource !== 'camera';
    demo.hidden = nextSource !== 'demo';
    sourceLabel.textContent = nextSource === 'camera' ? 'REAR CAMERA' : 'SAMPLE PAGE · LOCAL';
    guideStatus.innerHTML = '<strong>Ready to place.</strong><span>Tap a printed word.</span>';
    if (nextSource === 'demo') setTimeout(() => placeAt(), 250);
  }

  async function stopWorkspace(): Promise<void> {
    if (trackingTimer) window.clearInterval(trackingTimer);
    trackingTimer = 0;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.srcObject = null;
    if (source && sessionStarted) {
      const durationSeconds = Math.round((Date.now() - sessionStarted) / 1000);
      if (durationSeconds >= 3) await addSession({ id: crypto.randomUUID(), startedAt: new Date(sessionStarted).toISOString(), durationSeconds, source }).catch(() => undefined);
    }
    source = null;
    sessionStarted = 0;
    position = null;
    result = { lines: [], confidence: 'low' };
    instrument.hidden = true;
    byId<HTMLButtonElement>('open-camera').focus();
  }

  async function openCamera(): Promise<void> {
    cameraMessage.textContent = 'Waiting for camera permission…';
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraMessage.innerHTML = '<strong>This browser cannot open a camera.</strong> Try the sample guide, or open Page Pointer in a current mobile browser.';
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      video.srcObject = stream;
      await video.play();
      cameraMessage.textContent = '';
      startWorkspace('camera');
      trackingTimer = window.setInterval(() => {
        if (!position || document.hidden) return;
        const previousLine = result.lines[position.line];
        const previousWord = previousLine?.words[position.word];
        if (!previousWord) return;
        const previousX = previousWord.x + previousWord.width / 2;
        const previousY = previousWord.y + previousWord.height / 2;
        const next = analyseCamera();
        if (!next) return;
        const nextPosition = nearestPosition(next, previousX, previousY);
        if (nextPosition) { result = next; position = nextPosition; drawGuide(); }
      }, 700);
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      cameraMessage.innerHTML = denied
        ? '<strong>Camera access is off.</strong> Allow it in your browser’s site settings, then try again—or try the sample guide.'
        : '<strong>The rear camera did not open.</strong> Close other camera apps and try again, or try the sample guide.';
    }
  }

  function move(direction: -1 | 1): void {
    if (!position || !result.lines.length) {
      placeAt();
      return;
    }
    const next = stepPosition(result, position, direction);
    if (next.line === position.line && next.word === position.word) {
      guideStatus.innerHTML = `<strong>${direction > 0 ? 'End' : 'Start'} of detected text.</strong><span>Turn the page or tap the next line.</span>`;
      return;
    }
    position = next;
    drawGuide();
  }

  byId<HTMLButtonElement>('open-camera').addEventListener('click', () => void openCamera());
  byId<HTMLButtonElement>('stop-guide').addEventListener('click', () => void stopWorkspace());
  byId<HTMLButtonElement>('previous-word').addEventListener('click', () => move(-1));
  byId<HTMLButtonElement>('next-word').addEventListener('click', () => move(1));
  viewfinder.addEventListener('click', (event) => placeAt(event.clientX, event.clientY));
  viewfinder.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); placeAt(); }
  });
  document.addEventListener('keydown', (event) => {
    if (instrument.hidden || ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); move(1); }
    if (event.key === 'Escape') void stopWorkspace();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode as 'word' | 'line')));
  document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => button.addEventListener('click', () => { if (supporterUnlocked && button.dataset.color) setGuideColor(button.dataset.color); }));

  const timerButton = byId<HTMLButtonElement>('timer-button');
  timerButton.addEventListener('click', () => {
    const status = byId<HTMLSpanElement>('timer-status');
    if (timerInterval) {
      window.clearInterval(timerInterval); timerInterval = 0; timerStarted = 0; status.textContent = 'Timer stopped.'; timerButton.textContent = 'Start quiet 10-minute timer'; return;
    }
    timerStarted = Date.now();
    timerButton.textContent = 'Stop timer';
    const update = () => {
      const remaining = Math.max(0, 600 - Math.floor((Date.now() - timerStarted) / 1000));
      status.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} remaining`;
      if (remaining === 0) { window.clearInterval(timerInterval); timerInterval = 0; timerButton.textContent = 'Start again'; status.textContent = 'Ten minutes complete.'; navigator.vibrate?.([100, 80, 100]); }
    };
    update(); timerInterval = window.setInterval(update, 1000);
  });

  byId<HTMLButtonElement>('export-data').addEventListener('click', async () => {
    const data = await exportData();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.download = `page-pointer-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click(); URL.revokeObjectURL(link.href);
    byId<HTMLParagraphElement>('data-status').textContent = 'Export downloaded.';
  });
  byId<HTMLInputElement>('import-data').addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try { await importData(JSON.parse(await file.text())); preferences = await getPreferences(); setMode(preferences.mode); applyGuideColor(supporterUnlocked ? preferences.guideColor : '#F7C948'); byId<HTMLParagraphElement>('data-status').textContent = 'Local data imported.'; }
    catch (error) { byId<HTMLParagraphElement>('data-status').textContent = error instanceof Error ? error.message : 'Import failed.'; }
  });
  byId<HTMLButtonElement>('clear-data').addEventListener('click', async () => {
    if (!confirm('Erase preferences and session summaries stored by Page Pointer on this device? Your license will not be removed.')) return;
    await clearData();
    byId<HTMLParagraphElement>('data-status').textContent = 'Local reading data erased.';
  });

  if (!isDemo) {
    byId<HTMLAnchorElement>('buy-link').href = checkoutUrl();
    byId<HTMLFormElement>('restore-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const token = byId<HTMLInputElement>('license-input').value.trim();
      if (!token) { licenseStatus.textContent = 'Paste the license token from your receipt.'; return; }
      saveLicense(token);
      licenseStatus.textContent = 'Checking this license…';
      try { const verdict = await verifyLicense(token, true); setSupporter(verdict.valid, verdict.valid ? 'Purchase restored. The Supporter pack is active.' : 'This license is not active. Check the token or buy the pack.'); }
      catch { licenseStatus.textContent = navigator.onLine ? 'Could not check the license. Wait a few seconds, then try again.' : 'Could not check while offline. Reconnect and try again.'; }
    });

    const token = initialLicenseToken;
    if (token) {
      if (supporterUnlocked) setSupporter(true, 'Supporter pack active on this device.');
      void verifyLicense(token).then((verdict) => setSupporter(verdict.valid, verdict.valid ? 'Purchase verified. The Supporter pack is active.' : 'License no longer active. You can purchase again below.')).catch(() => {
        if (supporterUnlocked) licenseStatus.textContent = 'Offline: using the last valid license check.';
      });
    }
  }

  let installPrompt: BeforeInstallPromptEvent | null = null;
  const installButton = byId<HTMLButtonElement>('install-button');
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; installButton.hidden = false; });
  installButton.addEventListener('click', async () => { if (!installPrompt) return; await installPrompt.prompt(); const choice = await installPrompt.userChoice; if (choice.outcome === 'accepted') installButton.hidden = true; installPrompt = null; });

  const updateNetwork = () => {
    document.documentElement.classList.toggle('is-offline', !navigator.onLine);
    const node = byId<HTMLSpanElement>('network-state');
    node.classList.toggle('is-offline', !navigator.onLine);
    const label = node.querySelector('span');
    if (label) label.textContent = navigator.onLine ? 'Ready offline' : 'Offline · guide ready';
  };
  updateNetwork(); window.addEventListener('online', updateNetwork); window.addEventListener('offline', updateNetwork);
  if (isDemo) {
    document.getElementById('reset-demo')?.addEventListener('click', async () => {
      const button = document.getElementById('reset-demo') as HTMLButtonElement;
      button.disabled = true;
      try { await resetDemoData(); location.reload(); }
      catch (error) { button.disabled = false; guideStatus.textContent = error instanceof Error ? error.message : 'The demo could not reset. Reload and try again.'; }
    });
    document.getElementById('start-real')?.addEventListener('click', async () => {
      const button = document.getElementById('start-real') as HTMLButtonElement;
      button.disabled = true;
      try { await resetDemoData(); location.assign('/'); }
      catch (error) { button.disabled = false; guideStatus.textContent = error instanceof Error ? error.message : 'The demo could not close. Reload and try again.'; }
    });
    // An automatic smooth scroll changes Chromium's sequential focus starting
    // point while the first Tab can already be pressed. Finish the initial
    // positioning synchronously, then reset the starting point to the document.
    requestAnimationFrame(() => {
      startWorkspace('demo', 'auto');
      document.body.focus({ preventScroll: true });
    });
  }
  registerServiceWorker();
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  const register = () => navigator.serviceWorker.register('/sw.js').then((registration) => {
    const toast = document.getElementById('update-toast');
    const button = document.getElementById('update-button');
    const reveal = () => { if (toast) toast.hidden = false; };
    if (registration.waiting) reveal();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) reveal(); });
    });
    let updateRequested = false;
    button?.addEventListener('click', () => { updateRequested = true; registration.waiting?.postMessage({ type: 'SKIP_WAITING' }); });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested) location.reload(); });
  }).catch(() => undefined);
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => void register(), { once: true });
}

window.addEventListener('pagehide', () => {
  const token = localStorage.getItem(LICENSE_KEY);
  if (token === '') removeLicense();
});
