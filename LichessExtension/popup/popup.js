//chrome.runtime.onMessage.addListener(
//    function (request, sender, sendResponse) {
//        console.log(sender.tab ?
//                    "from a content script:" + sender.tab.url :
//                    "from the extension");
//        if (request.greeting == "hello")
//            sendResponse({ farewell: "goodbye" });
//    }
//);
var storage = {};

function addTrapSendMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "addTrap" }, function (response) {
            console.log("resp addTrap received");
        });
    });
}

function saveTrapsMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "saveTraps" }, function (response) {
            console.log("resp saveTraps received");
        });
    });
}

function getTrapStorageAsync(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getTrapStorage" }, function (response) {
            callback(response);
        });
    });
}

function setIsEnabledSendMessage(e) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "setIsExtesionWorkOnPage", isEnabled: e.target.checked }, function (response) { });
    });
}

function getIsEnabledSendMessage(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getIsExtesionWorkOnPage" }, function (response) {
            callback(response);            
        });
    });
}

function resetTrapsSendMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "resetTraps" });
    });
}

function onWindowLoad() {    
    getIsEnabledSendMessage(function (enabled) {
        //alert("callback");
        //alert(document.getElementById("enabled"));        
        document.getElementById("enabled").checked = enabled;
    });

    document.querySelector(".add-trap").addEventListener("click", addTrapSendMessage);
    document.querySelector(".reset-traps").addEventListener("click", resetTrapsSendMessage);
    document.getElementById("enabled").addEventListener("click", setIsEnabledSendMessage);

    

    getTrapStorageAsync(function (trapStorage) {
        storage = trapStorage;
        debugger;
        var trapListElement = document.querySelector(".menu .trap-list");
        while (trapListElement.firstChild) {
            trapListElement.removeChild(trapListElement.firstChild);
        }
        for (var id in storage.byId) {
            if (storage.byId.hasOwnProperty(id)) {
                var trap = storage.byId[id];
                var newDiv = document.createElement("div");
                newDiv.classList.add("menu-item");
                newDiv.textContent = trap.id + "---" + trap.name;
                trapListElement.appendChild(newDiv);
            }
        }
        
    });
}

window.addEventListener("load", onWindowLoad)