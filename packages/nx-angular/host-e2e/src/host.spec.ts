import { test, expect } from '@playwright/test';
import * as path from 'node:path';

const SCREENSHOTS = path.resolve(__dirname, '..', 'screenshots');

async function shoot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

test.describe('host (nx-angular)', () => {
  test('home page lists three remotes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByTestId('home')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: /remote 1/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /remote 2/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /remote 3/i })).toBeVisible();
    await shoot(page, '01-home');
  });

  test('/ng_remote1 loads the federated Counter', async ({ page }) => {
    await page.goto('/ng_remote1', { waitUntil: 'load' });
    await expect(page.getByTestId('remote-1')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /counter/i })).toBeVisible();
    await expect(page.getByTestId('counter-value')).toHaveText('0');
    await page.getByRole('button', { name: 'increment' }).click();
    await page.getByRole('button', { name: 'increment' }).click();
    await expect(page.getByTestId('counter-value')).toHaveText('2');
    await shoot(page, '02-remote-1-counter');
  });

  test('/ng_remote2 loads the federated Form', async ({ page }) => {
    await page.goto('/ng_remote2', { waitUntil: 'load' });
    await expect(page.getByTestId('remote-2')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('form-name').fill('Jack');
    await page.getByTestId('form-email').fill('jack@example.com');
    await page.getByTestId('form-message').fill('hello federation');
    await page.getByTestId('form-submit').click();
    await expect(page.getByTestId('form-output')).toContainText('jack@example.com');
    await shoot(page, '03-remote-2-form');
  });

  test('/ng_remote3 loads the federated List', async ({ page }) => {
    await page.goto('/ng_remote3', { waitUntil: 'load' });
    await expect(page.getByTestId('remote-3')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('user-list')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('user-list').locator('li').first()).toBeVisible();
    await shoot(page, '04-remote-3-list');
  });
});

test.describe('standalone remotes (nx-angular)', () => {
  for (const { port, name, file } of [
    { port: 4201, name: 'ng_remote1 standalone', file: '05-standalone-remote-1' },
    { port: 4202, name: 'ng_remote2 standalone', file: '06-standalone-remote-2' },
    { port: 4203, name: 'ng_remote3 standalone', file: '07-standalone-remote-3' },
  ]) {
    test(name, async ({ page }) => {
      await page.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
      await expect(page.locator('section[data-testid^="remote-"]')).toBeVisible({ timeout: 30_000 });
      await shoot(page, file);
    });
  }
});
