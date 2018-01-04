var initMenuJsCode = function () {
    var trapManager = {};
    
    function sendMessage(action, parameters, callback) {
        //chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //    chrome.tabs.sendMessage(tabs[0].id, { action: action, parameters: parameters }, function (response) {
        //        console.log(`sendMessage ${action} received`);
        //        if (callback) {
        //            callback(response);
        //        }
        //    });
        //});
        handleMessage(
            { action: action, parameters: parameters },
            this,
            function (response) {
                console.log(`handle message ${action} received`);
                if (callback) {
                    callback(response);
                }
            }
        );
    }

    function iconClickDelegate(event) {
        var target = event.target;
        var deleteId = target.getAttribute('data-delete-trap-id');
        if (deleteId) {
            deleteTrap(deleteId);
        }
        var editId = target.getAttribute('data-edit-trap-id');
        if (editId) {
            editTrap(editId);
        }
        var playId = target.getAttribute('data-play-trap-id');
        if (playId) {
            //playTrap(playId);
        }
    }

    function editTrap(id) {
        var name = trapManager.getTrap(id).name;
        var trapName = prompt("Edit trap name.", name);
        if (trapName) {
            sendMessage("editTrapName", { id: id, name: trapName });
            trapManager.editTrapName(id, trapName);
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
        var trapListElement = document.querySelector(".traps-menu .trap-list");
        while (trapListElement.firstChild) {
            trapListElement.removeChild(trapListElement.firstChild);
        }
        console.log("cycle");
        var traps = trapManager.getTrapIterateObject();
        traps.sort(function (a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });        
        for (var trap of traps) {//trapManager.getTrapIterateObject()) {
            console.log(JSON.stringify(trap));
            var newDiv = document.createElement("div");
            newDiv.classList.add("menu-item");
            var textElement = document.createElement("span");
            textElement.textContent = trap.name;
            newDiv.appendChild(textElement);

            var iconsElement = document.createElement("div");
            iconsElement.classList.add("hover-icons");
            iconsElement.innerHTML = `<div class="icon-button play-button" data-play-trap-id="${trap.id}"></div>` +
                `<div class="icon-button delete-button" data-delete-trap-id="${trap.id}"></div>` +
                `<div class="icon-button edit-button" data-edit-trap-id="${trap.id}"></div>`;
            newDiv.appendChild(iconsElement);
            trapListElement.appendChild(newDiv);
        }
    }

    var deleteIconUrl = chrome.extension.getURL("images/delete.png");
    var editIconUrl = chrome.extension.getURL("images/edit.png");
    var sheet = window.document.styleSheets[0];
    var menuElement = document.getElementsByClassName("traps-menu")[0];

    sheet.insertRule(`.delete-button {background-image: url(${deleteIconUrl}); }`);
    sheet.insertRule(`.edit-button {background-image: url(${editIconUrl}); }`);

    console.log(menuElement.querySelector(".add-trap"));
    menuElement.querySelector(".add-trap").addEventListener("click", function () { sendMessage("addTrap", undefined, function () { refreshTrapsList();}); });
    menuElement.querySelector(".save-traps").addEventListener("click", function () { sendMessage("saveTraps"); });
    menuElement.querySelector(".save-traps-to-file").addEventListener("click", function () { sendMessage("saveTrapsToFile"); });
    menuElement.querySelector(".reset-traps").addEventListener("click", function () { sendMessage("resetTraps"); });
    menuElement.querySelector("#traps-menu-enabled").addEventListener("click", function (e) { sendMessage("setIsExtesionWorkOnPage", { isEnabled: e.target.checked }); });

    var trapListElement = menuElement.querySelector(".trap-list");
    trapListElement.addEventListener("click", iconClickDelegate);

    sendMessage("getTrapStorage", undefined, function (trapStorage) {
        trapManager = new TrapManager();
        console.log(`trapStorage ${JSON.stringify(trapStorage)}`);
        trapManager.trapStorage = trapStorage;
        refreshTrapsList();
    });
}