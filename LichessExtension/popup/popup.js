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

function loadTraps(callback) {
    chrome.storage.local.get("trapStorage", function (items) {
        this.trapStorage = items.trapStorage;
    });
}

function saveTraps() {
    chrome.storage.local.set({ "trapStorage": this.trapStorage }, function (items) {
        return items.trapStorage;
    });
}

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

function resetTraps() {
    alert("123");
    //alert(JSON.stringify(chrome.storage));
    //alert(JSON.stringify(chrome.storage.local));
    alert("JSON.stringify(chrome.storage.set)");
    alert(JSON.stringify(chrome.storage.sync.set));
    chrome.storage.sync.set({ "trapStorage": initialTrapStorage });
    alert("1234");
    chrome.storage.sync.get("trapStorage", function (items) {
        alert("111");
        //alert(JSON.stingify(items));
    });

    
    //chrome.storage.local.get("trapStorage", function (item) {
    //    if (item && item.byId) {
    //        //self.trapStorage = item;
    //        storage = item;
    //        alert("from str");
    //    } else {
    //        //self.trapStorage = initialTrapStorage;//new TrapStorage();//;
    //        storage = item;
    //        alert("init str");
    //    }
    //    callback();
    //});
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

function onWindowLoad() {    
    getIsEnabledSendMessage(function (enabled) {
        //alert("callback");
        //alert(document.getElementById("enabled"));        
        document.getElementById("enabled").checked = enabled;
    });

    document.querySelector(".add-trap").addEventListener("click", addTrapSendMessage);
    document.querySelector(".reset-traps").addEventListener("click", resetTraps);
    document.getElementById("enabled").addEventListener("click", setIsEnabledSendMessage);

    

    getTrapStorageAsync(function (trapStorage) {
        storage = trapStorage;
        var menuElement = document.querySelector(".menu");        
        for (var id in storage.byId) {
            if (storage.byId.hasOwnProperty(id)) {
                var trap = storage.byId[id];
                var newDiv = document.createElement("div");
                newDiv.classList.add("menu-item");
                newDiv.textContent = trap.id + "---" + trap.name;
                menuElement.appendChild(newDiv);
            }
        }
        
    });
}

window.addEventListener("load", onWindowLoad)