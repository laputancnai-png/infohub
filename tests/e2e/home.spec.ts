import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows GitHub section by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Laputan Info Hub/);
    await expect(page.getByTestId('github-grid')).toBeVisible();
  });

  test('ticker strip is visible', async ({ page }) => {
    await page.goto('/');
    // Ticker appears after client-side fetch — wait up to 5s
    await expect(page.getByTestId('ticker')).toBeVisible({ timeout: 5000 });
  });

  test('FAB opens donate modal', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('fab').click();
    await expect(page.getByText('Buy me a coffee ☕')).toBeVisible();
  });

  test('donate modal PayPal tab switches', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('fab').click();
    await page.getByTestId('donate-modal').getByRole('button', { name: 'PayPal' }).click();
    await expect(page.getByText('Donate via PayPal')).toBeVisible();
  });

  test('dark mode toggle changes theme', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await page.getByRole('button', { name: /toggle theme/i }).click();
    const cls = await html.getAttribute('class');
    expect(cls).toMatch(/dark|light/);
  });

  test('tab switching shows news tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: /Hacker News/ }).click();
    await expect(page.getByTestId('news-grid')).toBeVisible();
  });

  test('navbar Finance link is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Finance' })).toBeVisible();
  });
});
