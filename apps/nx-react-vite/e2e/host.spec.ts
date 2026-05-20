import { test, expect } from '@playwright/test';
import * as path from 'node:path';

const SCREENSHOTS = path.resolve(__dirname, 'screenshots');

async function shoot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

// The MF graph was started by `nx serve nx-react-vite-remote-1`. Because
// the host loads remotes lazily (dynamic federation) and remote dependsOn
// only references host:serve, ONLY two processes are alive:
//   - nx-react-vite-host (5200) — vite dev
//   - nx-react-vite-remote-1 (5201) — vite dev
//
// remote-2 (5202) and remote-3 (5203) are NOT running. The host's
// mf-remotes.json still lists them, but federation only fetches a
// remote's manifest when the route is navigated. So home + /remote-1
// render clean; /remote-2 hits the RemoteErrorBoundary gracefully.
test.describe('nx-react-vite host (started via `nx serve nx-react-vite-remote-1`)', () => {
  test('home page lists three remotes; no remote fetches happen on boot', async ({ page }) => {
    const pageErrors: string[] = [];
    const remoteFetches: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('request', (r) => {
      const url = new URL(r.url());
      const isCrossOrigin = url.host !== 'localhost:5200';
      const isManifestConfig = url.pathname.endsWith('/mf-remotes.json');
      if (isCrossOrigin || isManifestConfig) remoteFetches.push(r.url());
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('home')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /remote 1/i })).toBeVisible();
    expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
    expect(remoteFetches, `unexpected fetches on home: ${remoteFetches.join('\n')}`).toEqual([]);
    await shoot(page, '01-home');
  });

  test('/remote-1 federated Counter (remote-1 is alive)', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto('/remote-1', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('remote-1')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'increment' }).click();
    await page.getByRole('button', { name: 'increment' }).click();
    await expect(page.getByTestId('counter-value')).toHaveText('2');
    expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
    await shoot(page, '02-remote-1-counter');
  });

  test('/remote-2 fails gracefully (remote-2 server not started)', async ({ page }) => {
    await page.goto('/remote-2', { waitUntil: 'networkidle' });
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('alert')).toContainText(/failed/i);
    // Home still works — host did not crash.
    await page.getByRole('link', { name: /^home$/i }).click();
    await expect(page.getByTestId('home')).toBeVisible();
    await shoot(page, '03-remote-2-graceful-fail');
  });

  test('remote-1 standalone (own dev server on 5201)', async ({ page }) => {
    await page.goto('http://localhost:5201/', { waitUntil: 'networkidle' });
    await expect(page.locator('section.remote')).toBeVisible({ timeout: 30_000 });
    await shoot(page, '04-standalone-remote-1');
  });
});
