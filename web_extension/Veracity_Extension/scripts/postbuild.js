/**
 * postbuild.js — Extension dist builder
 *
 * Run after `npm run export`. Produces web_extension/Veracity_Extension/dist/ from
 * Next.js output: rewrites _next → next for Chrome, injects CSP and panel loader
 * into HTML, copies public assets and inlines auth + panel UI into panel.js.
 * Panel lifecycle: DOMContentLoaded → loadConfig → syncAuthUI (auth gate) →
 * renderAppScreen (AI fact verification only) or landing; the verify flow talks
 * to the backend via background script messaging.
 */
(function () {
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const out = path.join(root, "out");
const dist = path.join(root, "dist");

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}

// --- Path and CSP helpers (Chrome disallows _next in paths) ---
const rewritePaths = (content) =>
  content
    .replace(/\/_next\//g, "/next/")
    .replace(/\.\/_next\//g, "./next/")
    .replace(/"\/_next\//g, '"/next/')
    .replace(/'\/_next\//g, "'/next/")
    .replace(/"\/next\//g, '"./next/')
    .replace(/'\/next\//g, "'./next/")
    .replace(/_next\//g, "next/");

const upsertCspMeta = (content, cspString) => {
  const cspTag = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;
  if (content.includes("Content-Security-Policy")) {
    return content.replace(
      /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i,
      cspTag
    );
  }
  const viewport =
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>';
  if (content.includes(viewport)) {
    return content.replace(viewport, `${viewport}${cspTag}`);
  }
  if (content.includes("<head>")) {
    return content.replace("<head>", `<head>${cspTag}`);
  }
  return `${cspTag}${content}`;
};

const simpleCsp =
  "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' https://www.veri-fact.ai https://api.veri-fact.ai https://veri-fact.ca.auth0.com;";

const copyRecursive = (src, dest) => {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((entry) => {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
};

// --- Assemble dist: use existing out/ or synthesize from .next/server/pages ---
if (!fs.existsSync(out)) {
  const pagesDir = path.join(root, ".next", "server", "pages");
  const staticDir = path.join(root, ".next", "static");
  if (!fs.existsSync(pagesDir)) {
    throw new Error("expected out/ after build");
  }
  fs.mkdirSync(out, { recursive: true });
  copyRecursive(path.join(pagesDir, "index.html"), path.join(out, "index.html"));
  copyRecursive(path.join(pagesDir, "404.html"), path.join(out, "404.html"));
  copyRecursive(staticDir, path.join(out, "_next", "static"));
  const publicDir = path.join(root, "public");
  copyRecursive(path.join(publicDir, "manifest.json"), path.join(out, "manifest.json"));
  copyRecursive(path.join(publicDir, "background.js"), path.join(out, "background.js"));
  copyRecursive(path.join(publicDir, "content.js"), path.join(out, "content.js"));
  copyRecursive(path.join(publicDir, "icons"), path.join(out, "icons"));
  copyRecursive(path.join(publicDir, "config.json"), path.join(out, "config.json"));
  copyRecursive(path.join(publicDir, "sources.json"), path.join(out, "sources.json"));
}

// Rename out -> dist
fs.renameSync(out, dist);

// Copy webapp hero stylesheet into dist for the landing hero
const heroCssSrc = path.join(root, "styles", "webapp-hero.css");
const heroCssDest = path.join(dist, "webapp-hero.css");
if (fs.existsSync(heroCssSrc)) {
  fs.copyFileSync(heroCssSrc, heroCssDest);
}

// Copy source-preference catalog into dist (read at runtime by the picker)
const sourcesJsonSrc = path.join(root, "public", "sources.json");
const sourcesJsonDest = path.join(dist, "sources.json");
if (fs.existsSync(sourcesJsonSrc)) {
  fs.copyFileSync(sourcesJsonSrc, sourcesJsonDest);
}

// Copy panel stylesheet into dist (plain CSS for panel.js UI)
const panelCssSrc = path.join(root, "public", "panel.css");
const panelCssDest = path.join(dist, "panel.css");
if (fs.existsSync(panelCssSrc)) {
  fs.copyFileSync(panelCssSrc, panelCssDest);
}

// Rename _next -> next inside dist
const legacyNext = path.join(dist, "_next");
const renamedNext = path.join(dist, "next");
if (fs.existsSync(legacyNext)) {
  if (fs.existsSync(renamedNext)) {
    fs.rmSync(renamedNext, { recursive: true, force: true });
  }
  fs.renameSync(legacyNext, renamedNext);
}

const targets = [
  path.join(dist, "index.html"),
  path.join(dist, "404.html"),
  path.join(dist, "index.txt"),
  path.join(dist, "manifest.json"),
];

// --- Rewrite HTML: replace body with root + panel.js, inject styles and CSP ---
targets.forEach((file) => {
  if (!fs.existsSync(file)) return;
  const data = fs.readFileSync(file, "utf8");
  let updated = rewritePaths(data);
  if (file.endsWith(".html")) {
    updated = updated.replace(/<script[\s\S]*?<\/script>/g, "");
    updated = updated.replace(
      /<body[^>]*>[\s\S]*<\/body>/i,
      '<body><div id="root"></div><script src="./panel.js" defer></script></body>'
    );
    updated = updated.replace(
      "<head>",
      '<head><link rel="stylesheet" href="./panel.css"><link rel="stylesheet" href="./webapp-hero.css">'
    );
    updated = upsertCspMeta(
      updated,
      `default-src 'self'; ${simpleCsp} style-src 'self' 'unsafe-inline'; base-uri 'self';`
    );
  }
  fs.writeFileSync(file, updated);
});

// --- Manifest: CSP and host_permissions from public/manifest.json ---
const manifestPath = path.join(dist, "manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const publicManifestPath = path.join(root, "public", "manifest.json");
  const publicManifest = fs.existsSync(publicManifestPath)
    ? JSON.parse(fs.readFileSync(publicManifestPath, "utf8"))
    : null;
  manifest.content_security_policy = manifest.content_security_policy || {};
  manifest.content_security_policy.extension_pages =
    publicManifest?.content_security_policy?.extension_pages || simpleCsp;
  if (publicManifest?.host_permissions) {
    manifest.host_permissions = publicManifest.host_permissions;
  }
  if (manifest.web_accessible_resources) {
    manifest.web_accessible_resources = manifest.web_accessible_resources.map((entry) => {
      if (entry.resources) {
        entry.resources = entry.resources.map((res) =>
          res.replace(/^_next\//, "next/").replace(/\/_next\//g, "/next/")
        );
      }
      return entry;
    });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// --- Auth module inlined into panel.js (PKCE + JWKS); no separate script tag ---
const authJsPath = path.join(root, "src", "lib", "auth.js");
const authJs = fs.existsSync(authJsPath) ? fs.readFileSync(authJsPath, "utf8") : "";

/**
 * Panel script template. Injected into dist/panel.js after auth.
 * Flow: load config → syncAuthUI (if authenticated render the verification panel, else landing) →
 * verify claim via background VERIFY_CLAIM → render score, summary and sources.
 */
const panelJs = `document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  try {
  let API_URL = '';
  let AUTH0_CLIENT_ID = '';
  let authError = null;
  let currentSourceIndex = 0;
  let isVerifying = false;
  let lastClaimText = '';
  let lastVerifiedClaim = '';
  let lastFactCheck = null;
  let lastAnalysisResult = null;
  let sourceCatalog = [];
  let minPreferredSources = 5;
  let preferredDomains = [];
  let activeView = 'verify';
  let domainCredibility = {};
  const normalizeError = (err) => {
    if (!err) return 'Something went wrong. Please try again.';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || 'Something went wrong. Please try again.';
    if (typeof err === 'object') {
      try {
        return (
          err.error_description ||
          err.message ||
          JSON.stringify(err)
        );
      } catch {
        return 'Something went wrong. Please try again.';
      }
    }
    return 'Something went wrong. Please try again.';
  };

  const setInlineMessage = (msg) => {
    const inline = document.getElementById('authErrorDisplay') || root?.querySelector('#authStatusText');
    if (inline) inline.textContent = msg || '';
  };

  const setAuthStatus = (msg) => {
    const statusEl = root?.querySelector('#authStatusText') || document.getElementById('authStatusText');
    if (statusEl) statusEl.textContent = msg || '';
  };

  /** Show Verifying pill when active === true; remove from DOM when active === false. */
  const toggleVerifyingUI = (active) => {
    if (active) {
      const container = root?.querySelector('#verifyingStatusContainer');
      if (!container || container.querySelector('#statusChip')) return;
      const pill = document.createElement('span');
      pill.id = 'statusChip';
      pill.className = 'statusChip status--verifying';
      pill.setAttribute('aria-live', 'polite');
      pill.innerHTML = '<span class="statusChip-icon" aria-hidden="true"></span><span class="statusChip-text">Verifying</span>';
      container.appendChild(pill);
    } else {
      const chip = root?.querySelector('#statusChip');
      if (chip) chip.remove();
    }
  };

  /** Single source of truth: set isVerifying and show/remove Verifying pill. */
  const setVerifying = (active) => {
    isVerifying = !!active;
    toggleVerifyingUI(active);
    updateVerifyButtonState();
  };

  const updateVerifyButtonState = () => {
    const claimInput = root?.querySelector('#claimInput');
    const verifyBtn = root?.querySelector('#verifyBtn');
    if (!verifyBtn) return;
    const trimmed = (claimInput?.value || '').trim();
    verifyBtn.disabled = isVerifying || trimmed.length === 0 || trimmed === lastVerifiedClaim;
  };

  const escapeHtml = (value) => {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let currentUserId = null;
  const parseJwtSub = (token) => {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub != null ? String(payload.sub) : null;
    } catch (_) {
      return null;
    }
  };

  /**
   * Source preferences.
   *
   * The catalog (set S) ships as public/sources.json; the user's selection (subset P)
   * lives in chrome.storage.local so it survives the panel being closed. P is sent to
   * the backend with every claim and, independently, is used to order and mark the
   * evidence shown in the result.
   */
  const SOURCE_PREFS_KEY = 'veracity_preferred_domains';

  const loadSourceCatalog = async () => {
    try {
      const res = await fetch(chrome.runtime.getURL('sources.json'));
      const data = await res.json();
      sourceCatalog = Array.isArray(data && data.categories) ? data.categories : [];
      if (Number.isFinite(data && data.minSelected)) minPreferredSources = data.minSelected;
    } catch (_) {
      sourceCatalog = [];
    }
  };

  const loadPreferredDomains = () => new Promise((resolve) => {
    try {
      chrome.storage.local.get([SOURCE_PREFS_KEY], (res) => {
        const stored = res && res[SOURCE_PREFS_KEY];
        resolve(Array.isArray(stored) ? stored : []);
      });
    } catch (_) {
      resolve([]);
    }
  });

  const savePreferredDomains = (domains) => new Promise((resolve) => {
    const payload = {};
    payload[SOURCE_PREFS_KEY] = domains;
    try {
      chrome.storage.local.set(payload, () => resolve());
    } catch (_) {
      resolve();
    }
  });

  const DOMAIN_CRED_KEY = 'veracity_domain_credibility';

  /** Seed the credibility map from sources.json so something shows before lookups land. */
  const seedDomainCredibility = () => {
    sourceCatalog.forEach((cat) => {
      ((cat && cat.domains) || []).forEach((d) => {
        if (d && d.domain && Number.isFinite(d.credibility) && !(d.domain in domainCredibility)) {
          domainCredibility[d.domain] = d.credibility;
        }
      });
    });
  };

  const loadCachedCredibility = () => new Promise((resolve) => {
    try {
      chrome.storage.local.get([DOMAIN_CRED_KEY], (res) => {
        const stored = res && res[DOMAIN_CRED_KEY];
        resolve(stored && typeof stored === 'object' ? stored : {});
      });
    } catch (_) {
      resolve({});
    }
  });

  const cacheCredibility = () => {
    const payload = {};
    payload[DOMAIN_CRED_KEY] = domainCredibility;
    try {
      chrome.storage.local.set(payload, () => {});
    } catch (_) {}
  };

  /**
   * Fetch DQR credibility for every catalog domain we do not have a live value for.
   * Failures are recorded as null ("Not rated") so we do not re-request them each time.
   */
  const refreshDomainCredibility = async (onUpdate) => {
    if (!API_URL || sourceCatalog.length === 0) return;
    let token = null;
    try {
      token = await ensureAccessToken();
    } catch (_) {
      return;
    }
    if (!token) return;
    const domains = [];
    sourceCatalog.forEach((cat) => {
      ((cat && cat.domains) || []).forEach((d) => {
        if (d && d.domain && !(d.domain in domainCredibility)) domains.push(d.domain);
      });
    });
    if (domains.length === 0) return;
    await Promise.all(domains.map(async (name) => {
      try {
        const res = await sendBackgroundMessage({
          type: 'GET_DOMAIN', apiUrl: API_URL, accessToken: token, domainName: name,
        });
        const score = res && res.success && res.domain ? res.domain.credibility_score : null;
        domainCredibility[name] = Number.isFinite(score) ? score : null;
      } catch (_) {
        domainCredibility[name] = null;
      }
    }));
    cacheCredibility();
    if (typeof onUpdate === 'function') onUpdate();
  };

  const credibilityLabel = (domain) => {
    const v = domainCredibility[domain];
    if (v === undefined) return { text: '\u2026', cls: 'isPending' };
    if (v === null || !Number.isFinite(v)) return { text: 'Not rated', cls: 'isUnrated' };
    const pct = Math.round(v * 100);
    const cls = pct >= 80 ? 'isHigh' : (pct >= 60 ? 'isMedium' : 'isLow');
    return { text: pct + '%', cls: cls };
  };

  const catalogDomainCount = () => sourceCatalog.reduce((n, c) => n + ((c && c.domains) || []).length, 0);

  /** Host for a source, preferring the backend's domain record over parsing the URL. */
  const hostFromSource = (source) => {
    const direct = (source && source.domain && source.domain.domain_name) || (source && source.domain_name);
    if (direct) return String(direct).toLowerCase().replace(/^www\./, '');
    const raw = (source && (source.url || source.link)) || '';
    try {
      return new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
    } catch (_) {
      return '';
    }
  };

  const isPreferredSource = (source) => {
    const host = hostFromSource(source);
    if (!host || preferredDomains.length === 0) return false;
    return preferredDomains.some((d) => {
      const dd = String(d).toLowerCase();
      return host === dd || host.endsWith('.' + dd);
    });
  };

  /**
   * Stable partition: sources from the user's chosen domains first, original order
   * preserved within each group. Display-order only — this does not change which
   * evidence the model read, or the veracity score.
   */
  const prioritizeSources = (sources) => {
    if (!Array.isArray(sources) || preferredDomains.length === 0) return sources || [];
    const preferred = [];
    const rest = [];
    sources.forEach((s) => { (isPreferredSource(s) ? preferred : rest).push(s); });
    return preferred.concat(rest);
  };

  const getCredibilityPercent = (source, index, mode) => {
    if (mode === 'test') {
      const mockValues = [93, 88, 79, 91, 85];
      return mockValues[index] ?? 93;
    }
    const raw =
      source?.credibility ??
      source?.credibility_score ??
      source?.reliability ??
      source?.score;
    if (raw === null || raw === undefined) return null;
    const parsed = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
    if (!Number.isFinite(parsed)) return null;
    const normalized = parsed >= 0 && parsed <= 1 ? parsed * 100 : parsed;
    return Math.round(Math.max(0, Math.min(100, normalized)));
  };

  const extractSources = (result) => {
    const candidates = [
      result?.sources,
      result?.citations,
      result?.references,
      result?.source_list,
      result?.data?.sources,
      result?.analysis?.sources,
    ];
    const match = candidates.find((item) => Array.isArray(item));
    return match || [];
  };

  const renderSources = (sources, mode, activeIndex) => {
    if (!Array.isArray(sources) || sources.length === 0) return '';
    const safeIndex = Math.max(0, Math.min(sources.length - 1, activeIndex || 0));
    const source = sources[safeIndex] || {};
    const credibility = getCredibilityPercent(source, safeIndex, mode);
    const title = source?.title || source?.name || ('Source ' + (safeIndex + 1));
    const snippet = source?.snippet || source?.summary || '';
    const url = source?.url || source?.link || '';
    const displayUrl = url && url.length > 35 ? url.substring(0, 35) + '...' : url;
    const credibilityHtml = credibility === null
      ? ''
      : '<div class="sourceCredibilityPill">Credibility: ' + credibility + '%</div>';
    const preferredHtml = isPreferredSource(source)
      ? '<div class="sourcePreferredPill" title="From a source you chose">Your source</div>'
      : '';
    const contentHtml =
      '<div class="sourceCard">' +
        preferredHtml +
        credibilityHtml +
        '<div class="sourceHeading">' + escapeHtml(title) + '</div>' +
        (snippet ? '<div class="sourcesDescription">' + escapeHtml(snippet) + '</div>' : '') +
        (displayUrl ? '<div class="sourceName">' + escapeHtml(displayUrl) + '</div>' : '') +
      '</div>';
    const wrappedCard = url
      ? '<a class="sourceCardLink" href="' + escapeHtml(url) + '" target="_blank" rel="noreferrer noopener">' + contentHtml + '</a>'
      : contentHtml;
    const showArrows = sources.length > 1;
    return (
      '<div class="sourcesCarousel">' +
        (showArrows
          ? '<button class="carouselNavButton carouselNavButtonLeft" data-direction="prev" type="button" aria-label="Previous source">' +
              '<svg class="carouselChevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
                '<path d="M12.5 4.5L7.5 10l5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />' +
              '</svg>' +
            '</button>'
          : '') +
        '<div class="sourceCardWrapper">' +
          '<div class="sourceTopText"><span class="sourceNumberBlock">Source ' + (safeIndex + 1) + '</span></div>' +
          wrappedCard +
        '</div>' +
        (showArrows
          ? '<button class="carouselNavButton carouselNavButtonRight" data-direction="next" type="button" aria-label="Next source">' +
              '<svg class="carouselChevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
                '<path d="M7.5 4.5L12.5 10l-5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />' +
              '</svg>' +
            '</button>'
          : '') +
      '</div>'
    );
  };

  const renderSourcesInto = (mount, sources, mode) => {
    if (!mount) return;
    if (!Array.isArray(sources) || sources.length === 0) {
      mount.innerHTML = '';
      return;
    }
    const update = () => {
      mount.innerHTML = renderSources(sources, mode, currentSourceIndex);
      const prevBtn = mount.querySelector('[data-direction="prev"]');
      const nextBtn = mount.querySelector('[data-direction="next"]');
      prevBtn?.addEventListener('click', () => {
        currentSourceIndex = (currentSourceIndex - 1 + sources.length) % sources.length;
        update();
      });
      nextBtn?.addEventListener('click', () => {
        currentSourceIndex = (currentSourceIndex + 1) % sources.length;
        update();
      });
    };
    update();
  };

  const setScore = (score, { summary, headline, subhead, result, claim_id, analysis_id } = {}) => {
    const mount = root?.querySelector('#resultMount');
    if (!mount) return;

    if (!Number.isFinite(score)) {
      lastFactCheck = null;
      mount.innerHTML = '';
      return;
    }

    const sources = prioritizeSources(extractSources(result));
    currentSourceIndex = 0;
    const clamped = Math.max(0, Math.min(100, parseFloat(score)));
    const deg = clamped * 3.6;
    lastFactCheck = {
      claim: lastClaimText,
      score: Number(score),
      headline,
      subhead,
      summary,
      sources,
      result,
      claim_id,
      analysis_id,
    };
    const bucket =
      clamped >= 85
        ? { h: 'The claim is highly reliable,', s: 'you can share with your network.' }
        : clamped >= 60
        ? { h: 'The claim is fairly reliable,', s: 'consider sharing with light caution.' }
        : clamped >= 40
        ? { h: 'The claim is uncertain,', s: 'seek additional verification.' }
        : { h: 'The claim is likely unreliable,', s: 'avoid sharing without verification.' };

    const cardHtml =
      '<div class="reliabilityCard" id="scoreBox">' +
        '<div class="reliabilityGrid">' +
          '<div class="reliabilityGauge">' +
            '<div class="reliabilityGaugeRing" style="--score-value:' + clamped + '; --score-deg:' + deg + 'deg;"></div>' +
            '<div class="reliabilityGaugeInner">' +
              '<div class="reliabilityGaugeLabel">Reliability</div>' +
              '<div class="reliabilityValue" id="scoreValue">' + clamped + '%</div>' +
            '</div>' +
          '</div>' +
          '<div class="reliabilityCopy">' +
            '<div class="reliabilityHeadline" id="scoreHeadline">' + (headline || bucket.h) + '</div>' +
            '<div class="reliabilitySubhead" id="scoreSubhead">' + (subhead || bucket.s) + '</div>' +
            (summary
              ? '<div class="reliabilitySummaryWrap">' +
                  '<div class="reliabilitySummary summaryCollapsed" id="scoreSummary">' + summary + '</div>' +
                  '<button type="button" class="summaryToggle" id="summaryToggle">Read more</button>' +
                '</div>'
              : '') +
          '</div>' +
        '</div>' +
      '</div>';

    mount.innerHTML = cardHtml + '<div id="sourcesMount"></div>';
    const summaryEl = mount.querySelector('#scoreSummary');
    const toggleBtn = mount.querySelector('#summaryToggle');
    if (summaryEl && toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const collapsed = summaryEl.classList.contains('summaryCollapsed');
        if (collapsed) {
          summaryEl.classList.remove('summaryCollapsed');
          toggleBtn.textContent = 'Read less';
        } else {
          summaryEl.classList.add('summaryCollapsed');
          toggleBtn.textContent = 'Read more';
        }
      });
    }
    const sourcesMount = mount.querySelector('#sourcesMount');
    if (sourcesMount && sources.length > 0) {
      renderSourcesInto(sourcesMount, sources, 'real');
    }
  };
  const finalizeVerification = () => {
    setVerifying(false);
    lastVerifiedClaim = lastClaimText;
  };


  const detectLanguage = () => {
    const lang = navigator.language || '';
    if (lang.toLowerCase().startsWith('fr')) return 'french';
    return 'english';
  };

  const ensureAccessToken = async () => {
    const token = await (typeof VeracityAuth !== 'undefined' ? VeracityAuth.getAccessToken() : Promise.resolve(null));
    if (token) {
      if (currentUserId == null && API_URL) {
        try {
          const res = await sendBackgroundMessage({ type: 'GET_ME', apiUrl: API_URL, accessToken: token });
          if (res && res.success && (res.id != null || (res.user && res.user.id != null))) {
            currentUserId = res.id ?? res.user?.id ?? null;
          }
        } catch (_) {}
      }
      if (currentUserId == null) {
        const sub = parseJwtSub(token);
        if (sub) currentUserId = sub;
      }
      return token;
    }
    return await (typeof VeracityAuth !== 'undefined' ? VeracityAuth.login() : Promise.reject(new Error('Auth not loaded')));
  };

  const sendBackgroundMessage = (msg) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (response) => {
        if (chrome.runtime.lastError) resolve({ success: false, error: chrome.runtime.lastError.message });
        else resolve(response || { success: false });
      });
    });
  };

  /**
   * Single public verification entry point for all flows.
   *
   * Callers:
   * - Verify button (no argument → read from textarea)
   * - Context menu “Send to Veracity” (passes selected text)
   *
   * Responsibilities:
   * - Guard against concurrent runs via isVerifying
   * - Normalize + persist claim text and reset result UI
   * - Enforce auth and API configuration
   * - Delegate to background.js VERIFY_CLAIM and map the response into score card UI
   * - Always end via finalizeVerification() so button + status reset correctly
   */
  const startVerification = async (claimTextOverride) => {
    // Ignore if a verification is already in progress.
    if (isVerifying) return;

    // Begin verification lifecycle: show Verifying pill and disable Verify button.
    setVerifying(true);

    const mount = root?.querySelector('#resultMount');
    const claimInput = root?.querySelector('#claimInput');
    const authStatusText = root?.querySelector('#authStatusText');

    // Normalize claim text: prefer explicit argument, otherwise read from textarea.
    let claimText = (typeof claimTextOverride === 'string'
      ? claimTextOverride
      : (claimInput?.value || '')
    ).trim();

    // Keep textarea in sync so UI looks identical for all entry points.
    if (claimInput) claimInput.value = claimText;

    lastClaimText = claimText;
    lastAnalysisResult = null;
    if (mount) mount.innerHTML = '';
    currentSourceIndex = 0;
    lastFactCheck = null;
    setScore(null);

    // Core verification flow. All completion paths must call finalizeVerification().
    if (!claimText) {
      if (authStatusText) authStatusText.textContent = 'Please enter a claim.';
      finalizeVerification();
      return;
    }

    const authed = typeof VeracityAuth !== 'undefined' && await VeracityAuth.isAuthenticated();
    if (!authed) {
      if (authStatusText) authStatusText.textContent = 'Please sign in to verify claims.';
      finalizeVerification();
      return;
    }

    if (authStatusText) authStatusText.textContent = '';

    const apiConfigured = API_URL && API_URL.indexOf('YOUR_API') === -1;
    if (!apiConfigured) {
      requestAnimationFrame(() => {
        setScore(85, {
          summary: 'Placeholder result for development. Configure API_URL for live verification.',
          headline: 'The claim is fairly reliable,',
          subhead: 'consider sharing with light caution.',
          result: {
            sources: [
              { title: 'Source 1', snippet: 'Placeholder for development.', credibility_score: 0.88 },
              { title: 'Source 2', snippet: 'Placeholder for development.', credibility_score: 0.79 },
            ],
          },
        });
        finalizeVerification();
      });
      return;
    }

    let token;
    try {
      token = await ensureAccessToken();
    } catch (err) {
      const msg = 'Something went wrong. Please try again.';
      setInlineMessage(msg);
      if (authStatusText) authStatusText.textContent = msg;
      finalizeVerification();
      return;
    }

    if (!token) {
      const msg = 'Please sign in to verify claims.';
      if (authStatusText) authStatusText.textContent = msg;
      setInlineMessage(msg);
      finalizeVerification();
      return;
    }

    chrome.runtime.sendMessage(
      { type: 'VERIFY_CLAIM', claimText, accessToken: token, apiUrl: API_URL, preferredDomains },
      (response) => {
        if (chrome.runtime.lastError) {
          const msg = 'Something went wrong. Please try again.';
          setInlineMessage(msg);
          if (authStatusText) authStatusText.textContent = msg;
          finalizeVerification();
          return;
        }
        if (!response || response.success !== true) {
          const msg = 'Something went wrong. Please try again.';
          setInlineMessage(msg);
          if (authStatusText) authStatusText.textContent = msg;
          finalizeVerification();
          return;
        }
        const score = Math.round((response.veracity_score || 0) * 100);
        const summary = response.analysis_text || '';
        const result = { sources: Array.isArray(response.sources) ? response.sources : [] };
        const claim_id = response.claim_id ?? null;
        const analysis_id = response.analysis_id ?? null;
        setScore(score, { summary, result, claim_id, analysis_id });
        lastAnalysisResult = { claim: claimText, score, summary, result, claim_id, analysis_id };
        finalizeVerification();
      }
    );
  };

  const startWebAuthFlow = async () => {
    const statusEl = document.getElementById('authErrorDisplay');
    if (!AUTH0_CLIENT_ID) {
      const msg = 'Missing AUTH0_CLIENT_ID in config.json';
      authError = msg;
      if (statusEl) statusEl.textContent = msg;
      setAuthStatus(msg);
      await syncAuthUI();
      throw new Error(msg);
    }
    if (statusEl) statusEl.textContent = 'Opening sign-in…';
    try {
      const token = await (typeof VeracityAuth !== 'undefined' ? VeracityAuth.login() : Promise.reject(new Error('Auth not loaded')));
      if (statusEl) statusEl.textContent = '';
      await syncAuthUI();
      return token;
    } catch (err) {
      const fromAuth = err && (err.isCredentialError === true || (typeof err.message === 'string' && /access_denied|invalid_grant|wrong.*password|invalid credentials|username or password/i.test(err.message)));
      if (fromAuth) {
        authError = null;
        if (statusEl) statusEl.textContent = '';
        setAuthStatus('');
        setInlineMessage('');
      } else {
        authError = 'Something went wrong. Please try again.';
        if (statusEl) statusEl.textContent = authError;
        setAuthStatus(authError);
        setInlineMessage(authError);
      }
      if (typeof VeracityAuth !== 'undefined' && VeracityAuth.clearStoredTokens) {
        await VeracityAuth.clearStoredTokens();
      }
      await syncAuthUI();
      throw err;
    }
  };

  async function syncAuthUI() {
    if (!root) return;
    try {
      if (typeof VeracityAuth !== 'undefined' && VeracityAuth.isLoginInProgress && VeracityAuth.isLoginInProgress()) {
        renderLandingHero();
        return;
      }
      const ok = typeof VeracityAuth !== 'undefined' && await VeracityAuth.isAuthenticated();
      if (ok) {
        authError = null;
        await renderAppScreen();
      } else {
        renderLandingHero();
      }
    } catch {
      renderLandingHero();
    }
  }


  const renderLandingHero = () => {
    if (!root) return;
    root.innerHTML = '';
    root.innerHTML = \`
      <div class="Home_panel__UGulu">
        <div class="Home_authHero__qmmJW">
          <div class="textWrapper">
            <img src="./icons/icon128.png" alt="Veracity" width="80" height="80" />
            <h1 class="heading">Welcome to Veracity</h1>
            <h2 class="subheading">Navigate information with clarity and confidence guided by<span class="fancyText"> a conversational assistant.</span></h2>
            <p class="description">Sign up or log in to verify information and build trust with those you share it with.</p>
            <div id="authErrorDisplay" class="errorText" role="alert" style="margin-top:8px;min-height:1.2em;"></div>
            <button id="goToLoginBtn" class="loginButton" type="button">Log in</button>
            <p class="privacyLine">We strictly limit data collection to only what is essential for functionality—nothing more.</p>
            <p class="heroLinkLine">Need a larger scale? <a href="https://www.veri-fact.ai/" target="_blank" rel="noreferrer noopener">Visit Veracity Web Application</a></p>
          </div>
        </div>
      </div>
    \`;

    const authErrorEl = root.querySelector('#authErrorDisplay');
    if (authErrorEl) authErrorEl.textContent = authError || '';

    const goToLoginBtn = root.querySelector('#goToLoginBtn');
    goToLoginBtn?.addEventListener('click', async () => {
      authError = null;
      try {
        await startWebAuthFlow();
      } catch {}
    });
  };

  /** One-line reminder of the active selection, with a way into the picker. */
  const renderSourcePrefsSummary = (panelEl) => {
    const el = panelEl && panelEl.querySelector('#sourcePrefsSummary');
    if (!el) return;
    const n = preferredDomains.length;
    const text = n === 0
      ? 'No preferred sources chosen yet'
      : ('Prioritizing ' + n + ' of ' + catalogDomainCount() + ' sources');
    el.innerHTML =
      '<span class="sourcePrefsSummaryText">' + escapeHtml(text) + '</span>' +
      '<button id="sourcePrefsEditBtn" class="sourcePrefsEditBtn" type="button">' +
        (n === 0 ? 'Choose' : 'Edit') +
      '</button>';
    el.querySelector('#sourcePrefsEditBtn')?.addEventListener('click', () => {
      renderSourcesView(panelEl);
    });
  };

  const renderVerifyView = (panelEl) => {
    if (!panelEl) return;
    activeView = 'verify';
    panelEl.innerHTML =
      '<div id="aiTabPanel">' +
        '<textarea id="claimInput" class="Home_textarea__k243o" placeholder="What would you like to verify today?" rows="4"></textarea>' +
        '<div id="sourcePrefsSummary" class="sourcePrefsSummary"></div>' +
        '<div class="Home_buttonRow__Cnhie">' +
          '<button id="verifyBtn" class="Home_primaryBtn__nO8b8 verifyButton" type="button">Verify</button>' +
        '</div>' +
        '<div class="statusRow" id="verifyingStatusContainer"></div>' +
        '<div id="authStatusText" class="inlineInfo"></div>' +
        '<div id="resultMount"></div>' +
      '</div>';
    setVerifying(false);
    renderSourcePrefsSummary(panelEl);
    const verifyBtn = panelEl.querySelector('#verifyBtn');
    const claimInput = panelEl.querySelector('#claimInput');
    updateVerifyButtonState();
    claimInput?.addEventListener('input', updateVerifyButtonState);
    claimInput?.addEventListener('change', updateVerifyButtonState);
    verifyBtn?.addEventListener('click', async () => {
      await startVerification();
    });
    if (lastAnalysisResult) {
      lastClaimText = lastAnalysisResult.claim;
      lastVerifiedClaim = lastAnalysisResult.claim;
      if (claimInput) claimInput.value = lastAnalysisResult.claim;
      setScore(lastAnalysisResult.score, { summary: lastAnalysisResult.summary, result: lastAnalysisResult.result });
      updateVerifyButtonState();
    }
  };

  /**
   * Source picker: the catalog grouped by category, with a minimum-selection gate.
   * Credibility ratings are deliberately not shown — the study measures the
   * participant's own perception of source quality.
   */
  const renderSourcesView = (panelEl) => {
    if (!panelEl) return;
    activeView = 'sources';
    setVerifying(false);
    const draft = new Set(preferredDomains);

    const groupsHtml = sourceCatalog.map((cat, ci) => {
      const items = ((cat && cat.domains) || []).map((d, di) => {
        const id = 'srcOpt_' + ci + '_' + di;
        const checked = draft.has(d.domain) ? ' checked' : '';
        const cred = credibilityLabel(d.domain);
        return '' +
          '<label class="sourceOption" for="' + id + '">' +
            '<input type="checkbox" id="' + id + '" class="sourceOptionInput" value="' + escapeHtml(d.domain) + '"' + checked + ' />' +
            '<span class="sourceOptionText">' +
              '<span class="sourceOptionLabel">' + escapeHtml(d.label || d.domain) + '</span>' +
              '<span class="sourceOptionDomain">' + escapeHtml(d.domain) + '</span>' +
            '</span>' +
            '<span class="sourceOptionScore ' + cred.cls + '" data-domain="' + escapeHtml(d.domain) + '" ' +
              'title="Domain Quality Rating credibility score">' + escapeHtml(cred.text) + '</span>' +
          '</label>';
      }).join('');
      return '' +
        '<section class="sourceGroup">' +
          '<h3 class="sourceGroupTitle">' + escapeHtml(cat.name || 'Sources') + '</h3>' +
          '<div class="sourceGroupItems">' + items + '</div>' +
        '</section>';
    }).join('');

    const emptyHtml = '<p class="sourcePrefsIntro">Source list unavailable. Rebuild the extension so sources.json is present in dist/.</p>';

    panelEl.innerHTML =
      '<div class="sourcePrefs">' +
        '<div class="sourcePrefsHeader">' +
          '<button id="sourcePrefsBackBtn" class="sourcePrefsBackBtn" type="button">Back</button>' +
          '<h2 class="sourcePrefsTitle">Your trusted sources</h2>' +
        '</div>' +
        '<p class="sourcePrefsIntro">Pick the sources you personally consider high quality. Evidence from these is ' +
          'shown first and marked in your results. Choose at least ' + minPreferredSources + '.</p>' +
        '<p class="sourcePrefsLegend">Percentages are Domain Quality Ratings, an external credibility ' +
          'measure aggregated from media organisations and fact-checkers.</p>' +
        (sourceCatalog.length ? '<div class="sourcePrefsList">' + groupsHtml + '</div>' : emptyHtml) +
        '<div class="sourcePrefsFooter">' +
          '<span id="sourcePrefsCount" class="sourcePrefsCount"></span>' +
          '<button id="sourcePrefsSaveBtn" class="Home_primaryBtn__nO8b8 verifyButton" type="button">Save</button>' +
        '</div>' +
      '</div>';

    const countEl = panelEl.querySelector('#sourcePrefsCount');
    const saveBtn = panelEl.querySelector('#sourcePrefsSaveBtn');
    const refresh = () => {
      const n = draft.size;
      const enough = n >= minPreferredSources;
      if (countEl) {
        countEl.textContent = enough
          ? (n + ' selected')
          : (n + ' of ' + minPreferredSources + ' selected');
        countEl.classList.toggle('isIncomplete', !enough);
      }
      if (saveBtn) saveBtn.disabled = !enough;
    };

    panelEl.querySelectorAll('.sourceOptionInput').forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) draft.add(input.value);
        else draft.delete(input.value);
        refresh();
      });
    });
    refresh();

    /** Repaint the score pills in place once live credibility values arrive. */
    const paintScores = () => {
      panelEl.querySelectorAll('.sourceOptionScore').forEach((el) => {
        const cred = credibilityLabel(el.getAttribute('data-domain'));
        el.textContent = cred.text;
        el.className = 'sourceOptionScore ' + cred.cls;
      });
    };
    refreshDomainCredibility(() => {
      if (activeView === 'sources') paintScores();
    });

    panelEl.querySelector('#sourcePrefsBackBtn')?.addEventListener('click', () => {
      renderVerifyView(panelEl);
    });
    saveBtn?.addEventListener('click', async () => {
      preferredDomains = Array.from(draft);
      await savePreferredDomains(preferredDomains);
      renderVerifyView(panelEl);
    });
  };

  const renderAppScreen = async () => {
    if (!root) return;
    root.innerHTML = '';
    root.innerHTML = \`
      <div class="Home_panel__UGulu">
        <div class="Home_tabList__81_8M">
          <div class="Home_tabButton__yY1n3 Home_tabButtonActive__zVobV">
            <span class="Home_tabLabel__IC30v">AI Fact Verification</span>
          </div>
          <button id="sourcesNavBtn" class="sourcesNavBtn" type="button" title="Choose your trusted sources">Sources</button>
        </div>
        <div class="Home_card__E5spL" id="tabPanel"></div>
        <footer class="Home_footer__yFiaX">
          © ComplexData Lab · McGill · Mila
          <button id="logoutBtn" class="forgotLink logout-link" type="button" style="margin-left:8px;">Logout</button>
        </footer>
      </div>
    \`;

    const panelEl = root.querySelector('#tabPanel');
    renderVerifyView(panelEl);

    root.querySelector('#sourcesNavBtn')?.addEventListener('click', () => {
      if (activeView === 'sources') renderVerifyView(panelEl);
      else renderSourcesView(panelEl);
    });

    const logoutBtn = root.querySelector('#logoutBtn');
    logoutBtn?.addEventListener('click', async () => {
      authError = null;
      currentUserId = null;
      if (typeof VeracityAuth !== 'undefined') await VeracityAuth.logout();
      await syncAuthUI();
    });
  };

  /**
   * Handle SELECTION_TO_VERIFY from background.js.
   *
   * Payload comes from the context-menu click and includes raw selected text plus
   * page metadata. This helper:
   * - Ensures the user is authenticated
   * - Forces the AI tab to be active
   * - Prefills the claim textarea with the selected text
   * - Delegates to startVerification(text) so lifecycle matches a manual click
   */
  const handleSelectionToVerify = async (payload) => {
    const text = (payload?.text || '').trim();
    if (!text) return;
    const authed = typeof VeracityAuth !== 'undefined' && await VeracityAuth.isAuthenticated();
    if (!authed) {
      await syncAuthUI();
      return;
    }
    await syncAuthUI();
    if (activeView !== 'verify') {
      const panelEl = root?.querySelector('#tabPanel');
      if (panelEl) renderVerifyView(panelEl);
    }
    const claimInput = root?.querySelector('#claimInput');
    if (claimInput) claimInput.value = text;
    await startVerification(text);
  };

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'SELECTION_TO_VERIFY') {
      handleSelectionToVerify(msg);
    }
  });

  const loadConfig = async () => {
    const res = await fetch(chrome.runtime.getURL('config.json'));
    const cfg = await res.json();
    API_URL = cfg.API_URL || '';
    AUTH0_CLIENT_ID = cfg.AUTH0_CLIENT_ID || '';
    if (typeof VeracityAuth !== 'undefined') VeracityAuth.init({ clientId: AUTH0_CLIENT_ID });
    await loadSourceCatalog();
    preferredDomains = await loadPreferredDomains();
    domainCredibility = await loadCachedCredibility();
    seedDomainCredibility();
  };

  const init = async () => {
    if (!root) return;
    root.innerHTML = '<div class="Home_panel__UGulu"><div style="padding:10px;font-size:12px;color:#555;">Loading...</div></div>';
    try {
      await loadConfig();
      await syncAuthUI();
    } catch (err) {
      setInlineMessage(normalizeError(err));
      await syncAuthUI();
    }

    window.addEventListener('focus', () => { syncAuthUI(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncAuthUI();
      }
    });
  };

  init();
  } catch (err) {
    if (root) {
      const message = (err && err.message) ? err.message : String(err || 'Unknown error');
      const safe = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      root.innerHTML = '<div style="padding:12px;font-size:12px;color:#b91c1c;background:#fff;border:1px solid #fee2e2;border-radius:8px;">' +
        'Panel error: ' + safe +
      '</div>';
    }
  }
});`;

// Inline auth then panel; replace placeholders used in panel template (newline regexes for body text).
const panelJsFinal = (authJs ? authJs + "\n" : "") + panelJs
  .replace("__VERACITY_SNIPPET_REGEX__", "/[\\r\\n]+/g")
  .replace("__VERACITY_BODY_NEWLINE_REGEX__", "/\\n/g");

fs.writeFileSync(path.join(dist, "panel.js"), panelJsFinal, "utf8");

const panelContent = fs.readFileSync(path.join(dist, "panel.js"), "utf8");
// Guard against accidental regex breakage in template
if (panelContent.includes("replace(/+/g") || panelContent.includes("replace(///g")) {
  throw new Error("panel.js contains invalid replace regex; template placeholders may be broken.");
}
})();

