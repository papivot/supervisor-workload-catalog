# vSphere Supervisor Cluster — Workload Catalog

An interactive React app listing every deployment, daemonset, and static pod running in a vSphere Supervisor cluster, with per-workload role summaries.

## Live Demo

After deploying to GitHub Pages, your app will be at:
```
https://<your-github-username>.github.io/supervisor-workload-catalog/
```

---

## Deploy to GitHub Pages

### 1. Create a GitHub repository

Go to https://github.com/new and create a **public** repo named `supervisor-workload-catalog`.

### 2. Update the base URL

Edit `vite.config.ts` and confirm the `base` matches your repo name:

```ts
base: "/supervisor-workload-catalog/",
```

If you named the repo differently, update this to match.

### 3. Install dependencies and build

```bash
npm install
npm run build
```

This produces a `dist/` folder with the static site.

### 4. Push to GitHub and deploy

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/supervisor-workload-catalog.git
git push -u origin main

# Deploy to GitHub Pages (uses the gh-pages package)
npm run deploy
```

The `deploy` script runs `npm run build` then pushes `dist/` to the `gh-pages` branch.

### 5. Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select branch: `gh-pages`, folder: `/ (root)`
4. Click **Save**

Your site will be live at `https://<your-username>.github.io/supervisor-workload-catalog/` within ~60 seconds.

---

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

---

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- Zero external UI dependencies — all styling is inline CSS
- [gh-pages](https://github.com/tschaub/gh-pages) for deployment
