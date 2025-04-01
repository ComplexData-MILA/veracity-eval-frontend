function fillInputBox() {
    let query = new URLSearchParams(window.location.search).get("q");
    if (!query) return;

    let wrapper = document.querySelector("Input");  // Find the wrapper
    let inputBox = wrapper ? wrapper.querySelector("input") : null;  // Find the actual input

    if (inputBox) {
        inputBox.value = query;
        inputBox.dispatchEvent(new Event("input", { bubbles: true }));
        inputBox.focus();
    } else {
        console.error("VeriFact input box not found.");
        setTimeout(fillInputBox, 500);  // Retry if the input is not ready
    }
}

fillInputBox();

