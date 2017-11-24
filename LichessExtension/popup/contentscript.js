//"use strict"
//import Chess from './chess';
(function () {

    chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
        
    });
    return;

    /////////////// trap manager
    function Trap() {
        this.id = "";
        this.name = "";
        this.fens = {};
        this.fensOrder = [];
        this.finalFen = "";
    };

    function TrapStorage() {
        this.byId = {};
        this.byfen = {};
    }

    function TrapManager(trapStorage) {
        this.trapStorage = trapStorage;
    }

    TrapManager.prototype.getTrapObject = function () {
        var chess = new Chess();
        var pgn = document.querySelector(".underboard .pgn textarea").value;
        chess.load_pgn(pgn);

        var trap = new Trap();
        trap.finalFen = chess.fen();
        var lastMove = {};
        var fensRevense = [];
        while ((lastMove = chess.undo()) != null) {
            var fen = chess.fen();
            trap.fens[fen] = lastMove;
            trap.fensOrder.push(fen);
            lastMovesReverse.push(lastMove);
        }
        trap.fensOrder.reverse();

        return trap;
    }

    TrapManager.prototype.generateTrapId = function (chess) {
        var lastMoves = [];
        lastMoves.reverse();
        var id = "";
        for (var i = 0; i < lastMoves.length; i++) {
            id += lastMoves[i].from + lastMoves[i].to;
        }
        return id;
    }

    TrapManager.prototype.addTrap = function (trap) {
        if (this.trapStorage.byId[trap.id] != undefined) {
            return;
        }
        this.trapStorage.byId[trap.id] = trap;
        for (var fen in fens) {
            if (this.trapStorage.byfen[fen] != undefined) {
                this.trapStorage.byfen[fen].push(trap.id);
            } else {
                this.trapStorage.byfen[fen] = [trap.id]
            }
        }
    }
    ///////////////


    function Cord(x, y) {
        this.x = x;
        this.y = y;
    }

    function getBoard() {
        return document.querySelector(".lichess_board .cg-board").parentElement;
    }

    var board = getBoard();
    const dimention = 8;
    var elementWidth = board.clientWidth / dimention;

    function drawLineByCoords(fromCoord, toCoord) {
        drawLine(fromCoord.x, fromCoord.y, toCoord.x, toCoord.y);
    }

    function drawLine(x1, y1, x2, y2) {
        var x1px = (x1 + 0.5) * elementWidth;
        var x2px = (x2 + 0.5) * elementWidth;
        var y1px = (y1 + 0.5) * elementWidth;
        var y2px = (y2 + 0.5) * elementWidth;

        var svg = board.querySelector("svg");
        var defs = svg.querySelector("defs");
        var existMarker = defs.querySelector("#arrowhead-pb");
        if (existMarker == null) {
            const marker = '<marker id="arrowhead-pb" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01" cgkey="pb"><path d="M0,0 V4 L3,2 Z" fill="#003088"></path></marker>'
            defs.innerHTML = defs.innerHTML + marker;
        }
        var line = '<line stroke="#003088" stroke-width="15" stroke-linecap="round" marker-end="url(#arrowhead-pb)" opacity="0.4" x1="' + x1px + '" y1="' + y1px + '" x2="' + x2px + '" y2="' + y2px + '" cghash="d2d4paleBlue1"></line>';
        svg.innerHTML = svg.innerHTML + line;
    }

    function clearLines() {
        var svg = board.querySelector("svg");
        var lines = svg.querySelectorAll("line");
        for (var i = 0; i < lines.length; i++) {
            lines[i].parentElement.removeChild(lines[i]);
        }
    }

    //drawLine(1, 1, 2, 3);
    //var from = new Cord(1,1);
    //var to = new Cord(3,3);
    //drawLineByCoords(from, to);

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

    console.log(getCurrentChessObject().ascii());

    //chrome.storage.sync.set({ "trapStorage": trapStorage }, function(){
    //    //  A data saved callback omg so fancy
    //});

    //chrome.runtime.sendMessage({
    //    action: "boardFind",
    //    isFound: findBoard()
    //});
})()