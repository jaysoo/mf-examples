import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'on',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command:
      'NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run-many --target=serve --projects=host,remote1,remote2,remote3 --parallel=4',
    url: 'http://localhost:4201/remoteEntry.js',
    reuseExistingServer: !process.env['CI'],
    timeout: 240_000,
    cwd: workspaceRoot,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
