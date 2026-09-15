/**
 * background.js — Extension service worker
 *
 * Handles: (1) Context menus — "Send to Veracity" for selected text and "Verify
 * image with Veracity" for images, plus action click → open side panel. Images are
 * fetched here, where host permissions allow reading any origin, and parked for the
 * panel to collect.
 * (2) Message router: EXTRACT_CLAIMS (pull verifiable statements out of the user's
 * text), VERIFY_CLAIM (run verification flow, carrying the user's chosen domains) and
 * GET_ME. Image verification posts multipart directly from the panel, since messaging
 * cannot carry a File. Panel and
 * content scripts send messages here; this script calls the backend API with the
 * panel’s access token.
 */
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: "veracitySendSelection",
      title: "Send to Veracity",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({
      id: "veracityVerifyImage",
      title: "Verify image with Veracity",
      contexts: ["image"],
    });
  } catch (err) {
    console.error("Veracity: context menu creation failed", err);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (chrome.sidePanel?.open) await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (e) {
    console.error("Veracity: failed to open side panel", e);
  }
});

// Context menu: open panel and broadcast selection so panel can prefill and start verify.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const tabId = tab?.id;
  const openPanel = () => {
    if (chrome.sidePanel?.open && tabId) {
      chrome.sidePanel.open({ tabId }).catch((e) => console.error("Veracity: side panel open failed", e));
    }
  };

  if (info.menuItemId === "veracitySendSelection" && info.selectionText) {
    openPanel();
    chrome.runtime.sendMessage({
      type: "SELECTION_TO_VERIFY",
      text: info.selectionText,
      pageUrl: info.pageUrl || "",
      pageTitle: tab?.title || "",
    });
    return;
  }

  if (info.menuItemId === "veracityVerifyImage" && info.srcUrl) {
    openPanel();
    handleImageContextClick(info.srcUrl);
  }
});

// An image the panel has not collected yet. The panel may still be booting when a
// context-menu click arrives, so the payload is parked here and the panel asks for
// it on load; whichever path wins, the image is delivered exactly once.
let pendingImage = null;

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileNameFromUrl(url, mimeType) {
  let base = "image";
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop();
    if (last) base = decodeURIComponent(last).split("?")[0];
  } catch (_) {}
  if (/\.[a-z0-9]{2,5}$/i.test(base)) return base;
  const ext = (mimeType || "").split("/")[1] || "jpg";
  return base + "." + (ext === "jpeg" ? "jpg" : ext);
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Fetch the right-clicked image and hand it to the panel.
 *
 * The fetch runs here rather than in the panel: the service worker holds the host
 * permissions that let it read an image from any origin without CORS, while the
 * panel's own CSP stays narrow.
 */
async function handleImageContextClick(srcUrl) {
  const deliver = (payload) => {
    pendingImage = payload;
    chrome.runtime.sendMessage({ type: "IMAGE_TO_VERIFY" }, () => {
      // No receiver yet just means the panel is still booting; it will ask for this.
      void chrome.runtime.lastError;
    });
  };

  try {
    const res = await fetch(srcUrl);
    if (!res.ok) {
      deliver({ error: "Could not download that image from the page." });
      return;
    }
    const blob = await res.blob();
    const type = (blob.type || "").toLowerCase().split(";")[0];
    if (!IMAGE_TYPES.has(type)) {
      deliver({ error: type
        ? ("Veracity cannot verify " + type + " images.")
        : "That image is in a format Veracity cannot verify." });
      return;
    }
    if (blob.size > IMAGE_MAX_BYTES) {
      deliver({ error: "That image is too large to verify (limit 8 MB)." });
      return;
    }
    const bytes = new Uint8Array(await blob.arrayBuffer());
    deliver({
      base64: bytesToBase64(bytes),
      type,
      name: fileNameFromUrl(srcUrl, type),
      size: blob.size,
    });
  } catch (err) {
    deliver({ error: "Could not download that image from the page." });
  }
}

/**
 * Pull the verifiable statements out of the user's text.
 *
 * Nothing is persisted: the panel shows what came back and only creates a claim once
 * the user picks one. The backend answers 200 for every outcome it can describe
 * (`ok`, `no_claims`, `too_long`, `llm_error`), so a rejection here means a genuine
 * transport, auth or config problem rather than "found nothing" — the panel treats
 * both the same way, by offering the fallback buttons.
 */
async function runExtraction(apiUrl, accessToken, text, language) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  const url = `${apiUrl}/v1/claims/extract`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, language: language || "english" }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`POST ${url} ${res.status}: ${body}`);

  const data = JSON.parse(body);
  return {
    statements: Array.isArray(data?.statements) ? data.statements : [],
    reason: data?.reason || "ok",
  };
}

/**
 * Create the claim and run it end to end.
 *
 * `context` is the text the claim was taken from — the panel passes the user's
 * original selection so the analysis is generated with real surrounding context. It
 * falls back to the historical placeholder when a caller does not supply one, which
 * keeps older panel builds behaving exactly as before.
 */
async function runVerification(apiUrl, accessToken, claimText, preferredDomains, context, language) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  const url1 = `${apiUrl}/v1/claims/`;
  const basePayload = { claim_text: claimText, context: context || "veracity_chrome_extension" };
  if (language) basePayload.language = language;
  const domains = Array.isArray(preferredDomains) ? preferredDomains.filter(Boolean) : [];

  // Send the user's chosen domains when there are any. The field is not yet part of
  // the claims schema, so a validation error means this build is talking to a backend
  // without source prioritisation — retry without it rather than failing the claim.
  let res1 = await fetch(url1, {
    method: "POST",
    headers,
    body: JSON.stringify(domains.length ? { ...basePayload, preferred_domains: domains } : basePayload),
  });
  if (!res1.ok && domains.length && (res1.status === 400 || res1.status === 422)) {
    res1 = await fetch(url1, { method: "POST", headers, body: JSON.stringify(basePayload) });
  }
  const body1 = await res1.text();
  if (!res1.ok) throw new Error(`POST ${url1} ${res1.status}: ${body1}`);
  const claimData = JSON.parse(body1);
  const claimId = claimData.id;
  if (!claimId) throw new Error("No claim id");

  const url2 = `${apiUrl}/v1/claims/${claimId}/embedding`;
  const res2 = await fetch(url2, { method: "PATCH", headers });
  const body2 = await res2.text();
  if (!res2.ok) throw new Error(`PATCH ${url2} ${res2.status}: ${body2}`);

  //const streamUrl = `${apiUrl}/v1/analysis/claim/${claimId}/stream`;
  const streamParams = new URLSearchParams();
  domains.forEach(domain => {
  streamParams.append("preferred_domains", domain);
  });

  const streamUrl = `${apiUrl}/v1/analysis/claim/${claimId}/stream${
  domains.length ? `?${streamParams.toString()}` : ""
  }`;
  const streamHeaders = { Accept: "text/event-stream", Authorization: `Bearer ${accessToken}` };
  const resStream = await fetch(streamUrl, { method: "GET", headers: streamHeaders });
  if (!resStream.ok) {
    const errBody = await resStream.text();
    throw new Error(`GET ${streamUrl} ${resStream.status}: ${errBody}`);
  }
  const reader = resStream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    if (buffer.includes("[DONE]")) break;
  }

  const claimAnalysisUrl = `${apiUrl}/v1/analysis/claim/${claimId}`;
  const resClaim = await fetch(claimAnalysisUrl, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
  });
  const bodyClaim = await resClaim.text();
  if (!resClaim.ok) throw new Error(`GET ${claimAnalysisUrl} ${resClaim.status}: ${bodyClaim}`);
  const claimAnalyses = JSON.parse(bodyClaim);
  const list = Array.isArray(claimAnalyses) ? claimAnalyses : (claimAnalyses?.analyses ?? [claimAnalyses]);
  const latest = list.length > 0 ? list.reduce((a, b) => (a.id > b.id ? a : b)) : null;
  if (!latest) throw new Error("No analysis returned for claim");
  const analysisId = latest.id;
  const veracity_score = latest.veracity_score;
  const analysis_text = latest.analysis_text || "";

  const url5 = `${apiUrl}/v1/sources/analysis/${analysisId}`;
  const res5 = await fetch(url5, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
  });
  const body5 = await res5.text();
  if (!res5.ok) throw new Error(`GET ${url5} ${res5.status}: ${body5}`);
  const sourcesPayload = JSON.parse(body5);
  const sources = Array.isArray(sourcesPayload) ? sourcesPayload : (sourcesPayload?.sources || sourcesPayload?.data || []);

  return { veracity_score, analysis_text, sources, claim_id: claimId, analysis_id: analysisId };
}

async function apiGet(apiUrl, path, accessToken) {
  const url = `${apiUrl}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "ping") {
    sendResponse({ ok: true, source: "background" });
  }
  // Panel asks for current tab’s selection; we forward to content script.
  if (message?.type === "REQUEST_SELECTION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs?.[0];
      if (!activeTab?.id) {
        sendResponse({ ok: false });
        return;
      }
      chrome.tabs.sendMessage(
        activeTab.id,
        { type: "REQUEST_SELECTION" },
        (resp) => {
          if (chrome.runtime.lastError) {
            sendResponse({ ok: false, error: chrome.runtime.lastError.message });
            return;
          }
          sendResponse(resp);
        }
      );
    });
    return true;
  }
  // Claim decomposition: read the user's text and hand back candidate statements for
  // the panel to confirm. Creates nothing.
  if (message?.type === "EXTRACT_CLAIMS") {
    const { text, language, accessToken, apiUrl } = message;
    if (!apiUrl || !accessToken || typeof text !== "string" || !text.trim()) {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, or text" });
      return;
    }
    runExtraction(apiUrl, accessToken, text.trim(), language)
      .then((data) => sendResponse({ success: true, ...data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  // Full verification: claim → embedding → stream → analysis → sources.
  if (message?.type === "VERIFY_CLAIM") {
    const { claimText, accessToken, apiUrl, preferredDomains, context, language } = message;
    if (!apiUrl || !accessToken || typeof claimText !== "string") {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, or claimText" });
      return;
    }
    runVerification(apiUrl, accessToken, claimText.trim(), preferredDomains, context, language)
      .then((data) => sendResponse({ success: true, ...data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  // Panel collects a right-clicked image; the slot is cleared as it is handed over.
  if (message?.type === "TAKE_PENDING_IMAGE") {
    const payload = pendingImage;
    pendingImage = null;
    sendResponse({ success: true, image: payload });
    return true;
  }
  if (message?.type === "GET_ME") {
    const { apiUrl, accessToken } = message;
    if (!apiUrl || !accessToken) {
      sendResponse({ success: false, error: "Missing apiUrl or accessToken" });
      return;
    }
    apiGet(apiUrl, "/v1/users/me", accessToken)
      .then((data) => sendResponse({ success: true, id: data?.id ?? data?.user_id ?? data?.sub, user: data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
});

