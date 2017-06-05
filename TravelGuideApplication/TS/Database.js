var Database = (function () {
    function Database() {
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        if (!window.indexedDB) {
            console.log("Browser doesn't support a stable version of IndexedDB");
            return;
        }
    }
    Database.prototype.initializeDB = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var request = window.indexedDB.open(Database.databaseName, Database.databaseVersion);
            request.onerror = function (evt) {
                console.log("error: couldn't open IndexedDB");
                reject("error: couldn't open IndexedDB");
            };
            request.onsuccess = function (evt) {
                _this.db = request.result;
                console.log("success: " + _this.db);
                resolve(request.result);
            };
            request.onupgradeneeded = function (evt) {
                var db = evt.target.result;
                var objectStore = db.createObjectStore("Tile", { keyPath: "id", autoIncrement: true });
            };
        });
    };
    Database.prototype.addTile = function (tile) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            tile.id = tile.tileX + "-" + tile.tileY + "-" + tile.zoom;
            var request = _this.db.transaction(["Tile"], "readwrite")
                .objectStore("Tile")
                .add(tile);
            request.onsuccess = function () {
                resolve("Successully added record: " + tile.id);
            };
            request.onerror = function () {
                reject("Couldn't add record: " + tile.id);
            };
        });
    };
    Database.prototype.getTile = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var request = _this.db.transaction(["Tile"], "readonly")
                .objectStore("Tile")
                .get(id);
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject("Couldn't get record: " + id);
            };
        });
    };
    Database.prototype.removeTile = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var request = _this.db.transaction(["Tile"], "readwrite")
                .objectStore("Tile")
                .delete(id);
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject("Couldn't delete record: " + id);
            };
        });
    };
    Database.databaseName = "TileDB";
    Database.databaseVersion = 1;
    Database.isSupportedByBrowser = true;
    return Database;
})();
//# sourceMappingURL=Database.js.map