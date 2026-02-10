# Veracity Side Panel Extension 


## Project structure (source only)

```
Veracity_Extension/
├── package.json              # Scripts, dependencies (next, react, typescript)
├── package-lock.json         # Locked dependency versions
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config (output: export)
├── next-env.d.ts             # Next type references (do not edit)
│
├── pages/                    # Next.js pages (static shell for panel)
│   ├── _app.tsx              # App wrapper, global CSS
│   └── index.tsx             # Home shell; panel.js replaces body at runtime
│
├── public/                   # Static extension assets (copied to dist/)
│   ├── manifest.json         # Chrome extension manifest (MV3)
│   ├── background.js         # Service worker: context menu, VERIFY_CLAIM, API routing
│   ├── content.js            # Injected script: selection → REQUEST_SELECTION
│   ├── panel.css             # Panel UI styles (verify button, results, discussion)
│   ├── config.json           # API_URL, AUTH0_CLIENT_ID (runtime config)
│   └── icons/
│       └── icon128.png
│
├── scripts/
│   └── postbuild.js          # Build script: Next output + public → dist/, inlines auth + panel UI into panel.js
│
├── src/
│   └── lib/
│       ├── auth.js           # Browser auth (PKCE, JWKS); inlined into panel.js by postbuild
│       ├── auth.ts            # Auth type definitions
│       └── auth0.ts           # Node-only auth helpers (not used in extension runtime)
│
├── styles/                   # CSS for Next pages and landing hero
│   ├── globals.css            # Resets, design tokens (used by _app.tsx)
│   ├── Home.module.css        # index.tsx component styles
│   ├── webapp-hero.css        # Landing hero; copied to dist/ and linked by panel HTML
│   └── LoginForm.module.css   # Unused login form styles
│
└── README.md
```

---

## Build and load in Chrome

### 1. Install dependencies

```bash
cd web_extension/Veracity_Extension
npm install
```

### 2. Build the extension (creates `dist/`)

```bash
npm run build
```

This runs `next build` then `node scripts/postbuild.js`. The **`dist/`** folder is the complete, loadable Chrome extension (manifest, background.js, content.js, panel.js, panel.css, config, icons, HTML).


### 3. Load unpacked in Chrome

1. Open **Chrome** and go to **`chrome://extensions/`**.
2. Turn on **Developer mode** (toggle in the top-right).
3. Click **Load unpacked**.
4. Select the **`dist`** folder inside `Veracity_Extension` (the folder that contains `manifest.json`, `panel.js`, `background.js`, etc.).
5. The Veracity extension should appear in the list. Use the extensions puzzle icon or the side panel to open it.

---

## Config

Edit **`public/config.json`** (or **`dist/config.json`** after a build) to set:

- **`API_URL`** — backend API base URL for verification and discussions.
- **`AUTH0_CLIENT_ID`** — Auth0 client ID for sign‑in.

Rebuild after changing `public/config.json` so `dist/config.json` is updated.
