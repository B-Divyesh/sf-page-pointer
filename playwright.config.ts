import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  // Service workers and Cache Storage are origin-wide in Chromium; serialize
  // browser projects so an offline assertion never races a worker upgrade.
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  }
});
