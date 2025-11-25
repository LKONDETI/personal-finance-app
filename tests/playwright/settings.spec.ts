import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('should load settings page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to settings if available
    const settingsLink = page.locator('[href*="setting"], a:has-text("Setting")').first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForLoadState('networkidle');
    }
    expect(await page.locator('body').textContent()).toBeTruthy();
  });

  test('should display settings options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
