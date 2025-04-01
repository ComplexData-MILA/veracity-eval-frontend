document.getElementById("sendButton").addEventListener("click", function () {
    let query = document.getElementById("searchText").value.trim();
    if (query) {
        let url = `https://www.veri-fact.ai/chat/?q=${encodeURIComponent(query)}`;
        chrome.tabs.create({ url });
    }
});
