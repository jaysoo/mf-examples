import { test, expect } from '@playwright/test';
import * as path from 'node:path';

const SCREENSHOTS = path.resolve(__dirname, 'screenshots');

async function shoot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

// Only host (3000) + remote-1 (3001) are running.
// remote-2 (3002) and remote-3 (3003) servers are intentionally absent,
// but the host's mf-remotes.json still registers all 3.
//
// Dynamic federation guarantees: no remote manifest is fetched until a
// route is navigated to, so the host boots clean and /remote-1 works.
test.describe('dynamic federation (rsbuild) — host loads with only 1 remote alive', () => {
  test('home renders without errors when only remote-1 is alive', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('home')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /remote 1/i })).toBeVisible();
    expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
    await shoot(page, '01-home-with-only-remote-1');
  });

  test('/remote-1 loads (remote-1 server alive)', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto('/remote-1', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('remote-1')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'increment' }).click();
    await page.getByRole('button', { name: 'increment' }).click();
    await expect(page.getByTestId('counter-value')).toHaveText('2');
    expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
    await shoot(page, '02-remote-1-works');
  });

  test('/remote-2 fails gracefully (remote-2 server down)', async ({ page }) => {
    // Suppress expected pageerror from remote-2 failing to load. We assert
    // the error boundary catches it and shows the friendly UI instead of
    // crashing the whole app.
    await page.goto('/remote-2', { waitUntil: 'networkidle' });
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('alert')).toContainText(/failed/i);
    // Home should still be reachable — the host did not crash.
    await page.getByRole('link', { name: /^home$/i }).click();
    await expect(page.getByTestId('home')).toBeVisible();
    await shoot(page, '03-remote-2-down-graceful');
  });
});
