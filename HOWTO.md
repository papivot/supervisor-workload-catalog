# How to build and deploy

## Option A — Standalone HTML (no build required)

Open `index-standalone.html` directly in any browser. No npm, no Node.js, no internet connection required. To publish, upload this file as `index.html` to any static host or GitHub repo.

## Option B — Vite + React (full build)

### Prerequisites

- Node.js 18+ and npm

### Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

### Deploy to GitHub Pages

**1. Create a GitHub repository**

Go to https://github.com/new and create a public repo named `supervisor-workload-catalog`.

**2. Confirm the base URL**

In `vite.config.ts`, verify the `base` matches your repo name:

```ts
base: "/supervisor-workload-catalog/",
```

**3. Build and push**

```bash
npm install
npm run build

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/supervisor-workload-catalog.git
git push -u origin main
```

**4. Deploy to the `gh-pages` branch**

```bash
npm run deploy
```

This builds the app and pushes the `dist/` folder to the `gh-pages` branch automatically.

**5. Enable GitHub Pages**

1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages`, folder: `/ (root)`
4. Click **Save**

Your site will be live at `https://<your-username>.github.io/supervisor-workload-catalog/` within ~60 seconds.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- Zero external UI dependencies — all styling is inline CSS
- [gh-pages](https://github.com/tschaub/gh-pages) for deployment
