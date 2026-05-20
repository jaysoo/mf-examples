import { test, expect } from '@playwright/test';
import * as path from 'node:path';

const SCREENSHOTS = path.resolve(__dirname, 'screenshots');

async function shoot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

// Only host (4200) + remote-1 (4201) are running. remote-2/remote-3 are
// declared in federation.manifest.json but their servers are absent.
//
// Native Federation is dynamic-by-default: initFederation() reads the
// manifest at boot, but remote entries are only fetched when a route
// triggers loadRemoteModule(). So the host boots clean and /remote-1
// works even with the other servers down.
test.describe('dynamic federation (angular native fed) — host loads with only 1 remote alive', () => {
  test('home renders without errors when only remote-1 is alive', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByTestId('home')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: /remote 1/i })).toBeVisible();
    expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
    await shoot(page, '01-home-with-only-remote-1');
  });

  test('/remote-1 loads (remote-1 server alive)', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto('/remote-1', { waitUntil: 'load' });
    await expect(page.getByTestId('remote-1')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'increment' }).click();
    await page.getByRole('button', { name: 'increment' }).click();
    await expect(page.getByTestId('counter-value')).toHaveText('2');
    expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
    await shoot(page, '02-remote-1-works');
  });
});
