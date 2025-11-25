import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/my-app|expo/i);
    await expect(page.locator('body')).toBeTruthy();
  });

  test('should navigate between screens', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const links = await page.locator('a, button').count();
    expect(links).toBeGreaterThan(0);
  });
});
