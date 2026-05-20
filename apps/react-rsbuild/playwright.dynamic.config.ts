import { defineConfig, devices } from '@playwright/test';

// Dynamic federation proof: only 1 remote is spawned, but the host's
// mf-remotes.json still lists all 3. The host must not crash on boot
// because no remote manifest is fetched until a route is navigated to.
export default defineConfig({
  testDir: './e2e-dynamic',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-dynamic' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'on',
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm -F react-rsbuild-remote-1 dev',
      url: 'http://localhost:3001/mf-manifest.json',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm -F react-rsbuild-host dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
