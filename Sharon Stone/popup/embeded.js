import Chess from './chess';

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

function getEncodedPosition() {
    var pieceCodes = {
        pawn: { white: "P", black: "p" },
        bishop: { white: "B", black: "b" },
        knight: { white: "N", black: "n" },
        rook: { white: "R", black: "r" },
        queen: { white: "Q", black: "q" },
        king: { white: "K", black: "k" }
    };
    
    const positionArray = Array(dimention * dimention).fill("_");

    var pieceNames = ["pawn", "bishop", "knight", "rook", "queen", "king"];
    var colors = { "white": null, "black": null };

    function isWhite(pieceCode) {
        const whiteCodes = "PBNRQK";
        return whiteCodes.includes(pieceCode);
    }

    function getPieceElements(doc) {
        const regExp = /-?[\d\.]+/g;
        var transform = elem.style.transform.match(regExp);
        var x = transform[0];
        var y = transform[1];

        return (x / elementWidth * dimention) + y / elementWidth;
    }

    function getElementCoords(elem) {
        const regExp = /-?[\d\.]+/g;
        var transform = elem.style.transform.match(regExp);
        var x = transform[0];
        var y = transform[1];
        return new Cord(x, y);
    }

    function elementTransformToIndex(elem) {
        var coords = getElementCoords(elem);

        return coords.x / elementWidth + (coords.y / elementWidth * dimention);
    }

    for (var piece in pieceCodes) {
        for (var color in colors) {
            var pieceElements = board.querySelectorAll(`.${piece}.${color}`);
            for (var i = 0; i < pieceElements.length; i++) {
                var index = elementTransformToIndex(pieceElements[i]);
                positionArray[index] = pieceCodes[piece][color];
            }
        }
    };

    var lastMoves = board.querySelectorAll("square.last-move");
    var moveCharacter;
    if (lastMoves.length == 0) {
        moveCharacter = "w";
    } else {
        var pieceCode = positionArray[elementTransformToIndex(lastMoves[0])];
        console.log
        if (pieceCode == "_") {
            pieceCode = positionArray[elementTransformToIndex(lastMoves[1])];
            moveCharacter = isWhite(pieceCode) ? "b" : "w";
        }
        else {
            var coords0 = getElementCoords(lastMoves[0]);
            var coords1 = getElementCoords(lastMoves[1]);
            var xMultiply = coords0.x * coords1.x;
            if ((coords0.y == 7 && coords1.y == 7) && (xMultiply == 0 || xMultiply == 28)) {
                moveCharacter = "b";
            }
            if ((coords0.y == 0 && coords1.y == 0) && (xMultiply == 0 || xMultiply == 28)) {
                moveCharacter = "w";
            }
        }
    }
    var position = positionArray.join("") + moveCharacter;
    return position;
}

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

function getPGN() {
    return document.querySelector(".underboard .pgn textarea").value;
}

//drawLine(1, 1, 2, 3);
//var from = new Cord(1,1);
//var to = new Cord(3,3);
    //drawLineByCoords(from, to);

var moves = document.querySelectorAll(".tview2.inline > move");


document.querySelector(".tview2.inline").addEventListener("DOMSubtreeModified",
    function () {
        console.log("interceped" + Date())
    }   
)

var chess = new Chess();
chess.load_pgn(getPGN());

var trap = {
    name: "",
    fens: {},
    finalFen: chess.fen()
};
var lastMove = {};
while((lastMove = chess.undo()) != null) {
    fens[chess.fen()] = lastMove;
}



//chrome.runtime.sendMessage({
//    action: "boardFind",
//    isFound: findBoard()
//});