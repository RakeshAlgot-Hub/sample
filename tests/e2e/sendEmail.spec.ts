import { test, expect } from "@playwright/test";

test("Send Email bulk and individual message", async ({ page }) => {
  await page.goto("/login");

  // Fill login form
  await page.locator('[data-testid="email-input"]').fill("admin@example.com");
  await page.locator('[data-testid="password-input"]').fill("asdf");

  // Click Sign In button
  await page.locator('[data-testid="sign-in-button"]').click();

  // Wait for login completion - adjust URL or element as needed
  await page.waitForTimeout(2000);

  // Click Send Email tab button
  const sendEmailTab = page.locator('[data-testid="send-email-tab-button"]');
  await sendEmailTab.waitFor({ state: 'visible' });
  await sendEmailTab.click();

  // Fill bulk email subject and message
  await page.locator('[data-testid="bulk-email-subject"]').fill("hello, test user");
  await page.locator('[data-testid="bulk-notification-message"]').fill("This is a test bulk send email message.");

  // Click send to all button
  const sendToAllButton = page.locator('[data-testid="send-to-all-button"]');
  await sendToAllButton.click();

  // Wait for sending to complete - adjust timeout as needed
  await page.waitForTimeout(2000);

  // Test individual email sending

  // Find first individual message input, extract userId from data-testid
  const individualMessageInput = await page.locator('input[data-testid^="individual-message-"]').first();
  const dataTestId = await individualMessageInput.getAttribute('data-testid');
  if (!dataTestId) throw new Error('No individual message input found');
  const userId = dataTestId.replace('individual-message-', '');

  // Fill individual message input for that user
  await individualMessageInput.fill("Hello individual user, this is a test email.");

  // Fill individual subject input for that user
  const individualSubjectInput = page.locator(`[data-testid="individual-subject-${userId}"]`);
  await individualSubjectInput.fill("Personalized subject");

  // Click individual send button
  const sendToUserButton = page.locator(`[data-testid="send-to-user-button-${userId}"]`);
  await sendToUserButton.click();

  // Wait for send to complete (spinner -> gone, adjust timeout)
  await page.waitForTimeout(2000);
  await page.locator('[data-testid="logout-button"]').click();
  await page.waitForTimeout(2000);
});
