/**
 * postbuild.js — Extension dist builder
 *
 * Run after `npm run export`. Produces web_extension/Veracity_Extension/dist/ from
 * Next.js output: rewrites _next → next for Chrome, injects CSP and panel loader
 * into HTML, copies public assets and inlines auth + panel UI into panel.js.
 * Panel lifecycle: DOMContentLoaded → loadConfig → syncAuthUI (auth gate) →
 * renderAppScreen (tabs: AI / Discussion / Expert) or landing; verify flow and
 * discussion hub talk to backend via background script messaging.
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
}

// Rename out -> dist
fs.renameSync(out, dist);

// Copy webapp hero stylesheet into dist for the landing hero
const heroCssSrc = path.join(root, "styles", "webapp-hero.css");
const heroCssDest = path.join(dist, "webapp-hero.css");
if (fs.existsSync(heroCssSrc)) {
  fs.copyFileSync(heroCssSrc, heroCssDest);
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
 * Flow: load config → syncAuthUI (if authenticated render app with tabs, else landing) →
 * AI tab: verify claim via background VERIFY_CLAIM; Discussion: list/detail + GET_* / CREATE_* / VOTE_POST.
 * Discussion store: discussions[], postsByDiscussionId[discussionId]; normalized with created_at, hasVoted, userVote.
 */
const panelJs = `document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  try {
  let API_URL = '';
  let AUTH0_CLIENT_ID = '';
  let activeTab = 'ai';
  let authError = null;
  let pendingDiscussionId = null;
  let currentSourceIndex = 0;
  let isVerifying = false;
  let lastClaimText = '';
  let lastVerifiedClaim = '';
  let lastFactCheck = null;
  let lastAnalysisResult = null;
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

  const tabs = {
    ai: { label: 'AI Fact Verification', body: 'Placeholder content.' },
    discussion: { label: 'Discussion Hub', body: 'Placeholder content.' },
    expert: { label: 'Contact an Expert', body: 'Placeholder content.' },
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

  const truncateAtWord = (text, maxLen) => {
    const str = String(text || '');
    if (str.length <= maxLen) return { display: str, isLong: false };
    const slice = str.slice(0, maxLen);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > 0 ? lastSpace : maxLen;
    return { display: str.slice(0, cut), isLong: true };
  };

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatAbsoluteTime = (timestamp) => {
    if (timestamp == null || !Number.isFinite(timestamp)) return '';
    const t = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    const d = new Date(t);
    const month = MONTH_NAMES[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const h = d.getHours();
    const m = d.getMinutes();
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return month + ' ' + day + ', ' + year + ' · ' + hh + ':' + mm;
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

  const truncateText = (text, limit = 140) => {
    const value = String(text || '');
    if (value.length <= limit) return value;
    return value.slice(0, limit).trim() + '…';
  };

  const discussionStore = { discussions: [], postsByDiscussionId: {} };

  const parseTimestamp = (v) => {
    if (v == null) return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v < 1e12 ? v * 1000 : v;
    if (typeof v === 'string') { const n = Date.parse(v); return Number.isFinite(n) ? n : null; }
    return null;
  };

  const mapApiDiscussion = (d) => {
    const id = String(d.id ?? d.discussion_id ?? '');
    const title = d.title ?? 'Discussion';
    const nonEmpty = (v) => v != null && String(v).trim() !== '';
    const trim = (v) => (v != null ? String(v).trim() : '');
    let description = '';
    if (nonEmpty(d.description)) description = trim(d.description);
    else if (nonEmpty(d.text)) description = trim(d.text);
    else if (nonEmpty(d.body)) description = trim(d.body);
    else if (nonEmpty(d.content)) description = trim(d.content);
    const user_id = d.user_id != null ? d.user_id : undefined;
    const author = (user_id != null && String(user_id).trim() !== '') ? ('u/' + String(user_id).trim()) : 'u/anonymous';
    const created_at = parseTimestamp(d.created_at) ?? parseTimestamp(d.createdAt) ?? null;
    const updated_at = parseTimestamp(d.updated_at) ?? parseTimestamp(d.updatedAt) ?? null;
    return {
      id,
      title,
      description,
      analysis_id: d.analysis_id ?? undefined,
      user_id,
      created_at,
      updated_at,
      author,
      createdAt: created_at != null ? created_at : undefined,
      voteScore: d.vote_score ?? d.voteScore ?? 0,
      postCount: d.post_count ?? d.postCount ?? 0,
    };
  };

  const mapApiPost = (p, discussionId) => {
    const voteScore = p.vote_score ?? p.voteScore ?? 0;
    const rawUp =
      Number.isFinite(p.up_votes) ? p.up_votes :
      Number.isFinite(p.upvotes) ? p.upvotes :
      undefined;
    const rawDown =
      Number.isFinite(p.down_votes) ? p.down_votes :
      Number.isFinite(p.downvotes) ? p.downvotes :
      undefined;
    const upvotes = Number.isFinite(rawUp) ? rawUp : Math.max(0, Math.floor(voteScore * 0.7));
    const downvotes = Number.isFinite(rawDown) ? rawDown : Math.max(0, Math.round(voteScore) - upvotes);
    const created_at = parseTimestamp(p.created_at) ?? parseTimestamp(p.createdAt) ?? null;
    const userVoteRaw = p.user_vote ?? p.current_user_vote;
    const userVote = (userVoteRaw === 'up' || userVoteRaw === 'down') ? userVoteRaw : null;
    const hasVoted = userVote != null;
    return {
      id: String(p.id ?? p.post_id ?? ''),
      discussionId: String(discussionId),
      title: p.title ?? '',
      body: p.text ?? p.body ?? '',
      created_at,
      createdAt: created_at != null ? created_at : (typeof p.created_at === 'number' ? (p.created_at < 1e12 ? p.created_at * 1000 : p.created_at) : (p.createdAt ?? Date.now())),
      voteScore,
      upvotes,
      downvotes,
      hasVoted,
      userVote,
    };
  };


  const discussionState = {
    view: 'list',
    selectedId: null,
    discussionCursor: 0,
    discussionsHasMore: true,
    discussionsLoading: false,
    discussionSort: 'new',
    postsCursorById: {},
    postsHasMoreById: {},
    postsLoadingById: {},
    postsSortById: {},
  };

  const fetchDiscussions = async ({ cursor = 0, limit = 6, sort = 'new' } = {}) => {
    if (cursor === 0 && discussionStore.discussions.length === 0 && API_URL) {
      try {
        const token = await ensureAccessToken();
        const res = await sendBackgroundMessage({ type: 'GET_DISCUSSIONS', apiUrl: API_URL, accessToken: token });
        if (res.success && Array.isArray(res.discussions)) {
          discussionStore.discussions = res.discussions.map(mapApiDiscussion);
        }
      } catch (_) {}
    }
    const sorted = [...discussionStore.discussions].sort((a, b) => {
      if (sort === 'top') return b.voteScore - a.voteScore;
      return b.createdAt - a.createdAt;
    });
    const start = Math.max(0, cursor);
    const items = sorted.slice(start, start + limit);
    const nextCursor = start + limit < sorted.length ? start + limit : null;
    return { items, nextCursor, hasMore: nextCursor !== null };
  };

  const fetchPosts = ({ discussionId, cursor = 0, limit = 6, sort = 'top' } = {}) => {
    const base = discussionStore.postsByDiscussionId[discussionId] || [];
    const sorted = [...base].sort((a, b) => {
      if (sort === 'new') return b.createdAt - a.createdAt;
      return b.voteScore - a.voteScore;
    });
    const start = Math.max(0, cursor);
    const items = sorted.slice(start, start + limit);
    const nextCursor = start + limit < sorted.length ? start + limit : null;
    return Promise.resolve({ items, nextCursor, hasMore: nextCursor !== null });
  };

  const buildFactCheckPostBody = ({ claim, score, headline, subhead, summary, sources }) => {
    const lines = [];
    if (claim) lines.push('Claim: ' + claim);
    if (Number.isFinite(score)) lines.push('Reliability: ' + score + '%');
    if (headline) lines.push('Headline: ' + headline);
    if (subhead) lines.push('Subhead: ' + subhead);
    if (summary) {
      lines.push('', 'Summary:', summary);
    }
    if (Array.isArray(sources) && sources.length > 0) {
      lines.push('', 'Sources:');
      sources.forEach((source, index) => {
        const title = source?.title || source?.name || ('Source ' + (index + 1));
        const url = source?.url || source?.link || '';
        const cred = getCredibilityPercent(source, index, 'real');
        let line = '- ' + title;
        if (url) line += ' (' + url + ')';
        if (cred !== null) line += ' — Credibility: ' + cred + '%';
        lines.push(line);
      });
    }
    lines.push('', 'Generated by Veracity AI fact verification.');
    return lines.join(String.fromCharCode(10));
  };

  const buildDiscussionItemHtml = (discussion) => {
    const titleText = discussion.title || 'Fact-check discussion';
    const descriptionText = discussion.description || '';
    const previewText = truncateText(descriptionText, 140);
    const timeText = formatAbsoluteTime(discussion.created_at);
    const metaHtml = timeText ? ('<div class="discussionMeta">' + '<span>' + escapeHtml(timeText) + '</span>' + '</div>') : '';
    return (
      '<div class="discussionItem" role="listitem" data-discussion-id="' + escapeHtml(discussion.id) + '">' +
        '<div class="discussionTitle">' + escapeHtml(titleText) + '</div>' +
        '<div class="discussionDescription discussionDescriptionPreview">' + escapeHtml(previewText) + '</div>' +
        metaHtml +
      '</div>'
    );
  };

  const buildPostItemHtml = (post) => {
    const bodyHtml = escapeHtml(post.body || '').replace(__VERACITY_BODY_NEWLINE_REGEX__, '<br />');
    const upCount = Number.isFinite(post.upvotes) ? post.upvotes : Math.max(0, Math.floor(post.voteScore * 0.7));
    const downCount = Number.isFinite(post.downvotes) ? post.downvotes : Math.max(0, post.voteScore - upCount);
    const timeText = formatAbsoluteTime(post.created_at ?? post.createdAt);
    const metaHtml = timeText ? ('<div class="postMeta"><span>' + escapeHtml(timeText) + '</span></div>') : '';
    const voted = post.hasVoted === true;
    const upDisabled = voted ? ' disabled' : '';
    const downDisabled = voted ? ' disabled' : '';
    return (
      '<div class="postCard" data-post-id="' + escapeHtml(post.id) + '">' +
        '<div class="postContent">' +
          '<div class="postBody">' + bodyHtml + '</div>' +
          '<div class="postVotes">' +
            '<div class="voteGroup up">' +
              '<button class="voteBtn upvote" data-vote="up" data-id="' + escapeHtml(post.id) + '" type="button" aria-label="Upvote"' + upDisabled + '>▲</button>' +
              '<span class="voteCount upCount" id="up-' + escapeHtml(post.id) + '">' + upCount + '</span>' +
            '</div>' +
            '<div class="voteGroup down">' +
              '<button class="voteBtn downvote" data-vote="down" data-id="' + escapeHtml(post.id) + '" type="button" aria-label="Downvote"' + downDisabled + '>▼</button>' +
              '<span class="voteCount downCount" id="down-' + escapeHtml(post.id) + '">' + downCount + '</span>' +
            '</div>' +
          '</div>' +
          metaHtml +
        '</div>' +
      '</div>'
    );
  };

  const renderDiscussionListView = (panelEl) => {
    discussionState.view = 'list';
    discussionState.selectedId = null;
    panelEl.innerHTML = [
      '<div class="discussionHub">',
      '  <div class="discussionHeader">',
      '    <h2 class="Home_sectionTitle__DKb2S">Discussion Hub</h2>',
      '  </div>',
      '  <div id="discussionScroll" class="discussionScroll">',
      '    <div id="discussionList" class="discussionList" role="list"></div>',
      '    <div id="discussionLoading" class="discussionLoading isHidden">Loading more…</div>',
      '    <div id="discussionEnd" class="discussionEnd isHidden">No more discussions</div>',
      '  </div>',
      '</div>',
    ].join('');

    const listEl = panelEl.querySelector('#discussionList');
    const scrollEl = panelEl.querySelector('#discussionScroll');
    const loadingEl = panelEl.querySelector('#discussionLoading');
    const endEl = panelEl.querySelector('#discussionEnd');
    const appendDiscussions = (items) => {
      if (!listEl) return;
      const html = items.map(buildDiscussionItemHtml).join('');
      listEl.insertAdjacentHTML('beforeend', html);
    };

    const loadMore = async () => {
      if (discussionState.discussionsLoading || !discussionState.discussionsHasMore) return;
      discussionState.discussionsLoading = true;
      if (loadingEl) loadingEl.classList.remove('isHidden');
      const result = await fetchDiscussions({
        cursor: discussionState.discussionCursor,
        limit: 6,
        sort: discussionState.discussionSort,
      });
      appendDiscussions(result.items);
      discussionState.discussionCursor = result.nextCursor || discussionState.discussionCursor;
      discussionState.discussionsHasMore = result.hasMore;
      discussionState.discussionsLoading = false;
      if (loadingEl) loadingEl.classList.add('isHidden');
      if (!result.hasMore && endEl) endEl.classList.remove('isHidden');
    };

    const resetListState = () => {
      discussionState.discussionCursor = 0;
      discussionState.discussionsHasMore = true;
      discussionState.discussionsLoading = false;
      if (listEl) listEl.innerHTML = '';
      if (endEl) endEl.classList.add('isHidden');
    };

    resetListState();
    loadMore();

    scrollEl?.addEventListener('scroll', () => {
      if (!scrollEl) return;
      const nearBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 80;
      if (nearBottom) loadMore();
    });

    listEl?.addEventListener('click', (event) => {
      const target = event.target;
      const item = target?.closest?.('[data-discussion-id]');
      if (!item) return;
      const id = item.getAttribute('data-discussion-id');
      if (id) renderDiscussionDetailView(panelEl, id);
    });

  };

  const renderDiscussionDetailView = async (panelEl, discussionId) => {
    if (API_URL) {
      try {
        const token = await ensureAccessToken();
        const [discRes, postsRes] = await Promise.all([
          sendBackgroundMessage({ type: 'GET_DISCUSSION', apiUrl: API_URL, accessToken: token, discussionId }),
          sendBackgroundMessage({ type: 'GET_POSTS', apiUrl: API_URL, accessToken: token, discussionId }),
        ]);
        if (discRes.success && discRes.discussion) {
          const mapped = mapApiDiscussion(discRes.discussion);
          const sid = String(mapped.id);
          const idx = discussionStore.discussions.findIndex((d) => String(d.id) === sid);
          if (idx >= 0) {
            const existing = discussionStore.discussions[idx];
            const hasExistingDesc = existing.description != null && String(existing.description).trim() !== '';
            const hasIncomingDesc = mapped.description != null && String(mapped.description).trim() !== '';
            let finalDescription = mapped.description;
            if (hasExistingDesc && !hasIncomingDesc) finalDescription = existing.description ?? '';
            const finalUserId = mapped.user_id != null && mapped.user_id !== '' ? mapped.user_id : (existing.user_id ?? mapped.user_id);
            const finalCreatedAt = (mapped.created_at != null && mapped.created_at !== '') ? mapped.created_at : (existing.created_at ?? mapped.created_at);
            const finalUpdatedAt = (mapped.updated_at != null && mapped.updated_at !== '') ? mapped.updated_at : (existing.updated_at ?? mapped.updated_at);
            discussionStore.discussions[idx] = {
              ...mapped,
              description: finalDescription,
              user_id: finalUserId,
              created_at: finalCreatedAt,
              updated_at: finalUpdatedAt,
              author: (finalUserId != null && String(finalUserId).trim() !== '') ? ('u/' + String(finalUserId).trim()) : (mapped.author ?? 'u/anonymous'),
              createdAt: finalCreatedAt != null ? finalCreatedAt : existing.createdAt,
            };
          } else {
            discussionStore.discussions.unshift(mapped);
          }
        }
        if (postsRes.success && Array.isArray(postsRes.posts)) {
          const existingList = discussionStore.postsByDiscussionId[discussionId] || [];
          const existingById = {};
          existingList.forEach((p) => { existingById[String(p.id)] = p; });
          const merged = postsRes.posts.map((p) => {
            const mapped = mapApiPost(p, discussionId);
            const existing = existingById[mapped.id];
            if (existing) {
              const apiUp = Number.isFinite(mapped.upvotes) ? mapped.upvotes : 0;
              const apiDown = Number.isFinite(mapped.downvotes) ? mapped.downvotes : 0;
              const localUp = Number.isFinite(existing.upvotes) ? existing.upvotes : 0;
              const localDown = Number.isFinite(existing.downvotes) ? existing.downvotes : 0;
              const mergedUp = apiUp > 0 ? apiUp : localUp;
              const mergedDown = apiDown > 0 ? apiDown : localDown;
              return { ...mapped, upvotes: mergedUp, downvotes: mergedDown };
            }
            return mapped;
          });
          discussionStore.postsByDiscussionId[discussionId] = merged;
        }
      } catch (_) {}
    }
    const discussion = discussionStore.discussions.find((item) => String(item.id) === String(discussionId));
    if (!discussion) {
      renderDiscussionListView(panelEl);
      return;
    }
    const existingPosts = discussionStore.postsByDiscussionId[discussionId] || [];
    if (!discussion.description && existingPosts.length > 0) {
      const firstPost = existingPosts[0];
      const body = firstPost?.body || '';
      if (body.includes('Generated by Veracity AI fact verification.')) {
        discussion.description = body;
      }
    }
    discussionState.view = 'detail';
    discussionState.selectedId = discussionId;

    const currentSort = discussionState.postsSortById[discussionId] || 'top';
    const discussionBody = discussion.description ?? '';
    const descTruncated = discussionBody ? truncateAtWord(discussionBody, 300) : null;
    const descriptionBlockHtml = !discussionBody
      ? ''
      : descTruncated.isLong
        ? '<div class="discussionDetailDescriptionWrap">' +
            '<div class="discussionDetailDescription" id="discussionDetailDescriptionText"></div>' +
            '<span role="button" tabindex="0" class="forgotLink logout-link discussionDescriptionToggle" id="discussionDescriptionToggle">Read more</span>' +
            '</div>'
        : '<div class="discussionDetailDescription" id="discussionDetailDescriptionText"></div>';
    const detailHeaderHtml =
      '<div class="discussionDetailHeader">' +
        '<h2 class="discussionDetailTitle">' + escapeHtml(discussion.title || 'Fact-check discussion') + '</h2>' +
        (descriptionBlockHtml || '') +
      '</div>';
    panelEl.innerHTML = [
      '<div class="discussionHub">',
      '  <button id="discussionBackBtn" class="discussionBackBtn" type="button">← Back</button>',
      '  ' + detailHeaderHtml,
      '  <div class="discussionControls">',
      '    <div class="discussionSort">',
      '      <button class="sortPill Home_primaryBtn__nO8b8 verifyButton' + (currentSort === 'top' ? ' sortPillActive' : '') + '" data-sort="top" type="button">Top</button>',
      '      <button class="sortPill Home_primaryBtn__nO8b8 verifyButton' + (currentSort === 'new' ? ' sortPillActive' : '') + '" data-sort="new" type="button">New</button>',
      '    </div>',
      '    <button id="newPostToggle" class="Home_primaryBtn__nO8b8 verifyButton discussionActionBtn" type="button">New post</button>',
      '  </div>',
      '  <form id="newPostForm" class="discussionForm isHidden">',
      '    <label class="Home_label__D_5fs" for="postBody">Post</label>',
      '    <textarea id="postBody" class="Home_textarea__k243o" rows="4" placeholder="Share your thoughts"></textarea>',
      '    <div class="discussionFormActions">',
      '      <button class="Home_primaryBtn__nO8b8" type="submit">Publish post</button>',
      '      <button id="newPostCancel" class="Home_heroSecondaryBtn__2ba6l" type="button">Cancel</button>',
      '    </div>',
      '    <div id="postError" class="discussionError" aria-live="polite"></div>',
      '  </form>',
      '  <div id="postsScroll" class="discussionScroll">',
      '    <div id="postsList" class="postsList"></div>',
      '    <div id="postsLoading" class="discussionLoading isHidden">Loading more…</div>',
      '    <div id="postsEnd" class="discussionEnd isHidden">No more posts</div>',
      '  </div>',
      '</div>',
    ].join('');

    const backBtn = panelEl.querySelector('#discussionBackBtn');
    const postsList = panelEl.querySelector('#postsList');
    const postsScroll = panelEl.querySelector('#postsScroll');
    const loadingEl = panelEl.querySelector('#postsLoading');
    const endEl = panelEl.querySelector('#postsEnd');
    const sortButtons = Array.from(panelEl.querySelectorAll('.sortPill'));
    const newPostToggle = panelEl.querySelector('#newPostToggle');
    const newPostForm = panelEl.querySelector('#newPostForm');
    const newPostCancel = panelEl.querySelector('#newPostCancel');
    const postBody = panelEl.querySelector('#postBody');
    const postError = panelEl.querySelector('#postError');

    const descriptionTextEl = panelEl.querySelector('#discussionDetailDescriptionText');
    if (descriptionTextEl && discussionBody) {
      descriptionTextEl.style.whiteSpace = 'pre-wrap';
      if (descTruncated.isLong) {
        descriptionTextEl.textContent = descTruncated.display + '…';
        const toggleBtn = panelEl.querySelector('#discussionDescriptionToggle');
        if (toggleBtn) {
          const runToggle = () => {
            const expanded = descriptionTextEl.getAttribute('data-expanded') === '1';
            if (expanded) {
              descriptionTextEl.textContent = descTruncated.display + '…';
              descriptionTextEl.removeAttribute('data-expanded');
              toggleBtn.textContent = 'Read more';
            } else {
              descriptionTextEl.textContent = discussionBody;
              descriptionTextEl.setAttribute('data-expanded', '1');
              toggleBtn.textContent = 'Show less';
            }
          };
          toggleBtn.addEventListener('click', runToggle);
          toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              runToggle();
            }
          });
        }
      } else {
        descriptionTextEl.textContent = discussionBody;
      }
    }

    const resetPostsState = () => {
      discussionState.postsCursorById[discussionId] = 0;
      discussionState.postsHasMoreById[discussionId] = true;
      discussionState.postsLoadingById[discussionId] = false;
      if (postsList) postsList.innerHTML = '';
      if (endEl) endEl.classList.add('isHidden');
    };

    const applyVotedState = (container) => {
      if (!container) return;
      const posts = discussionStore.postsByDiscussionId[discussionId] || [];
      const cards = Array.from(container.querySelectorAll('.postCard'));
      cards.forEach((card) => {
        const postId = card.getAttribute('data-post-id');
        if (!postId) return;
        const post = posts.find((p) => String(p.id) === String(postId));
        if (!post || post.hasVoted !== true) return;
        const upBtn = card.querySelector('.voteBtn.upvote');
        const downBtn = card.querySelector('.voteBtn.downvote');
        if (upBtn) upBtn.disabled = true;
        if (downBtn) downBtn.disabled = true;
        if (post.userVote === 'up' && upBtn) upBtn.classList.add('voted');
        if (post.userVote === 'down' && downBtn) downBtn.classList.add('voted');
      });
    };

    const appendPosts = (items) => {
      if (!postsList) return;
      const html = items.map(buildPostItemHtml).join('');
      postsList.insertAdjacentHTML('beforeend', html);
      applyVotedState(postsList);
    };

    const loadMorePosts = async () => {
      if (discussionState.postsLoadingById[discussionId]) return;
      if (!discussionState.postsHasMoreById[discussionId]) return;
      discussionState.postsLoadingById[discussionId] = true;
      if (loadingEl) loadingEl.classList.remove('isHidden');
      const result = await fetchPosts({
        discussionId,
        cursor: discussionState.postsCursorById[discussionId] || 0,
        limit: 6,
        sort: discussionState.postsSortById[discussionId] || 'top',
      });
      appendPosts(result.items);
      discussionState.postsCursorById[discussionId] = result.nextCursor || discussionState.postsCursorById[discussionId] || 0;
      discussionState.postsHasMoreById[discussionId] = result.hasMore;
      discussionState.postsLoadingById[discussionId] = false;
      if (loadingEl) loadingEl.classList.add('isHidden');
      if (!result.hasMore && endEl) endEl.classList.remove('isHidden');
    };

    resetPostsState();
    loadMorePosts();

    postsScroll?.addEventListener('scroll', () => {
      if (!postsScroll) return;
      const nearBottom = postsScroll.scrollTop + postsScroll.clientHeight >= postsScroll.scrollHeight - 80;
      if (nearBottom) loadMorePosts();
    });

    postsList?.addEventListener('click', async (event) => {
      const target = event.target;
      const voteButton = target?.closest?.('.voteBtn');
      if (!voteButton) return;
      const postId = voteButton.getAttribute('data-id');
      const post = (discussionStore.postsByDiscussionId[discussionId] || []).find((item) => item.id === postId);
      if (!post) return;
      if (post.hasVoted === true) return;
      const voteType = voteButton.getAttribute('data-vote');
      if (voteType !== 'up' && voteType !== 'down') return;
      if (!Number.isFinite(post.upvotes)) post.upvotes = Math.max(0, Math.floor(post.voteScore * 0.7));
      if (!Number.isFinite(post.downvotes)) post.downvotes = Math.max(0, post.voteScore - post.upvotes);
      const prevUp = post.upvotes;
      const prevDown = post.downvotes;
      if (voteType === 'up') {
        post.upvotes += 1;
        const upEl = panelEl.querySelector('#up-' + post.id);
        if (upEl) upEl.textContent = String(post.upvotes);
      } else {
        post.downvotes += 1;
        const downEl = panelEl.querySelector('#down-' + post.id);
        if (downEl) downEl.textContent = String(post.downvotes);
      }
      const card = voteButton.closest('.postCard');
      if (card) {
        const upBtn = card.querySelector('.voteBtn.upvote');
        const downBtn = card.querySelector('.voteBtn.downvote');
        if (upBtn) upBtn.disabled = true;
        if (downBtn) downBtn.disabled = true;
        if (voteType === 'up' && upBtn) upBtn.classList.add('voted');
        if (voteType === 'down' && downBtn) downBtn.classList.add('voted');
      }
      if (API_URL) {
        try {
          const token = await ensureAccessToken();
          const res = await sendBackgroundMessage({
            type: 'VOTE_POST',
            apiUrl: API_URL,
            accessToken: token,
            post_id: String(postId),
            vote: voteType,
          });
          if (!res || !res.success) {
            post.upvotes = prevUp;
            post.downvotes = prevDown;
            const upEl = panelEl.querySelector('#up-' + post.id);
            const downEl = panelEl.querySelector('#down-' + post.id);
            if (upEl) upEl.textContent = String(prevUp);
            if (downEl) downEl.textContent = String(prevDown);
            if (card) {
              const upB = card.querySelector('.voteBtn.upvote');
              const downB = card.querySelector('.voteBtn.downvote');
              if (upB) { upB.disabled = false; upB.classList.remove('voted'); }
              if (downB) { downB.disabled = false; downB.classList.remove('voted'); }
            }
          } else {
            post.hasVoted = true;
            post.userVote = voteType;
            const data = res.data;
            if (data && (Number.isFinite(data.upvotes) || Number.isFinite(data.downvotes))) {
              if (Number.isFinite(data.upvotes)) post.upvotes = data.upvotes;
              if (Number.isFinite(data.downvotes)) post.downvotes = data.downvotes;
              const upEl = panelEl.querySelector('#up-' + post.id);
              const downEl = panelEl.querySelector('#down-' + post.id);
              if (upEl) upEl.textContent = String(post.upvotes);
              if (downEl) downEl.textContent = String(post.downvotes);
            }
          }
        } catch (_) {
          post.upvotes = prevUp;
          post.downvotes = prevDown;
          const upEl = panelEl.querySelector('#up-' + post.id);
          const downEl = panelEl.querySelector('#down-' + post.id);
          if (upEl) upEl.textContent = String(prevUp);
          if (downEl) downEl.textContent = String(prevDown);
          if (card) {
            const upB = card.querySelector('.voteBtn.upvote');
            const downB = card.querySelector('.voteBtn.downvote');
            if (upB) { upB.disabled = false; upB.classList.remove('voted'); }
            if (downB) { downB.disabled = false; downB.classList.remove('voted'); }
          }
        }
      }
    });

    sortButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sort = btn.getAttribute('data-sort');
        if (!sort || sort === discussionState.postsSortById[discussionId]) return;
        discussionState.postsSortById[discussionId] = sort;
        sortButtons.forEach((inner) => {
          inner.classList.toggle('sortPillActive', inner.getAttribute('data-sort') === sort);
        });
        resetPostsState();
        loadMorePosts();
      });
    });

    newPostToggle?.addEventListener('click', () => {
      newPostForm?.classList.toggle('isHidden');
      if (postError) postError.textContent = '';
    });

    newPostCancel?.addEventListener('click', () => {
      newPostForm?.classList.add('isHidden');
      if (postError) postError.textContent = '';
    });

    newPostForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const body = (postBody?.value || '').trim();
      if (!body) {
        if (postError) postError.textContent = 'Please enter a post.';
        return;
      }
      if (postError) postError.textContent = '';
      if (!API_URL) {
        if (postError) postError.textContent = 'Something went wrong. Please try again.';
        return;
      }
      try {
        const token = await ensureAccessToken();
        const res = await sendBackgroundMessage({
          type: 'CREATE_POST',
          apiUrl: API_URL,
          accessToken: token,
          discussion_id: discussionId,
          text: body,
        });
        if (!res.success) {
          if (postError) postError.textContent = 'Something went wrong. Please try again.';
          return;
        }
        const postsRes = await sendBackgroundMessage({
          type: 'GET_POSTS',
          apiUrl: API_URL,
          accessToken: token,
          discussionId,
        });
        if (postsRes.success && Array.isArray(postsRes.posts)) {
          discussionStore.postsByDiscussionId[discussionId] = postsRes.posts.map((p) => mapApiPost(p, discussionId));
        }
        resetPostsState();
        loadMorePosts();
        if (postBody) postBody.value = '';
        newPostForm?.classList.add('isHidden');
      } catch (_) {
        if (postError) postError.textContent = 'Something went wrong. Please try again.';
      }
    });

    backBtn?.addEventListener('click', () => {
      renderDiscussionListView(panelEl);
    });
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
    const contentHtml =
      '<div class="sourceCard">' +
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
      ensureCreateDiscussionButton();
      return;
    }

    const sources = extractSources(result);
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
    ensureCreateDiscussionButton();
  };
  const ensureCreateDiscussionButton = () => {
    if (activeTab !== 'ai') {
      root?.querySelector('#createDiscussionBtn')?.remove();
      root?.querySelector('#createDiscussionContainer')?.remove();
      return;
    }
    const shouldShow = !!lastFactCheck && Number.isFinite(lastFactCheck.score) && !isVerifying;
    const aiPanel = root?.querySelector('#aiTabPanel');
    if (!aiPanel) return;
    const existingBtn = aiPanel.querySelector('#createDiscussionBtn');
    const existingContainer = aiPanel.querySelector('#createDiscussionContainer');
    if (!shouldShow) {
      existingBtn?.remove();
      existingContainer?.remove();
      return;
    }
    if (existingBtn || existingContainer) return;
    root?.querySelector('#createDiscussionContainer')?.remove();
    const anchor =
      aiPanel.querySelector('#sourcesMount') ||
      aiPanel.querySelector('#scoreBox') ||
      aiPanel;
    const container = document.createElement('div');
    container.id = 'createDiscussionContainer';
    container.className = 'createDiscussionCta';
    container.innerHTML =
      '<div class="createDiscussionHelper">Want to discuss this result?</div>' +
      '<button id="createDiscussionBtn" class="Home_primaryBtn__nO8b8 verifyButton discussionActionBtn" type="button">Create discussion</button>' +
      '<div id="createDiscussionFormMount"></div>';
    if (anchor) {
      anchor.insertAdjacentElement('afterend', container);
      return;
    }
    aiPanel.insertAdjacentElement('beforeend', container);
  };

  const getDiscussionDraftDefaults = () => {
    const claim = lastFactCheck?.claim || '';
    const title = claim ? claim.slice(0, 120) : 'Fact-check discussion';
    const body = buildFactCheckPostBody({
      claim: lastFactCheck?.claim,
      score: lastFactCheck?.score,
      headline: lastFactCheck?.headline,
      subhead: lastFactCheck?.subhead,
      summary: lastFactCheck?.summary,
      sources: lastFactCheck?.sources || [],
    });
    return { title, body };
  };

  const openCreateDiscussionDraft = () => {
    const aiPanel = root?.querySelector('#aiTabPanel');
    if (!aiPanel || !lastFactCheck) return;
    const mount = aiPanel.querySelector('#createDiscussionFormMount');
    if (!mount) return;
    const defaults = getDiscussionDraftDefaults();
    mount.innerHTML =
      '<form id="createDiscussionForm" class="discussionForm createDiscussionForm">' +
        '<label class="Home_label__D_5fs" for="discussionTitle">Title</label>' +
        '<input id="discussionTitle" class="Home_textarea__k243o" type="text" />' +
        '<label class="Home_label__D_5fs" for="discussionBody">Body</label>' +
        '<textarea id="discussionBody" class="Home_textarea__k243o" rows="6"></textarea>' +
        '<div class="discussionFormActions">' +
          '<button class="Home_primaryBtn__nO8b8" type="submit">Create discussion</button>' +
          '<button id="discussionCancel" class="Home_heroSecondaryBtn__2ba6l" type="button">Cancel</button>' +
        '</div>' +
        '<div id="discussionError" class="discussionError" aria-live="polite"></div>' +
      '</form>';
    const titleInput = mount.querySelector('#discussionTitle');
    const bodyInput = mount.querySelector('#discussionBody');
    if (titleInput) titleInput.value = defaults.title;
    if (bodyInput) bodyInput.value = defaults.body;
    const ctaBtn = root?.querySelector('#createDiscussionBtn');
    if (ctaBtn) ctaBtn.classList.add('isHidden');
  };

  const finalizeVerification = () => {
    setVerifying(false);
    lastVerifiedClaim = lastClaimText;
    ensureCreateDiscussionButton();
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
   * - AI tab Verify button (no argument → read from textarea)
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
    ensureCreateDiscussionButton();

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
      { type: 'VERIFY_CLAIM', claimText, accessToken: token, apiUrl: API_URL },
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

  const renderAppScreen = async () => {
    if (!root) return;
    root.innerHTML = '';
    root.innerHTML = \`
      <div class="Home_panel__UGulu">
        <div class="Home_tabList__81_8M" role="tablist" aria-label="Side panel sections">
          <button type="button" role="tab" aria-selected="true" class="Home_tabButton__yY1n3" data-tab-id="ai">
            <span class="Home_tabLabel__IC30v">AI Fact Verification</span>
          </button>
          <button type="button" role="tab" aria-selected="false" class="Home_tabButton__yY1n3" data-tab-id="discussion">
            <span class="Home_tabLabel__IC30v">Discussion Hub</span>
          </button>
          <button type="button" role="tab" aria-selected="false" class="Home_tabButton__yY1n3" data-tab-id="expert">
            <span class="Home_tabLabel__IC30v">Contact an Expert</span>
          </button>
        </div>
        <div class="Home_card__E5spL" role="tabpanel" id="tabPanel"></div>
        <footer class="Home_footer__yFiaX">
          © ComplexData Lab · McGill · Mila
          <button id="logoutBtn" class="forgotLink logout-link" type="button" style="margin-left:8px;">Logout</button>
        </footer>
      </div>
    \`;

    const tabButtons = Array.from(root.querySelectorAll('[data-tab-id]'));
    const panelEl = root.querySelector('#tabPanel');

    const renderTabContent = () => {
      if (!panelEl) return;
      if (activeTab === 'ai') {
        panelEl.innerHTML = \`
          <div id="aiTabPanel">
            <textarea id="claimInput" class="Home_textarea__k243o" placeholder="What would you like to verify today?" rows="4"></textarea>
            <div class="Home_buttonRow__Cnhie">
              <button id="verifyBtn" class="Home_primaryBtn__nO8b8 verifyButton" type="button">Verify</button>
            </div>
            <div class="statusRow" id="verifyingStatusContainer"></div>
            <div id="authStatusText" class="inlineInfo"></div>
            <div id="resultMount"></div>
          </div>
        \`;
        setVerifying(false);
        const verifyBtn = panelEl.querySelector('#verifyBtn');
        const claimInput = panelEl.querySelector('#claimInput');
        updateVerifyButtonState();
        claimInput?.addEventListener('input', updateVerifyButtonState);
        claimInput?.addEventListener('change', updateVerifyButtonState);
        verifyBtn?.addEventListener('click', async () => {
          await startVerification();
        });
        ensureCreateDiscussionButton();
        if (lastAnalysisResult) {
          lastClaimText = lastAnalysisResult.claim;
          lastVerifiedClaim = lastAnalysisResult.claim;
          const input = panelEl.querySelector('#claimInput');
          if (input) input.value = lastAnalysisResult.claim;
          setScore(lastAnalysisResult.score, { summary: lastAnalysisResult.summary, result: lastAnalysisResult.result });
          ensureCreateDiscussionButton();
          updateVerifyButtonState();
        }
      } else if (activeTab === 'discussion') {
        renderDiscussionListView(panelEl);
      } else if (activeTab === 'expert') {
        panelEl.innerHTML = \`
          <div class="Home_headingRow__XUO2e expertHeadingRow">
            <h2 class="Home_sectionTitle__DKb2S subheading expertHeroHeading">Need expert insight?</h2>
          </div>
          <div class="Home_sectionBody__JASIX">
            <form id="expertForm" style="display:flex;flex-direction:column;gap:10px;">
              <label class="Home_label__D_5fs" for="expertName">Name</label>
              <input id="expertName" class="Home_textarea__k243o" type="text" placeholder="Your name" />
              <label class="Home_label__D_5fs" for="expertEmail">Email</label>
              <input id="expertEmail" class="Home_textarea__k243o" type="email" placeholder="you@example.com" />
              <label class="Home_label__D_5fs" for="expertMessage">Message</label>
              <textarea id="expertMessage" class="Home_textarea__k243o" rows="3" placeholder="How can we help?"></textarea>
              <div class="Home_buttonRow__Cnhie" style="justify-content:center;">
                <button id="expertSubmitBtn" class="Home_primaryBtn__nO8b8" type="submit">Contact an Expert</button>
              </div>
              <div id="expertErrorText" class="expertErrorText" aria-live="polite"></div>
            </form>
          </div>
        \`;
        const expertForm = panelEl.querySelector('#expertForm');
        const nameInput = panelEl.querySelector('#expertName');
        const emailInput = panelEl.querySelector('#expertEmail');
        const messageInput = panelEl.querySelector('#expertMessage');
        const errorText = panelEl.querySelector('#expertErrorText');
        expertForm?.addEventListener('submit', async (event) => {
          event.preventDefault();
          const name = (nameInput?.value || '').trim();
          const email = (emailInput?.value || '').trim();
          const message = (messageInput?.value || '').trim();
          const missing = [];
          if (!name) missing.push('name');
          if (!email) missing.push('email');
          if (!message) missing.push('message');
          if (missing.length > 0) {
            if (errorText) errorText.textContent = 'Please enter your ' + missing.join(', ') + '.';
            return;
          }
          if (errorText) errorText.textContent = '';
          const lines = [
            'Name: ' + (name || '—'),
            'Email: ' + (email || '—'),
            '',
            'Message:',
            message || '—',
          ];
          const subject = 'Veracity – Contact an Expert';
          const body = lines.join('\\n');
          const mailto = 'mailto:veracity@mila.quebec?subject=' +
            encodeURIComponent(subject) +
            '&body=' +
            encodeURIComponent(body);
          window.location.href = mailto;
        });
      }
    };

    const updateActiveButtons = () => {
      tabButtons.forEach((btn) => {
        const isActive = btn.dataset.tabId === activeTab;
        btn.setAttribute('aria-selected', String(isActive));
        btn.classList.toggle('Home_tabButtonActive__zVobV', isActive);
      });
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTab = btn.dataset.tabId;
        setVerifying(false);
        if (activeTab === 'ai' && nextTab !== 'ai') {
          root?.querySelector('#createDiscussionBtn')?.remove();
          root?.querySelector('#createDiscussionContainer')?.remove();
          lastFactCheck = null;
          lastClaimText = '';
          lastAnalysisResult = null;
          currentSourceIndex = 0;
          setScore(null);
          ensureCreateDiscussionButton();
        }
        activeTab = nextTab;
        updateActiveButtons();
        renderTabContent();
      });
    });

    updateActiveButtons();
    renderTabContent();
    if (pendingDiscussionId && panelEl) {
      await renderDiscussionDetailView(panelEl, pendingDiscussionId);
      const postsScroll = panelEl.querySelector('#postsScroll');
      if (postsScroll) postsScroll.scrollTop = 0;
      pendingDiscussionId = null;
    }

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
    activeTab = 'ai';
    await syncAuthUI();
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

    root.addEventListener('click', (event) => {
      const target = event.target;
      const btn = target?.closest?.('#createDiscussionBtn');
      if (btn) {
        openCreateDiscussionDraft();
        return;
      }
      const cancelBtn = target?.closest?.('#discussionCancel');
      if (cancelBtn) {
        const formMount = root?.querySelector('#createDiscussionFormMount');
        if (formMount) formMount.innerHTML = '';
        const ctaBtn = root?.querySelector('#createDiscussionBtn');
        if (ctaBtn) ctaBtn.classList.remove('isHidden');
      }
    });

    root.addEventListener('submit', async (event) => {
      const form = event.target;
      if (!form || form.id !== 'createDiscussionForm') return;
      event.preventDefault();
      if (!lastFactCheck) return;
      const titleInput = form.querySelector('#discussionTitle');
      const bodyInput = form.querySelector('#discussionBody');
      const errorEl = form.querySelector('#discussionError');
      const title = (titleInput?.value || '').trim();
      const body = (bodyInput?.value || '').trim();
      if (!title || !body) {
        if (errorEl) errorEl.textContent = 'Please enter a title and body.';
        return;
      }
      if (errorEl) errorEl.textContent = '';
      if (!API_URL) {
        if (errorEl) errorEl.textContent = 'Something went wrong. Please try again.';
        return;
      }
      try {
        const token = await ensureAccessToken();
        const res = await sendBackgroundMessage({
          type: 'CREATE_DISCUSSION',
          apiUrl: API_URL,
          accessToken: token,
          title,
          description: body,
          analysis_id: lastFactCheck.analysis_id ?? undefined,
        });
        if (!res.success || !res.discussion) {
          if (errorEl) errorEl.textContent = 'Something went wrong. Please try again.';
          return;
        }
        const discussion = res.discussion;
        const newId = String(discussion.id ?? discussion.discussion_id ?? '');
        if (newId) {
          const mapped = mapApiDiscussion(discussion);
          if (!mapped.description && body) mapped.description = body;
          const idx = discussionStore.discussions.findIndex((d) => String(d.id) === String(mapped.id));
          if (idx >= 0) discussionStore.discussions[idx] = mapped;
          else discussionStore.discussions.unshift(mapped);
          discussionStore.postsByDiscussionId[newId] = [];
        }
        const formMount = root?.querySelector('#createDiscussionFormMount');
        if (formMount) formMount.innerHTML = '';
        const ctaBtn = root?.querySelector('#createDiscussionBtn');
        if (ctaBtn) ctaBtn.classList.remove('isHidden');
        activeTab = 'discussion';
        pendingDiscussionId = newId;
        await syncAuthUI();
      } catch (_) {
        if (errorEl) errorEl.textContent = 'Something went wrong. Please try again.';
      }
    });

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

