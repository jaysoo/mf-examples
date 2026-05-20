import { test, expect } from '@playwright/test';
import * as path from 'node:path';

const SCREENSHOTS = path.resolve(__dirname, 'screenshots');

async function shoot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

// The whole MF graph was started by `nx serve nx-react-vite-remote-1`:
//   - host (5200) — vite dev
//   - remote-1 (5201) — vite dev (the explicitly-served one)
//   - remote-2 (5202) — vite preview of built dist (static-serve)
//   - remote-3 (5203) — vite preview of built dist (static-serve)
//
// This e2e proves all 3 federated routes render inside the host (so the
// static-serve remotes are reachable + federation runtime negotiates
// correctly) and each remote is also reachable standalone.
test.describe('nx-react-vite host (started via `nx serve nx-react-vite-remote-1`)', () => {
  test('home page lists three remotes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('home')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /remote 1/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /remote 2/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /remote 3/i })).toBeVisible();
    await shoot(page, '01-home');
  });

  test('/remote-1 federated Counter (dev-served by remote-1)', async ({ page }) => {
    await page.goto('/remote-1', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('remote-1')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'increment' }).click();
    await page.getByRole('button', { name: 'increment' }).click();
    await expect(page.getByTestId('counter-value')).toHaveText('2');
    await shoot(page, '02-remote-1-counter');
  });

  test('/remote-2 federated Form (static-served via vite preview)', async ({ page }) => {
    await page.goto('/remote-2', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('remote-2')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('form-name').fill('Jack');
    await page.getByTestId('form-email').fill('jack@example.com');
    await page.getByTestId('form-message').fill('hello federation');
    await page.getByTestId('form-submit').click();
    await expect(page.getByTestId('form-output')).toContainText('jack@example.com');
    await shoot(page, '03-remote-2-form');
  });

  test('/remote-3 federated List (static-served via vite preview)', async ({ page }) => {
    await page.goto('/remote-3', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('remote-3')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('user-list')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('user-list').locator('li').first()).toBeVisible();
    await shoot(page, '04-remote-3-list');
  });
});

test.describe('standalone remotes (nx-react-vite)', () => {
  for (const { port, name, file } of [
    { port: 5201, name: 'remote-1 standalone (dev server)', file: '05-standalone-remote-1' },
    { port: 5202, name: 'remote-2 standalone (vite preview, static dist)', file: '06-standalone-remote-2' },
    { port: 5203, name: 'remote-3 standalone (vite preview, static dist)', file: '07-standalone-remote-3' },
  ]) {
    test(name, async ({ page }) => {
      await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
      await expect(page.locator('section.remote')).toBeVisible({ timeout: 30_000 });
      await shoot(page, file);
    });
  }
});
