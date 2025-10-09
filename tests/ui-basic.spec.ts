import { test, expect } from '@playwright/test';

test.describe('Basic UI Tests', () => {
  test('Application loads and shows login page', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);

    // Check if login page elements are present
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();
    await expect(page.getByText(/futureFrame/i).first()).toBeVisible();
  });

  test('Navigation to different routes without auth shows login', async ({ page }) => {
    // Try accessing all protected routes (including /tv)
    const protectedRoutes = ['/teacher', '/tv', '/branding', '/generated-content'];

    for (const route of protectedRoutes) {
      await page.goto(`http://localhost:5175${route}`);
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('TV page requires authentication', async ({ page }) => {
    await page.goto('http://localhost:5175/tv');

    // Should redirect to login since TV page is now protected
    await expect(page).toHaveURL(/.*login/);

    // Should show login page elements
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();
  });

  test('Application build integrity check', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Check no critical console errors (some warnings are OK)
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('Failed to fetch') && // API calls will fail without backend
      !error.includes('401') && // Expected auth errors
      !error.includes('404') // Expected for missing auth endpoints
    );

    expect(criticalErrors).toHaveLength(0);
  });
});