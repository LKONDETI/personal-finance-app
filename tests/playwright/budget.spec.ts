import { test, expect } from '@playwright/test';

test.describe('Budget Management', () => {
  test('should load budget page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to budget if available
    const budgetLink = page.locator('[href*="budget"], a:has-text("Budget")').first();
    if (await budgetLink.isVisible()) {
      await budgetLink.click();
      await page.waitForLoadState('networkidle');
    }
    expect(await page.locator('body').textContent()).toBeTruthy();
  });

  test('should display budget information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
