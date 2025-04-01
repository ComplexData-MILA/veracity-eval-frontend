chrome.contextMenus.create({
    id: "verifactSearch",
    title: "Search on VeriFact",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "verifactSearch" && info.selectionText) {
        let query = encodeURIComponent(info.selectionText);
        let url = `https:/www.veri-fact.ai/?q=${query}`;
        chrome.tabs.create({ url });
    }
});
