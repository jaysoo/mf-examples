import { defineConfig, devices } from '@playwright/test';

// Angular Native Federation is dynamic-by-default: the host fetches
// federation.manifest.json at runtime via initFederation(). To prove this,
// we only spawn host + remote-1. The manifest still lists all 3 remotes
// but their remoteEntry.json files are not fetched until a route requires
// them (via loadRemoteModule).
export default defineConfig({
  testDir: './e2e-dynamic',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-dynamic' }]],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'on',
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'ng serve remote-1',
      url: 'http://localhost:4201/remoteEntry.json',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'ng serve host',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
