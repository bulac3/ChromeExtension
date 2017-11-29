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

TrapManager.prototype.saveStore = function (callback) {    
    var trapStorage = this.trapStorage;
    console.log("trapStorage");
    console.log(trapStorage);
    chrome.storage.sync.set({ "trapStorage": trapStorage }, function (item) {
        console.log("trap storage saved");
        callback();
    });
};

TrapManager.prototype.loadStore = function(callback) {
    var self = this;
    chrome.storage.sync.get("trapStorage", function (item) {
        if (item && item.trapStorage) {
            self.trapStorage = item.trapStorage;
            console.log("load trap storage from sync");
        } else {
            self.trapStorage = initialTrapStorage;//new TrapStorage();//;
            console.log("load trap storage from file");
        }
        callback();
    });
};

TrapManager.prototype.saveStore = function (callback) {    
    var trapStorage = this.trapStorage;
    console.log("trapStorage");
    console.log(trapStorage);
    chrome.storage.sync.set({ "trapStorage": trapStorage }, function (item) {
        console.log("trap storage saved");
        callback();
    });
};

TrapManager.prototype.deleteTrap = function (id) {
    var id = id;
    var trapStorage = this.trapStorage;
    var deletedTrap = trapStorage.byId[id];
    for (var i = 0; i < deletedTrap.fensOrder.length; i++) {
        var fen = deletedTrap.fensOrder[i];
        var index = trapStorage.idByFen[fen].indexOf(id);
        if (index > -1) {
            trapStorage.idByFen[fen].splice(index, 1);
        }
    }
    delete trapStorage.byId[id];
};