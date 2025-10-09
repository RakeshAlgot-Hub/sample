


# 🚀 Frontend Project Template (Vite + React + TS + Tailwind)

This is a dynamic **frontend project template** built with **Vite**, **React**, **TypeScript**, **Tailwind CSS**, **Stripe**, and **Razorpay**.  
It includes a custom **bootstrap script** (`setupUiTemplate.sh`) to quickly create new projects with pre-configured environment variables.

---

## 📦 Features

- ⚡ **Vite + React + TypeScript** – Modern, fast development
- 🎨 **Tailwind CSS** – Utility-first styling
- 💳 **Stripe + Razorpay** – Payment gateway integrations
- ⚙️ **Bootstrap Script** – Create new projects with one command
- 🌐 **Dynamic Config** – Project name & description auto-injected from `.env`
- 🧹 **Clean Setup** – Skips `node_modules` and `.git` when copying

---

## 🚀 Getting Started

### 1. Run Setup Script
Create a new project with:
```bash
./setupUiTemplate.sh <path-to-create> <project-name>
````

Example:

```bash
./setupUiTemplate.sh /d/ProjectName ui
```

If arguments are omitted, the script will ask you interactively.

---

## ⚙️ Environment Variables

The setup script generates a `.env` file with required values.

Example `.env`:

```env
# Project Info
VITE_PROJECT_NAME=MyApp
VITE_PROJECT_DESCRIPTION=My amazing Vite project

# API Config
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=admin123

# Payment Config
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_RAZORPAY_KEY_SECRET=xxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Theme Colors (edit anytime)
VITE_PRIMARY_500=#38bdf8
VITE_PRIMARY_600=#0ea5e9
VITE_SECONDARY_500=#4ade80
VITE_SECONDARY_600=#22c55e
VITE_ACCENT_500=#fbbf24
VITE_ACCENT_600=#f59e0b
```

---

## 🎨 Dynamic Title & Description

The `index.html` template updates **title** and **description** dynamically from `.env`:

```html
<title id="dynamic-title">Dynamic App</title>
<meta name="description" id="dynamic-description" content="A dynamic application template" />
```

Injected at runtime:

```js
const projectName = import.meta.env.VITE_PROJECT_NAME || 'Dynamic App';
const projectDescription = import.meta.env.VITE_PROJECT_DESCRIPTION || 'A dynamic application template';
```

---

## 🛠️ Development

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 📁 Folder Structure

```
project-root/
├── public/             # Static assets
├── src/                # React + TS source code
│   ├── components/     # Shared components
│   ├── pages/          # Page-level views
│   ├── stores/         # Zustand stores
│   ├── services/       # API services
│   └── main.tsx        # App entry
├── index.html          # Template with dynamic title & description
├── setupUiTemplate.sh  # Bootstrap script
└── .env                # Environment variables
```

---

## 🎉 Notes

* The setup script automatically installs dependencies and updates project name.
* You can edit colors, project name, and description anytime in `.env`.
* Every new project is clean and independent.

