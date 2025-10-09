import { chromium } from "@playwright/test";

(async () => {
  const context = await chromium.launchPersistentContext(
    "C:\\Users\\ADMIN\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1",
    {
      headless: false,
      executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    }
  );

  const page = await context.newPage();
  await page.goto("http://localhost:5173/login");


  await page.getByRole("button", { name: /Login with Google/i }).click();


  await page.waitForURL("http://localhost:5173", { timeout: 60000 });


  await context.storageState({ path: "./tests/auth/storage/saveGoogleAuth.json" });
  console.log("✅ Google login session saved for future tests");

  await context.close();
})();
