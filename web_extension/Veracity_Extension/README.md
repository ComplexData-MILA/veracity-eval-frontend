# Veracity Side Panel Extension

Chrome side-panel extension for Veracity. This build is **fact verification only**:
paste or highlight a claim, get a reliability score, an explanation and sources.

> **Study build.** This branch (`veracity-extension-study-ver`) adds custom source selection
> for the source-preference user study. The plain product build, without the picker, is on
> `veracity-extension-factcheck-only`.

> **Note on the two extension folders in `web_extension/`:**
> `Veracity_Extension/` (this one) is the full side-panel app — build it with npm, load `dist/`.
> `VeracityExtension/` is a separate, much simpler popup that just redirects a query to the
> Veracity website. They are unrelated; this README covers only `Veracity_Extension/`.

## Two ways to verify a claim

1. **Type it** — open the side panel, paste a claim into the box, click **Verify**.
2. **Highlight it** — select text on any page, right-click → **Send to Veracity**. The side
   panel opens, prefills the selection and starts verifying automatically.

## Choosing your trusted sources

The **Sources** button in the panel header opens a picker of curated domains grouped by
category. Pick at least five you personally consider high quality; the selection is stored in
`chrome.storage.local` and persists across sessions. A summary line under the claim box
(`Prioritizing 5 of 30 sources · Edit`) is the second way in.

What the selection does today:

- Evidence from your chosen domains is **sorted to the top of the result and marked
  "Your source"**. This is display ordering only.
- The selection is **sent to the backend** as `preferred_domains` on `POST /v1/claims/`.

What it does **not** do yet: change which search results the model reads, or the veracity
score. That is a re-ranking step in the backend RAG pipeline (take 30 search results, send the
5 highest-ranked from the user's domains, topped up with the best remaining results). The
claims schema does not accept `preferred_domains` yet, so `background.js` retries the request
without the field on a 400/422 — the extension keeps working against a backend that has no
source prioritisation, and starts driving it the moment one ships.

Each domain shows its **Domain Quality Rating** credibility score. Values are fetched from
`GET /v1/domains/lookup/{domain}` through the background script on first open, cached in
`chrome.storage.local`, and shown as a percentage; a domain with no rating (or a failed
lookup) reads *Not rated*, which is itself meaningful — a share of the domains Veracity cites
are absent from DQR. `public/sources.json` carries seed values for the domains published in
Kelly's Table 1 so something sensible renders before the lookups return.

Note for study design: participants see the expert rating alongside the instruction to pick
what *they* consider high quality, so their selections are informed by DQR rather than
independent of it. Worth recording as a deliberate design choice when writing up.

### Editing the source set

`public/sources.json` holds the catalog, the minimum selection count, and optional DQR seed
values. Add or remove categories and domains there and rebuild — no code changes needed.



## Project structure 

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
│   ├── sources.json          # Source picker catalog (categories, domains, minimum)
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

---

## Reloading after a code change

The extension is built, not live-reloaded. After editing anything under `public/`,
`scripts/` or `pages/`:

```bash
npm run build
```

then go to `chrome://extensions/` and click the **reload** (↻) icon on the Veracity card.
Close and reopen the side panel to pick up the new `panel.js`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Load unpacked" is greyed out | Turn on **Developer mode** (top-right of `chrome://extensions/`). |
| Chrome rejects the folder | You selected `Veracity_Extension/`, not `Veracity_Extension/dist/`. Pick the folder that directly contains `manifest.json`. |
| Panel is blank or shows "Panel error:" | Open the side panel, right-click inside it → **Inspect**, and read the console. |
| Right-click has no "Send to Veracity" | You must have text selected, and the page must have been loaded *after* the extension. Reload the page. |
| Verifying never finishes | Check `API_URL` in `dist/config.json` and the service-worker console (`chrome://extensions/` → **service worker** link on the Veracity card). |
| Login loops back to the landing screen | Confirm `AUTH0_CLIENT_ID` in `config.json`, and that the extension's redirect URL is registered in Auth0. |

## Scope of this build

The side panel intentionally ships a single view, **AI Fact Verification**. The earlier
*Discussion Hub* and *Contact an Expert* tabs, and the "Create discussion" action on a
result, have been removed, along with the discussion/post/vote API routing in
`background.js`. The extension now calls only `/v1/claims/`, `/v1/analysis/*`,
`/v1/sources/*` and `/v1/users/me`.
