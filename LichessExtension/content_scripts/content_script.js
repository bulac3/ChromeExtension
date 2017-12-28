const dimention = 8;
var elementWidth = 64;
var currentFen = "";
var board = {};
var trapManager = new TrapManager();
var timerId = null;
var analisPage = false;
var getBoardAttempts = 0;
var getBoardAttemptsMax = 20;

function Line(x1, y1, x2, y2, color) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.hash = this.getHash();
}

Line.prototype.getHash = function() {
    return this.x1 + this.y1 + this.x2 + this.y2 + this.color;
}

/////////////// API
var handleMessage = function(request, sender, sendResponse) { };

/////////////// board read functions
function getBoard() {
    var elem = document.querySelector(".cg-board-wrap.manipulable");
    if(elem) {
        return elem.parentElement
    }
    return null;
}

function getCurrentChessObject() {
    var chess = new Chess();
    if (analisPage) {
        var pgn = document.querySelector(".underboard .pgn textarea").value;
        chess.load_pgn(pgn);
    } else {
        var moves = document.querySelectorAll(".moves > move");
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].lastChild.textContent) {
                chess.move(moves[i].lastChild.textContent.replace("х", "x"), { sloppy: true });
            }
        }
    }
    return chess;
}

function drawLine(x1, y1, x2, y2, color) {
    var x1px = (x1 + 0.5) * elementWidth;
    var x2px = (x2 + 0.5) * elementWidth;
    var y1px = (y1 + 0.5) * elementWidth;
    var y2px = (y2 + 0.5) * elementWidth;

    var svg = document.querySelector(".cg-board-wrap.manipulable").querySelector("svg");
    var defs = svg.querySelector("defs");
    var existMarker = defs.querySelector("#arrowhead-pb");
    if (existMarker == null) {
        var marker = `<marker id="arrowhead-pb" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01" cgkey="pb"><path d="M0,0 V4 L3,2 Z" fill="${color}"></path></marker>`;
        defs.innerHTML = defs.innerHTML + marker;
    }
    var line = `<line stroke="${color}" stroke-width="15" stroke-linecap="round" marker-end="url(#arrowhead-pb)" opacity="0.4" x1="${x1px}" y1="${y1px}" x2="${x2px}" y2="${y2px}" cghash="d2d4paleBlue1"></line>`;
    svg.innerHTML = svg.innerHTML + line;
}

function clearLines() {
    var svg = document.querySelector(".cg-board-wrap.manipulable").querySelector("svg");
    var lines = svg.querySelectorAll("line");
    
    for (var i = 0; i < lines.length; i++) {
        lines[i].parentElement.removeChild(lines[i]);
    }
}

function drawLines(moveLines) {
    for (var i = 0; i < moveLines.length; i++) {
        var line = moveLines[i];
        drawLine(line.x1, line.y1, line.x2, line.y2, line.color);
    }
}

function getVertical(cellString) {
    return cellString.charCodeAt(0) - 97;
}

function getHorizontal(cellString) {
    return cellString.charCodeAt(1) - 49;
}

function mirrorRevert(i) {
    return Math.abs(7 - i);
}

function isBoardOrientationWhite() {
    return board.querySelector(".orientation-white") != null;
}

function convertMoveToLine(move) {
    var line = new Line();
    line.x1 = getVertical(move[0]);
    line.y1 = getHorizontal(move[0]);
    line.x2 = getVertical(move[1]);
    line.y2 = getHorizontal(move[1]);
    line.color = "#003088";
    var trapsForWhitePlayer = isBoardOrientationWhite();
    if (trapsForWhitePlayer) {
        line.y1 = mirrorRevert(line.y1);
        line.y2 = mirrorRevert(line.y2);
    }
    else {
        line.x1 = mirrorRevert(line.x1);
        line.x2 = mirrorRevert(line.x2);
    }
    return line;
}

function getMoveLinesFromMoves(trapStorage, moves, colorToWin) {
    var moveLines = [];
    var currentLevel = trapStorage.hashTree;
    for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        var moveId = trapManager.getTreeLevelId(move);
        if(currentLevel.leafs[moveId]){
            currentLevel = currentLevel.leafs[moveId];
        } else {
            currentLevel = undefined;
            break;
        }
    }

    if (currentLevel && currentLevel.leafs){
        for (var prop in currentLevel.leafs) {
            var nextMove = trapManager.parseTreeLevelId(prop);
            if (currentLevel.leafs[prop].winColor[colorToWin] == 0) {
                continue;
            }
            var line = convertMoveToLine(nextMove);
            var alreadyContain = moveLines.some(function (currentValue, index, array) {
                return currentValue.hash == line.hash;
            })
            if (!alreadyContain) {
                moveLines.push(line);
            }
        }
    }
    return moveLines;
}

function getUserColor() {
    var flipButton = document.querySelector("button.flip");
    var isWhiteOrientation = isBoardOrientationWhite();
    if (analisPage || !flipButton || !flipButton.classList.contains("active")) {
        return isWhiteOrientation ? "w" : "b";
    } else {
        isWhiteOrientation ? "b" : "w";
    }
}

function timerDrawTraps(trapManager) {
    var chess = getCurrentChessObject();
    var moves = trapManager.getMovesFromChessObject(chess);
    var fen = chess.fen();
    if (fen != currentFen) {
        currentFen = fen;
        clearLines();
        var colorToWin = getUserColor();
        var moveLines = getMoveLinesFromMoves(trapManager.trapStorage, moves, colorToWin);
        if (!moveLines) {
            return;
        }
        drawLines(moveLines);
    }
}

var searchBoardTimer = setInterval(searchBoard, 500);

function searchBoard() {
    board = getBoard();
    if (board != null) {
        clearInterval(searchBoardTimer);
        main();
    }
    if (++getBoardAttempts > getBoardAttemptsMax) {
        clearInterval(searchBoardTimer);
        console.log("board not found")
    }
}

function main() {
    board = getBoard();
    elementWidth = board.clientWidth / dimention;    
    console.log("load store");
    trapManager.loadStore(afterTrapManagerLoaded);

    function afterTrapManagerLoaded() {
        if (!trapManager.trapStorage) {
            alert("Load trap storage error.")
            return; 
        }
        analisPage = document.URL.startsWith("https://lichess.org/analysis");

        console.log("store loaded");
        console.log(trapManager.trapStorage);

        console.log("set listener");
        var messageCallbacks = {
            "addTrap": onAddTrapMessage,
            "deleteTrap": onDeleteTrapMessage,
            "saveTraps": onSaveTrapsMessage,
            "saveTrapsToFile": onSaveTrapsToFileMessage,
            "getTrapStorage": onGetTrapStorageMessage,
            "getIsExtesionWorkOnPage": onGetIsExtesionWorkOnPageMessage,
            "setIsExtesionWorkOnPage": onSetIsExtesionWorkOnPageMessage,
            "resetTraps": onResetTrapsMessage,
        }

        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                console.log(`receive message with action ${request.action}: \n${JSON.stringify(request)}`);
                handleMessage(request, sender, sendResponse)
            }
        );

        handleMessage = function(request, sender, sendResponse) {
            if (messageCallbacks[request.action]) {
                messageCallbacks[request.action](request.parameters, sender, sendResponse);
            } else {
                console.error(`unrecognizes action ${request.action}: \n${JSON.stringify(request)}`);
            }
        }
        
        initExtensionOnPage();

        function onAddTrapMessage(parameters, sender, sendResponse) {
            var trap = trapManager.getTrapObject();
            var trapName = prompt("Enter trap name. Leave blank to avoid saving.");
            if (!trapName) {
                alert("Saving canseled by user.");
                return;
            }
            var incorrectAnswer = true;
            while(incorrectAnswer) {
                var color = prompt("Enter winnig side from this combination. ('w' - white, 'b' - black)");
                if (!color) {
                    alert("Saving canseled by user.");
                    return;
                }
                if (color != "w" && color != "b") {
                    alert("Incorrect color. Enter 'w', 'b' or press cancel button");
                } else {
                    trap.winColor = color;
                    incorrectAnswer = false;
                }
            }
            trap.name = trapName;
            var resultAdding = trapManager.addTrap(trap);
            trapManager.saveStore();
            if (resultAdding) {
                console.log("trapStorage json");
                console.log(trapManager.trapStorage);
                console.log(JSON.stringify(trapManager.trapStorage))
                sendResponse(true);
                alert("Trap added.");
            } else {
                sendResponse(false);
                alert("Trap not added. Same trap already exist.");
            }
        }

        function onDeleteTrapMessage(parameters, sender, sendResponse) {
            var id = parameters.id;
            trapManager.deleteTrap(id);
        }

        function onSaveTrapsMessage(parameters, sender, sendResponse) {
            var trap = trapManager.saveStore(function () {
                alert("Traps updated.");
            });
        }

        function onSaveTrapsToFileMessage(parameters, sender, sendResponse) {
          trapManager.saveTrapStorageAsJSON();
        }

        function onGetTrapStorageMessage(parameters, sender, sendResponse) {
            sendResponse(trapManager.trapStorage);
        }

        function onGetIsExtesionWorkOnPageMessage(parameters, sender, sendResponse) {
            sendResponse(timerId != null);
        }

        function onSetIsExtesionWorkOnPageMessage(parameters, sender, sendResponse) {
            if (parameters.isEnabled) {
                currentFen = "";
                runExtensionOnPage();
            } else {
                stopExtensionOnPage();
            }
        }

        function initExtensionOnPage() {
            getRecourceFileContent("content_scripts/traps.html", function (cont) {
                var menuContainer = document.createElement("div");
                menuContainer.innerHTML = cont;
                document.getElementsByClassName("lichess_ground")[0].appendChild(menuContainer);
                initMenuJsCode();
                runExtensionOnPage();
            });
        }

        function runExtensionOnPage() {
            if (timerId == null) {
                timerId = setInterval(function () {
                    timerDrawTraps(trapManager);
                }, 500)
            }
        }

        function stopExtensionOnPage() {
            clearInterval(timerId);
            timerId = null;
            clearLines();
        }

        function onResetTrapsMessage(parameters, sender, sendResponse) {
            var answer = confirm(`Are you sure you want reset all traps?`);
            if (answer) {
                chrome.storage.local.set({ "trapStorage": initialTrapStorage }, function () {
                    Object.assign(trapManager.trapStorage, initialTrapStorage);
                    alert("Traps reseted.");
                });
            }
        }

        function onReloadTrapsMessage(parameters, sender, sendResponse) {
            trapManager.loadStore(function () {
                alert("Store reloaded");
            });
        }

        function getRecourceFileContent(name, callback) {// function callback(content)
            function reqListener() {
                callback(this.responseText);
            }
            var url = chrome.runtime.getURL(name);
            var req = new XMLHttpRequest();
            req.onload = reqListener;
            req.open("get", url, true);
            req.send();
        }


        console.log(getCurrentChessObject().ascii());
        console.log(getCurrentChessObject());

        document.onkeydown = function (e) {
            if ((e.ctrlKey && e.altKey && e.keyCode == 'E'.charCodeAt(0))) {
                testFunction();
                return false;
            }
        };

        function testFunction() {
            //getRecourceFileContent("content_scripts/traps.html", function (cont) { alert(cont); });
        }
    }
}



//function reqListener() {
//    console.log(this.responseText);
//}

//var oReq = new XMLHttpRequest();
//oReq.onload = reqListener;
//oReq.open("get", "yourFile.txt", true);
//oReq.send();