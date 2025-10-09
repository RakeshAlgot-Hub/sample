import { test, expect } from "@playwright/test";

test("Register and Login flow", async ({ page }) => {

    await page.goto("/login");

    await page.getByRole('link', { name: /Create Account/i }).click();

    await page.waitForURL('/register');

    const username = `testuser${Date.now()}`;
    const email = `test${Date.now()}@example.com`;
    const password = "TestPassword123";

    await page.locator('input[placeholder="Enter your username"]').fill(username);
    await page.locator('input[placeholder="Enter your email address"]').fill(email);
    await page.locator('input[placeholder="Enter password"]').fill(password);
    await page.locator('input[placeholder="Enter Confirm password"]').fill(password);

    // Submit registration
    await page.locator('button:has-text("Register")').click();

    // Wait for success toast or navigation to login page
    await page.waitForTimeout(2500); // match 2s navigate delay in your Register component

    // After register, manually navigate to /login (or wait for redirect if implemented)
    await page.goto("/login");

    // Fill login form with registered credentials
    await page.locator('[data-testid="email-input"]').fill(email);
    await page.locator('[data-testid="password-input"]').fill(password);

    // Click Sign In button
    await Promise.all([
        page.waitForNavigation(), // wait for navigation after login
        page.locator('[data-testid="sign-in-button"]').click(),
    ]);

    await page.waitForTimeout(1000);

    await page.locator('[data-testid="logout-button"]').click();
});
