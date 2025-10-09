import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  timeout: 1680000,
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
    storageState: "./tests/auth/storage/saveGoogleAuth.json",  // Reuse auth state here
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: ["--start-maximized"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "edge",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          args: ["--start-maximized"],
        },
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile devices
    {
      name: "Pixel 5 (Android)",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "iPhone 14 (iOS)",
      use: { ...devices["iPhone 14"] },
    },
  ],
});
