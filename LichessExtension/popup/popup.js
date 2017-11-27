chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.greeting == "hello")
            sendResponse({ farewell: "goodbye" });
    }
);

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

function addTrapSendMessage(){
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "addTrap" }, function (response) {
            console.log("resp received");
        });
    });
}

function onWindowLoad() {
    document.querySelector(".add-trap").addEventListener("click", addTrapSendMessage);
}

window.addEventListener("load", onWindowLoad)