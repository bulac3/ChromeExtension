var trapManager = {};

function sendMessage(action, parameters, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, parameters: parameters }, function (response) {
            console.log(`sendMessage ${action} received`);
            if(callback) {
              callback(response);
            }
        });
    });
}

function iconClickDelegate(event) {
    var target = event.target;
    var deleteId = target.getAttribute('data-delete-trap-id');
    if (deleteId) {
        deleteTrap(deleteId);
    }
    var playId = target.getAttribute('data-play-trap-id');
    if (playId) {
        //playTrap(playId);
    }
}

function deleteTrap(id) {    
    var name = trapManager.getTrap(id).name;
    var answer = confirm(`Are you sure you want to delete trap "${name}"?`); 
    if (answer) {
        sendMessage("deleteTrap", { id: id });
        trapManager.deleteTrap(id);
    }
}

function refreshTrapsList() {
    var trapListElement = document.querySelector(".menu .trap-list");
    while (trapListElement.firstChild) {
        trapListElement.removeChild(trapListElement.firstChild);
    }
    console.log("cycle");
    for (var trap of trapManager.getTrapIterateObject()) {
        console.log(JSON.stringify(trap));
        var newDiv = document.createElement("div");
        newDiv.classList.add("menu-item");
        var textElement = document.createElement("span");
        textElement.textContent = trap.name;
        newDiv.appendChild(textElement);

        var iconsElement = document.createElement("div");
        iconsElement.classList.add("hover-icons");
        iconsElement.innerHTML = `<div class="play-button" data-play-trap-id="${trap.id}"></div><div class="delete-button" data-delete-trap-id="${trap.id}"></div>`
        newDiv.appendChild(iconsElement);
        trapListElement.appendChild(newDiv);
    }
}

function onWindowLoad() {
    var deleteIconUrl = chrome.extension.getURL("images/delete.png");
    var sheet = window.document.styleSheets[0];
    
    //sheet.insertRule(`.play-button {background-image: url(data:image/png;base64,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); }`,
    //    sheet.cssRules.length);
    sheet.insertRule(`.delete-button {background-image: url(${deleteIconUrl}); }`,
        sheet.cssRules.length);

    sendMessage("getIsExtesionWorkOnPage", undefined, function (enabled) {
        console.log("enabled - " + enabled);
        document.getElementById("enabled").checked = enabled;
    });

    document.querySelector(".add-trap").addEventListener("click", function(){sendMessage("addTrap");});
    document.querySelector(".save-traps").addEventListener("click", function(){sendMessage("saveTraps");});
    document.querySelector(".save-traps-to-file").addEventListener("click", function(){sendMessage("saveTrapsToFile");});
    document.querySelector(".reset-traps").addEventListener("click", function(){sendMessage("resetTraps");});
    document.getElementById("enabled").addEventListener("click", function(e){sendMessage("setIsExtesionWorkOnPage", {isEnabled: e.target.checked});});

    var trapListElement = document.querySelector(".menu .trap-list");
    trapListElement.addEventListener("click", iconClickDelegate);

    sendMessage("getTrapStorage", undefined, function (trapStorage) {
        trapManager = new TrapManager();
        trapManager.trapStorage = trapStorage;
        refreshTrapsList();
    });
}

window.addEventListener("load", onWindowLoad)