# Deploying PING to GitHub Pages

1. Create a GitHub repo (any name) and upload your whole project (see list below).
2. Repo -> Settings -> Pages -> Source: **GitHub Actions**.
3. Push to `main`. The workflow in Actions builds and deploys. URL: https://USERNAME.github.io/REPO/
4. Optional Supabase: Settings -> Secrets and variables -> Actions -> add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only, never the service key).

## Code rules so everything loads under /REPO/
- Router: `<BrowserRouter basename={import.meta.env.BASE_URL}>` (or use HashRouter).
- Assets in `public/`: reference as `${import.meta.env.BASE_URL}logo.svg`, not `/logo.svg`.
- Imported assets (`import logo from './logo.svg'`) work automatically.
- package.json must have `"build": "vite build"` and a committed `package-lock.json`.

## Upload to GitHub
src/, public/, index.html, package.json, package-lock.json, vite.config.ts,
tsconfig*.json, tailwind.config.*, postcss.config.*, .github/workflows/deploy.yml,
.gitignore, README.md, .env.example.
Do NOT upload: node_modules, dist, .env.
