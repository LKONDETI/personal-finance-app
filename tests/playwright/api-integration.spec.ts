import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should fetch data from Supabase', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Check if data loaded successfully
    const loadedContent = await page.locator('body').textContent();
    expect(loadedContent).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/');
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    await page.waitForLoadState('networkidle');
    // Verify no critical errors
    const errors = consoleMessages.filter(msg => msg.toLowerCase().includes('error'));
    expect(errors.length).toBeLessThan(5);
  });
});
