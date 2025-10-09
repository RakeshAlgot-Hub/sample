import { test, expect } from "@playwright/test";

test("Stripe combined card element payment", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Login with Google/i }).click();
  const proceedStripeButton = page.getByRole("button", { name: "Pay $29.99 with Stripe" });
  await proceedStripeButton.waitFor({ state: 'visible' });
  await proceedStripeButton.click();
  await page.waitForTimeout(3000);

  // Select the ONLY Stripe card iframe by title (adjust if multiple Stripe forms exist)
  const stripeCardFrame = page.frameLocator('iframe[title="Secure card payment input frame"]');

  // Focus the card input (all-in-one input)
  const cardInput = stripeCardFrame.locator('input[name="cardnumber"]'); // or use '[aria-label="Credit or debit card number"]'

  // Click to focus, then type card info in correct sequence (cardnumber SPACE expiry SPACE cvc)
  await cardInput.click();
  await cardInput.type('4242424242424242 12/34 123');

  // Now submit Stripe form:
  await page.locator('button[type="submit"]').click();

  // Click the "OK" button inside the dialog
  await page.getByRole('button', { name: 'OK' }).click();


  await page.locator('[data-testid="logout-button"]').waitFor({ timeout: 1000 });
  await page.locator('[data-testid="logout-button"]').click();
});
