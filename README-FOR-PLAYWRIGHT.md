# 🧪 Playwright E2E Testing with Google Auth & Razorpay

This project contains **end-to-end (E2E) tests** for a web application that integrates **Google Login** and **Razorpay payment flow** using [Playwright](https://playwright.dev/).

The setup saves a **Google Auth session** so you don’t need to log in repeatedly during tests.

---

## 📂 Project Structure

```
tests/
 ├── auth/
 │   ├── saveGoogleAuth.ts          # Script to save Google login session
 │   └── storage/
 │       └── saveGoogleAuth.json    # Saved auth state file (generated after login)
 ├── e2e/
 │   └── razorpay.spec.ts           # End-to-end Razorpay payment test
playwright.config.ts                # Playwright configuration
package.json                        # Project dependencies & scripts
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Save Google Login Session

Run this script to log in with Google and save your session to `saveGoogleAuth.json`:

```bash
npx ts-node tests/auth/saveGoogleAuth.ts
```

✅ Once completed, the session is stored and reused across tests.

---

## ▶️ Running Tests

### Run all tests

```bash
npm test
```

### Run E2E tests

```bash
npm run test:e2e
```

### Open Playwright Test UI

```bash
npm run test:ui
```

### Run a specific test file

```bash
npx playwright test tests/e2e/razorpay.spec.ts
```

### Run with a specific browser

```bash
npx playwright test tests/e2e/razorpay.spec.ts --project=chromium
```

Available browsers (configured in `playwright.config.ts`):

* **Chromium (Chrome/Edge)**
* **Firefox**
* **WebKit (Safari)**
* **Edge (custom executable)**
* **Pixel 5 (Android emulation)**
* **iPhone 14 (iOS emulation)**

---

## 🛠 Configuration

### `playwright.config.ts`

* **baseURL** → `http://localhost:5173` (or from `.env` → `VITE_FRONTEND_URL`)
* **storageState** → Reuses `saveGoogleAuth.json` for authenticated tests
* **Timeout** → 28 minutes per test
* **Tracing / Screenshots / Videos** → Enabled on failures
* **Viewports** → Desktop + Mobile devices

---

## 💳 Razorpay Test Flow

The Razorpay test (`razorpay.spec.ts`) simulates:

1. Logging in with Google (session reused from saved state).
2. Proceeding to Razorpay payment.
3. Filling in **mobile, card, expiry, CVV**.
4. Handling **save card** option.
5. Skipping OTP in popup.
6. Completing payment with “Success.”
7. Confirming success and logging out.

---

## 📌 Notes

* First, you must run `saveGoogleAuth.ts` to generate the `saveGoogleAuth.json` file.
* Ensure Google Chrome path and user profile path in `saveGoogleAuth.ts` are correct for your system.
* If tests fail due to session expiry, re-run the `saveGoogleAuth.ts` script.



