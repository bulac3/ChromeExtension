function Trap() {
    this.id = "";
    this.name = "";
    this.moves = "";
    this.winColor = "w";// w - trap for white win, b - for black win
};

function TrapStorage() {
    this.byId = {};
    this.hashTree = { "traps": [], "leafs": {}, "winColor": {"w": 0, "b": 0}};
};

function TrapManager(trapStorage) {
    this.trapStorage = trapStorage;
};

TrapManager.prototype.getTreeLevelId = function (move) {
    return `${move[0]}_${move[1]}`;
}

TrapManager.prototype.parseTreeLevelId = function (moveId) {
    return moveId.split("_");
}

TrapManager.prototype.addToTree = function (trap) {
    var currentLevel = this.trapStorage.hashTree;
    for(var i = 0; i < trap.moves.length; i++){
      var move = trap.moves[i];
      var id = this.getTreeLevelId(move);
      if(currentLevel.leafs[id] === undefined) {
          currentLevel.leafs[id] = { "traps": [], "leafs": {}, "winColor": {"w": 0, "b": 0}};
        currentLevel = currentLevel.leafs[id];
      } else {
        currentLevel = currentLevel.leafs[id];
      }
      currentLevel.winColor[trap.winColor]++;
    }
    currentLevel.traps.push(trap.id);
}

TrapManager.prototype.getTrapObject = function () {
    var chess = new Chess();
    var pgn = document.querySelector(".underboard .pgn textarea").value;
    chess.load_pgn(pgn);
    
    var trap = new Trap();
    trap.moves = this.getMovesFromChessObject(chess);    
    trap.id = this.generateTrapId(trap.moves);
    return trap;
};

TrapManager.prototype.getMovesFromChessObject = function (chess) {
    var pgn = chess.pgn();
    var lastMove = {};
    var lastMoves = [];
    var treeIds = [];
    while ((lastMove = chess.undo()) != null) {
        var fen = chess.fen();
        lastMoves.push([lastMove.from, lastMove.to]);
    }
    chess.load_pgn(pgn);
    lastMoves.reverse();
    return lastMoves;
};

TrapManager.prototype.saveTrapStorageAsJSON = function () {    
    var str = JSON.stringify(this.trapStorage, "");
    saveFile(str, "trap storage.json", "application/json");
};

TrapManager.prototype.generateTrapId = function (moves) {
    var id = "";
    for (var i = 0; i < moves.length; i++) {
        id += `${moves[i][0]}|${moves[i][1]}|`;
    }    
    return binMD5(id);
};

TrapManager.prototype.addTrap = function (trap) {
    this.trapStorage.byId[trap.id] = trap;
    this.addToTree(trap);    
    console.log(this.trapStorage);
    return true;
};

TrapManager.prototype.getTrap = function (id) {
    return this.trapStorage.byId[id];
};

TrapManager.prototype.getTrapIterateObject = function () {
    var traps = [];
    for (var id in this.trapStorage.byId) {
        if (this.trapStorage.byId.hasOwnProperty(id)) {
            traps.push(this.trapStorage.byId[id]);
        }
    }
    return traps;
};

TrapManager.prototype.saveStore = function (callback) {    
    var trapStorage = this.trapStorage;
    console.log("trapStorage");
    console.log(trapStorage);
    chrome.storage.local.set({ "trapStorage": trapStorage }, function (item) {
        console.log("trap storage saved");
        if (callback) {
            callback();
        }
    });
};

TrapManager.prototype.loadStore = function(callback) {
    var self = this;
    chrome.storage.local.get("trapStorage", function (item) {
        if (item && item.trapStorage) {
            self.trapStorage = item.trapStorage;
            console.log("load trap storage from sync");
        } else {
            self.trapStorage = initialTrapStorage;//new TrapStorage();
            console.log("load trap storage from file");
        }
        callback();
    });
};

TrapManager.prototype.editTrapName = function (id, name) {
    var trapStorage = this.trapStorage;
    var editedTrap = trapStorage.byId[id];
    editedTrap.name = name;
    this.saveStore();
}

TrapManager.prototype.deleteTrap = function (id) {
    var id = id;
    var trapStorage = this.trapStorage;
    var deletedTrap = trapStorage.byId[id];
    if (!deletedTrap) {
        return;
    }
    var previousLevels = [];
    var currentLevel = this.trapStorage.hashTree;
    for (var i = 0; i < deletedTrap.moves.length; i++) {
        var move = deletedTrap.moves[i];
        var treeLevelId = this.getTreeLevelId(move);
        if (currentLevel.leafs[treeLevelId] === undefined) {
            currentLevel = undefined;
            break;
        } else {
            previousLevels.push[currentLevel];
            currentLevel = currentLevel.leafs[treeLevelId];
        }
    }

    if (currentLevel) {
        for (var i = 0; i < currentLevel.traps.length; i++)
        if (currentLevel.traps[i] === id) {
            currentLevel.traps.splice(i, 1);
            break;
        }
        var winColor = deletedTrap.winColor;
        currentLevel.winColor[winColor]--;
    }
    delete trapStorage.byId[id];
    this.saveStore();
};

function binMD5(str) {
    return rstr2hex(rstr_md5(str2rstr_utf8(str)));
}

function saveFile(text, filename) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}