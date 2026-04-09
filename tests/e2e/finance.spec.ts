import { test, expect } from '@playwright/test';

test.describe('Finance Page', () => {
  test('loads and shows market section', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByTestId('finance-main')).toBeVisible();
    await expect(page.getByText(/US Markets|美股/)).toBeVisible();
  });

  test('ticker is visible on finance page', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByTestId('ticker')).toBeVisible({ timeout: 5000 });
  });

  test('Finance nav link is active', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByRole('link', { name: 'Finance' })).toBeVisible();
  });
});
