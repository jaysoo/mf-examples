import { defineConfig, devices } from '@playwright/test';

// The whole graph boots from a single command: `nx serve nx-react-vite-remote-1`.
// Nx's dependsOn + continuous tasks fire:
//   - nx-react-vite-host:serve         (vite dev, 5200)
//   - nx-react-vite-remote-2:serve-static  (vite preview after vite build, 5202)
//   - nx-react-vite-remote-3:serve-static  (same, 5203)
//   - nx-react-vite-remote-1:serve         (vite dev, 5201) — the entry target
//
// Playwright waits on the host's URL (5200) before tests run.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5200',
    trace: 'retain-on-failure',
    screenshot: 'on',
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx serve nx-react-vite-remote-1',
    url: 'http://localhost:5200',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    cwd: '../..',
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
