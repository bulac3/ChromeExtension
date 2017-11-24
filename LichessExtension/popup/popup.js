chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.greeting == "hello")
            sendResponse({ farewell: "goodbye" });
    }
);

function onWindowLoad() {
    var message = document.querySelector('#message');
    chrome.tabs.executeScript(null, {
        file: "popup/chess.js"
    }, nextScript);

    function nextScript() {
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
            return;
        }
        chrome.tabs.executeScript(null, {
            file: "popup/embeded.js"
        });
    }
}

window.onload = onWindowLoad;

function loadTraps(callback) {
    chrome.storage.sync.get("trapStorage", function (items) {
        this.trapStorage = items.trapStorage;
    });
}

function saveTraps() {
    chrome.storage.sync.set({ "trapStorage": this.trapStorage }, function (items) {
        return items.trapStorage;
    });
}