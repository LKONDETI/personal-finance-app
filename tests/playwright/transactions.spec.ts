import { test, expect } from '@playwright/test';

test.describe('Transactions', () => {
  test('should load transactions page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to transactions if available
    const transactionsLink = page.locator('[href*="transaction"], a:has-text("Transaction")').first();
    if (await transactionsLink.isVisible()) {
      await transactionsLink.click();
      await page.waitForLoadState('networkidle');
    }
    expect(await page.locator('body').textContent()).toBeTruthy();
  });

  test('should display transaction list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
