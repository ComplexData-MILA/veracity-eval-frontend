/**
 * content.js — Injected into web pages
 *
 * Listens for REQUEST_SELECTION from the background (or panel). Returns the
 * current page selection and page URL/title so the side panel can prefill the
 * claim input and start verification. Only runs on pages where the extension
 * is allowed; does not modify the page.
 */
(() => {
  const getSelectionPayload = () => {
    const text = window.getSelection()?.toString() || "";
    return {
      type: "VERACITY_SELECTION",
      text,
      url: window.location.href,
      title: document.title,
    };
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "REQUEST_SELECTION") {
      sendResponse(getSelectionPayload());
      return true;
    }
  });
})();

