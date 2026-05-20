import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-dynamic',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-dynamic' }]],
  use: {
    baseURL: 'http://localhost:5100',
    trace: 'retain-on-failure',
    screenshot: 'on',
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm -F react-vite-remote-1 dev',
      url: 'http://localhost:5101/remoteEntry.js',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm -F react-vite-host dev',
      url: 'http://localhost:5100',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
