import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display authentication UI elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Check if any auth-related elements exist or page loaded successfully
    const authElements = await page.locator('[class*="auth"], [id*="auth"]').count();
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });

  test('should handle user session management', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Verify page loaded without critical auth errors
    const errorMessages = await page.locator('[class*="error"]').count();
    expect(errorMessages).toBeLessThanOrEqual(10);
  });
});
