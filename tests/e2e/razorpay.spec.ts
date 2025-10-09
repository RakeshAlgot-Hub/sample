import { test, expect } from "@playwright/test";

test("Razorpay payment flow", async ({ page }) => {
  // Step 1: Go to login page
  await page.goto("/login");

  // Step 2: Log in with Google
  await page.getByRole("button", { name: /Login with Google/i }).click();

  // Step 3: Click "Proceed to Payment" for Razorpay
  const proceedButton = page.getByRole("button", { name: "Pay ₹24.99 with Razorpay" });
  await proceedButton.click();

  // Step 4: Wait for Razorpay iframe to load
  const razorpayFrame = page.frameLocator('iframe[src*="razorpay"]');
  await page.waitForTimeout(2000);

  // Step 5: Fill payment details
  await razorpayFrame.getByPlaceholder("Mobile number").fill("9039419336");
  await razorpayFrame.getByPlaceholder("Card Number").fill("2305 3242 5784 8228");
  await razorpayFrame.getByPlaceholder("MM / YY").fill("12/28");
  await razorpayFrame.getByPlaceholder("CVV").fill("258");

  // Step 6: Select "Save card" option
  await razorpayFrame.getByTestId("save-card-checkbox").check();

  // Step 7: Click Continue
  await razorpayFrame.getByRole("button", { name: "Continue" }).click();

  // Step 8: Handle OTP popup and skip OTP
  const [popup] = await Promise.all([
    page.waitForEvent("popup"), 
    razorpayFrame.getByRole("button", { name: "Skip OTP" }).click(),
  ]);

  // Step 9: Inside OTP popup, confirm payment as "Success"
  await popup.getByRole("button", { name: "Success" }).click();

  // Step 10: Confirm final success in main page
  await page.getByRole("button", { name: "OK" }).click();

  // Step 11: Logout
  await page.locator('[data-testid="logout-button"]').click();
});
