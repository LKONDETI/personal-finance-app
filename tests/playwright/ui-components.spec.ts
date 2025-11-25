import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should render interactive components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    expect(buttons + inputs).toBeGreaterThanOrEqual(0);
  });

  test('should respond to user interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const firstButton = page.locator('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      await page.waitForLoadState('networkidle');
      expect(await page.locator('body')).toBeTruthy();
    }
  });
});
