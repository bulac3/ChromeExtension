chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "boardFind") {
        message.innerText = request.isFound;
    }
});

function onWindowLoad() {

    var message = document.querySelector('#message');

    chrome.tabs.executeScript(null, {
        file: "popup/embeded.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

}

window.onload = onWindowLoad;