# Veracity Side Panel Extension

Chrome side-panel extension for Veracity. This build is **fact verification only**:
paste or highlight a claim, get a reliability score, an explanation and sources.

> **Note on the two extension folders in `web_extension/`:**
> `Veracity_Extension/` (this one) is the full side-panel app — build it with npm, load `dist/`.
> `VeracityExtension/` is a separate, much simpler popup that just redirects a query to the
> Veracity website. They are unrelated; this README covers only `Veracity_Extension/`.

## Verifying text

1. **Type it** — open the side panel, paste a claim into the box, click **Verify**.
2. **Highlight it** — select text on any page, right-click → **Send to Veracity**. The side
   panel opens, prefills the selection and starts verifying automatically.

## Verifying an image

Switch the input to **Image**, then drop a file on the panel or click to choose one. JPEG,
PNG, WebP and GIF are accepted. The result gives a reliability score, a verdict and an
explanation. When a file is judged uncertain or fake, the most likely generator is shown too;
that ranking is conditional on the media being fake, so it is hidden on a file judged real,
where the top entry is noise.

The image is posted as `multipart/form-data` to `POST /v1/media/verify` **directly from the
panel**, not through the background service worker — `chrome.runtime` messaging cannot carry
a `File`, and the multipart body has to be built where the file lives. `api.veri-fact.ai` is
already in the manifest's `connect-src` and `host_permissions`, so no manifest change is
needed. Nothing is uploaded until Verify is pressed, and the file is never stored locally.

The backend endpoint also accepts video; the picker is restricted to images. Widen the
`accept` attribute and the type check in `acceptMediaFile` if you want video too.

## Choosing your sources

The **Sources** button opens a pop-up listing candidate domains grouped by subject area.
Choose as many or as few as you like — **there is no minimum**, and choosing none means no
preference, leaving retrieval untouched. The selection persists in `chrome.storage.local`,
and the button carries a count badge. Close with **Done**, the ✕, Escape, or by clicking the
backdrop; **Clear all** resets to no preference.

The selection does two things:

- Evidence from your chosen domains is **sorted to the top of the result and marked
  "Your source"**.
- The selection is **sent to the backend** as `preferred_domains` on `POST /v1/claims/`, so
  retrieval can prioritise those domains.

The claims schema does not accept `preferred_domains` yet, so `background.js` retries without
the field on a 400/422. Until the backend honours it, the choice affects the ordering and
labelling of displayed evidence, not the veracity score.

No credibility ratings are shown against domains — this build presents the source list as a
plain choice. The catalog includes Veracity's ten most-cited domains, four of which are social
platforms; they are grouped under **Social & community** so the choice is informed.

### Editing the source set

`public/sources.json` holds the catalog. Add or remove categories and domains there and
rebuild — no code changes needed.



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
│   ├── sources.json          # Source picker catalog (subject-area groups, domains)
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
