import { test, expect } from "@playwright/test";

test("Push Notification with permission allowed", async ({ browser }) => {
    // Create a new context with notification permission granted for your domain
    const context = await browser.newContext({
        permissions: ['notifications'],
        // optionally specify the origin if needed
        // permissions: [{ name: 'notifications', origin: 'http://localhost:5173' }]
    });
    const page = await context.newPage();

    await page.goto("/login");

    // Proceed with Google login and the rest of your flow
    await page.getByRole("button", { name: /Login with Google/i }).click();

    const notificationButton = page.getByRole('button', { name: /enable notifications/i });

    await notificationButton.waitFor({ state: 'visible' });
    await expect(notificationButton).toBeEnabled();

    const spinner = notificationButton.locator('div.animate-spin');
    if (await spinner.count() > 0) {
        await spinner.waitFor({ state: 'detached' });
    }

    await notificationButton.click();
        await notificationButton.click();
            await notificationButton.click();

    await page.locator('[data-testid="logout-button"]').click();

    await page.locator('[data-testid="email-input"]').fill("admin@example.com");
    await page.locator('[data-testid="password-input"]').fill("asdf");

    // Click Sign In button
    await page.locator('[data-testid="sign-in-button"]').click();

    // Click Push Notification tab button
    const pushNotificationTab = page.locator('[data-testid="push-notification-tab-button"]');
    await pushNotificationTab.waitFor({ state: 'visible' });
    await pushNotificationTab.click();

    // Fill bulk notification message
    const bulkMessageInput = page.locator('[data-testid="bulk-notification-message"]');
    await bulkMessageInput.fill("This is a test bulk notification message.");

    // Click send to all button
    const sendToAllButton = page.locator('[data-testid="send-to-all-button"]');
    await sendToAllButton.click();

    // Wait for possible send processing - adjust time as needed
    await page.waitForTimeout(2000);

    // Now test individual user message send

    // Get a user id from the user list - adjust selector & attribute as needed
    // Here assuming users are rendered with individual message input field with data-testid `individual-message-{userId}`
    // We'll find the first such input and extract its userId portion from data-testid attribute

    const individualMessageInput = await page.locator('input[data-testid^="individual-message-"]').first();
    const dataTestId = await individualMessageInput.getAttribute('data-testid');
    if (!dataTestId) throw new Error('No individual message input found');

    // Extract userId from data-testid = "individual-message-{userId}"
    const userId = dataTestId.replace('individual-message-', '');

    // Fill individual message
    await individualMessageInput.fill("Hello test user, this is a test notification.");

    // Click send individual user button for the same userId
    const sendToUserButton = page.locator(`[data-testid="send-to-user-button-${userId}"]`);
    await sendToUserButton.click();

    // Wait for send processing (e.g., spinner disappearance) - adjust timing as needed
    await page.waitForTimeout(2000);

    // Close context after test
    await context.close();
});