const dimention = 8;
var elementWidth = 64;
var currentFen = "";
var board = {};
var timerId = null;


function Cord(x, y) {
    this.x = x;
    this.y = y;
}

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

/////////////// board read functions
function getBoard() {
    return document.querySelector(".cg-board-wrap").parentElement;
}

function getCurrentChessObject() {
    var moves = document.querySelectorAll(".moves > move");
    var chess = new Chess();
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].lastChild.textContent) {
            chess.move(moves[i].lastChild.textContent.replace("х", "x"),
                { sloppy: true });
        }
    }
    return chess;
}
/////////////// board write functions
//function drawLineByCoords(fromCoord, toCoord) {
//    drawLine(fromCoord.x, fromCoord.y, toCoord.x, toCoord.y);
//}

function drawLine(x1, y1, x2, y2, color) {
    var x1px = (x1 + 0.5) * elementWidth;
    var x2px = (x2 + 0.5) * elementWidth;
    var y1px = (y1 + 0.5) * elementWidth;
    var y2px = (y2 + 0.5) * elementWidth;

    var svg = document.querySelector(".cg-board-wrap").querySelector("svg");
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
    var svg = document.querySelector(".cg-board-wrap").querySelector("svg");
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

}

function convertMoveToLine(move) {
    var line = new Line();
    line.x1 = getVertical(move.from);
    line.y1 = getHorizontal(move.from);
    line.x2 = getVertical(move.to);
    line.y2 = getHorizontal(move.to);
    line.color = "#003088";
    var trapsForWhitePlayer = getBoard().querySelector(".orientation-white") != null;
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

function getMoveLines(trapStorage, fen) {
    var moveLines = [];
    var traps = trapStorage.idByFen[fen];
    if (!traps || !traps.length) {
        return false;
    }
    for (var i = 0; i < traps.length; i++) {
        var trap = trapStorage.byId[traps[i]];
        var nextMove = trap.nextMoveByFen[fen];
        var line = convertMoveToLine(nextMove);
        var alreadyContain = moveLines.some(function (currentValue, index, array) {
            currentValue.hash == line.hash;
        })
        if (!alreadyContain) {
            moveLines.push(line);
        }        
    }
    return moveLines;
}

function timerDrawTraps(trapManager) {
    var chess = getCurrentChessObject();
    var fen = chess.fen();
    if (fen != currentFen) {
        clearLines();
        var moveLines = getMoveLines(trapManager.trapStorage, fen);        
        if (!moveLines) {
            return;
        }
        drawLines(moveLines);
    }
}
/////////////// trap manager
function Trap() {
    this.id = "";
    this.name = "";
    this.nextMoveByFen = {};
    this.fensOrder = [];
    this.finalFen = "";
    this.pgn = "";
    this.moves = "";
    this.winColor = "w";// w - trap for white win, b - for black win
};

function TrapStorage() {
    this.byId = {};
    this.idByFen = {};
};

function TrapManager(trapStorage) {
    this.trapStorage = trapStorage;
};

TrapManager.prototype.getTrapObject = function () {
    var chess = new Chess();
    var pgn = document.querySelector(".underboard .pgn textarea").value;
    chess.load_pgn(pgn);

    var trap = new Trap();
    trap.pgn = pgn;
    trap.finalFen = chess.fen();
    var lastMove = {};
    var fensRevense = [];
    var lastMoves = [];
    while ((lastMove = chess.undo()) != null) {
        var fen = chess.fen();
        trap.nextMoveByFen[fen] = lastMove;
        trap.fensOrder.push(fen);
        lastMoves.push(lastMove);
    }
    trap.fensOrder.reverse();
    lastMoves.reverse();
    trap.id = this.generateTrapId(lastMoves);
    trap.moves = lastMoves;
    return trap;
};

TrapManager.prototype.generateTrapId = function (moves) {
    var id = "";
    for (var i = 0; i < moves.length; i++) {
        id += `${moves[i].from}|${moves[i].to}|`;
    }
    return id;
};

TrapManager.prototype.addTrap = function (trap) {

    console.log("trap.id " + trap.id);    
    if (this.trapStorage.byId[trap.id] != undefined) {
        return false;
    }
    this.trapStorage.byId[trap.id] = trap;
    for (var fen in trap.fensOrder) {
        console.log("fen");
        console.log(trap.fensOrder[fen]);
        if (this.trapStorage.idByFen[trap.fensOrder[fen]] != undefined) {
            this.trapStorage.idByFen[trap.fensOrder[fen]].push(trap.id);
        } else {
            this.trapStorage.idByFen[trap.fensOrder[fen]] = [trap.id]
        }
    }
    console.log(this.trapStorage);
    return true;
};

TrapManager.prototype.loadStore = function(callback) {
    var self = this;
    chrome.runtime.sendMessage({ action: "getTrapStorage" }, function (response) {
        chrome.storage.local.get("trapStorage", function (item) {
            //alert("item");
            //alert(JSON.stringify(item));
            if (item && item.byId) {
                self.trapStorage = item;
                alert("from storager");
            } else {
                self.trapStorage = initialTrapStorage;//new TrapStorage();//;
                alert("init from file");
            }
            callback();
        });
    });
};
///////////////


(function onLoad() {
    board = getBoard();
    if (board == null) {
        return;
    }
    elementWidth = board.clientWidth / dimention;    
    var trapManager = new TrapManager();
    console.log("load store");
    trapManager.loadStore(afterTrapManagerLoaded);

    function afterTrapManagerLoaded() {
    if (!trapManager.trapStorage) {
        alert("Load trap storage error.")
        return;
    }
    console.log("store loaded");
    console.log(trapManager.trapStorage);        

    console.log("set listenert");
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(`receive message with action ${request.action}: \n${JSON.stringify(request)}`);
            if (request.action == "addTrap") {
                onAddTrapMessage(trapManager);
            } else if (request.action == "getTrapStorage") {
                sendResponse(trapManager.trapStorage);
            } else if (request.action == "getIsExtesionWorkOnPage") {
                sendResponse(timerId != null);
            } else if (request.action == "setIsExtesionWorkOnPage") {
                if (request.isEnabled) {
                    runExtensionOnPage();
                } else {
                    stopExtensionOnPage();
                }
            }
        }
    );

    runExtensionOnPage();

    function onAddTrapMessage(trapManager) {
        var trap = trapManager.getTrapObject();
        var trapName = prompt("Enter trap name. Leave blank to avoid saving.");
        if (!trapName) {
            alert("Saving canceled by user.");
            return;
        }
        trap.name = trapName;
        var resultAdding = trapManager.addTrap(trap);
        if (resultAdding) {
            console.log("trapStorage json")
            console.log(JSON.stringify(trapManager.trapStorage))
            alert("Trap added.");
        } else {
            alert("Trap not added. Same trap already exist.");
        }
    }

    function onAddTrapMessage(trapManager) {
        var trap = trapManager.getTrapObject();
        var trapName = prompt("Enter trap name. Leave blank to avoid saving.");
        if (!trapName) {
            alert("Saving canseled by user.");
            return;
        }
        trap.name = trapName;
        var resultAdding = trapManager.addTrap(trap);
        if (resultAdding) {
            console.log("trapStorage json")
            console.log(JSON.stringify(trapManager.trapStorage))
            alert("Trap added.");
        } else {
            alert("Trap not added. Same trap already exist.");
        }
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

    //drawLine(1, 1, 2, 3);
    //var from = new Cord(1,1);
    //var to = new Cord(3,3);
    //drawLineByCoords(from, to);

    console.log(getCurrentChessObject().ascii());

    //chrome.storage.local.set({ "trapStorage": trapStorage }, function(){
    //    //  A data saved callback omg so fancy
    //});

    //chrome.runtime.sendMessage({
    //    action: "boardFind",
    //    isFound: findBoard()
    //});
    }
})()

