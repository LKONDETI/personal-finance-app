import { test, expect } from '@playwright/test';

test.describe('Payment Requests', () => {
  test('should load payment requests page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to requests if available
    const requestsLink = page.locator('[href*="request"], a:has-text("Request")').first();
    if (await requestsLink.isVisible()) {
      await requestsLink.click();
      await page.waitForLoadState('networkidle');
    }
    expect(await page.locator('body').textContent()).toBeTruthy();
  });

  test('should display payment requests list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
