/**
 * background.js — Extension service worker
 *
 * Handles: (1) Context menu "Send to Veracity" and action click → open side panel.
 * (2) Message router: VERIFY_CLAIM (run verification flow), GET_ME, GET_DISCUSSIONS,
 * GET_DISCUSSION, GET_POSTS, CREATE_DISCUSSION, CREATE_POST, VOTE_POST. Panel and
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
  if (info.menuItemId !== "veracitySendSelection" || !info.selectionText) return;
  const tabId = tab?.id;
  if (chrome.sidePanel?.open && tabId) {
    chrome.sidePanel.open({ tabId }).catch((e) => console.error("Veracity: side panel open failed", e));
  }
  chrome.runtime.sendMessage({
    type: "SELECTION_TO_VERIFY",
    text: info.selectionText,
    pageUrl: info.pageUrl || "",
    pageTitle: tab?.title || "",
  });
});

async function runVerification(apiUrl, accessToken, claimText) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  const url1 = `${apiUrl}/v1/claims/`;
  const res1 = await fetch(url1, {
    method: "POST",
    headers,
    body: JSON.stringify({ claim_text: claimText, context: "veracity_chrome_extension" }),
  });
  const body1 = await res1.text();
  if (!res1.ok) throw new Error(`POST ${url1} ${res1.status}: ${body1}`);
  const claimData = JSON.parse(body1);
  const claimId = claimData.id;
  if (!claimId) throw new Error("No claim id");

  const url2 = `${apiUrl}/v1/claims/${claimId}/embedding`;
  const res2 = await fetch(url2, { method: "PATCH", headers });
  const body2 = await res2.text();
  if (!res2.ok) throw new Error(`PATCH ${url2} ${res2.status}: ${body2}`);

  const streamUrl = `${apiUrl}/v1/analysis/claim/${claimId}/stream`;
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

async function apiPost(apiUrl, path, accessToken, body) {
  const url = `${apiUrl}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function apiPut(apiUrl, path, accessToken, body) {
  const url = `${apiUrl}${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
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
  // Full verification: claim → embedding → stream → analysis → sources.
  if (message?.type === "VERIFY_CLAIM") {
    const { claimText, accessToken, apiUrl } = message;
    if (!apiUrl || !accessToken || typeof claimText !== "string") {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, or claimText" });
      return;
    }
    runVerification(apiUrl, accessToken, claimText.trim())
      .then((data) => sendResponse({ success: true, ...data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  if (message?.type === "GET_DISCUSSIONS") {
    const { apiUrl, accessToken } = message;
    if (!apiUrl || !accessToken) {
      sendResponse({ success: false, error: "Missing apiUrl or accessToken" });
      return;
    }
    (async () => {
      try {
        let data = await apiGet(apiUrl, "/v1/discussions/user", accessToken);
        if (!Array.isArray(data)) data = data?.discussions || data?.items || (data ? [data] : []);
        if (!Array.isArray(data)) {
          data = await apiGet(apiUrl, "/v1/discussions/", accessToken);
          if (!Array.isArray(data)) data = data?.discussions || data?.items || (data ? [data] : []);
        }
        sendResponse({ success: true, discussions: Array.isArray(data) ? data : [] });
      } catch (err) {
        sendResponse({ success: false, error: err?.message || String(err) });
      }
    })();
    return true;
  }
  if (message?.type === "GET_DISCUSSION") {
    const { apiUrl, accessToken, discussionId } = message;
    if (!apiUrl || !accessToken || !discussionId) {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, or discussionId" });
      return;
    }
    apiGet(apiUrl, `/v1/discussions/${discussionId}`, accessToken)
      .then((data) => sendResponse({ success: true, discussion: data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  if (message?.type === "GET_POSTS") {
    const { apiUrl, accessToken, discussionId } = message;
    if (!apiUrl || !accessToken || !discussionId) {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, or discussionId" });
      return;
    }
    apiGet(apiUrl, `/v1/posts/discussion/${discussionId}`, accessToken)
      .then((data) => {
        const posts = Array.isArray(data) ? data : (data?.posts || data?.items || []);
        sendResponse({ success: true, posts });
      })
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  if (message?.type === "CREATE_DISCUSSION") {
    const { apiUrl, accessToken, title, description, analysis_id } = message;
    if (!apiUrl || !accessToken || !title || !description) {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, title, or description" });
      return;
    }
    const body = { title, description, analysis_id };
    apiPost(apiUrl, "/v1/discussions/", accessToken, body)
      .then((data) => sendResponse({ success: true, discussion: data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  if (message?.type === "CREATE_POST") {
    const { apiUrl, accessToken, discussion_id, text } = message;
    if (!apiUrl || !accessToken || !discussion_id || !text) {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, discussion_id, or text" });
      return;
    }
    apiPost(apiUrl, "/v1/posts/", accessToken, { discussion_id, text })
      .then((data) => sendResponse({ success: true, post: data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
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
  if (message?.type === "VOTE_POST") {
    const { apiUrl, accessToken, post_id, vote } = message;
    if (!apiUrl || !accessToken || !post_id || !vote) {
      sendResponse({ success: false, error: "Missing apiUrl, accessToken, post_id, or vote" });
      return;
    }
    apiPut(apiUrl, `/v1/posts/${post_id}/vote`, accessToken, { vote_type: vote })
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
});

