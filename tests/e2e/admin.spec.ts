import { test, expect } from '@playwright/test';

test.describe('Admin', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByText(/Invalid password|密码错误/)).toBeVisible();
  });

  test('correct password logs in', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible({ timeout: 8000 });
  });
});
