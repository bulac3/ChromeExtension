// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

var pieceCodes = {
    pawn: { white: "P", black: "p" },
    bishop: { white: "B", black: "b" },
    knight: { white: "N", black: "n" },
    rook: { white: "R", black: "r" },
    queen: { white: "Q", black: "q" },
    king: { white: "K", black: "k" }
};
var whiteCodes = "PBNRQK";

function getEncodedPosition() {
    var board = document.querySelector(".lichess_board .cg-board");
    if (board == null) {
        return;
    }

    const dimention = 8;
    const positionArray = Array(dimention * dimention).fill("_");

    var elementWidth = board.clientWidth / dimention;
    var pieceNames = ["pawn", "bishop", "knight", "rook", "queen", "king"];
    var colors = ["white", "black"];

    for (var piece in pieceCodes) {
        for (var color in colors) {
            var pieceElements = board.querySelectorAll(`.${piece}.${color}`);
            for (var element in pieceElements) {
                var index = elementTransformToIndex(element);
                positionArray[index] = pieceCodes[piece][color];
            }            
        }
    };

    var lastMoves = board.querySelectorAll("square.last-move");
    var pieceCode = positionArray[elementTransformToIndex(lastMoves[0])];
    if (pieceCode == "_") {
        pieceCode = positionArray[elementTransformToIndex(lastMoves[1])];
    }

    var moveCharacter = whiteCodes.includes(pieceCode) ? "w" : "b";
    var position = positionArray.join() + moveCharacter;        
    return position;
}

function getPieceElements(doc) {
    const regExp = /-?[\d\.]+/g;
    var transform = elem.style.transform.match(regExp);
    var x = transform[0];
    var y = transform[1];

    return (x / elementWidth * dimention) + y / elementWidth;
}

function elementTransformToIndex(elem) {
    const regExp = /-?[\d\.]+/g;
    var transform = elem.style.transform.match(regExp);
    var x = transform[0];
    var y = transform[1];

    return (x / elementWidth * dimention) + y / elementWidth;
}

chrome.runtime.sendMessage({
    action: "boardFind",
    isFound: findBoard()
});