class Database {

    private db: any;

    public static databaseName: string = "TileDB";
    public static databaseVersion: number = 1;
    public static isSupportedByBrowser = true;

    constructor() {
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

        if (!window.indexedDB) {
            console.log("Browser doesn't support a stable version of IndexedDB");
            return;
        }
    }

    public initalizeDB(): Promise<{}>
    {
        return new Promise(
            (resolve, reject) => {
                var request = window.indexedDB.open(Database.databaseName, Database.databaseVersion);

                request.onerror = (evt) => {
                    console.log("error: couldn't open IndexedDB");
                    reject("error: couldn't open IndexedDB");
                }
                request.onsuccess = (evt) => {
                    this.db = request.result;
                    console.log("success: " + this.db);

                    resolve(request.result);
                }
                request.onupgradeneeded = (evt) => {
                    var db = evt.target.result;
                    var objectStore = db.createObjectStore("Tile", { keyPath: "id", autoIncrement: true });
                }
            });
    }

    public addTile(tile: any): Promise<any>
    {
        return new Promise((resolve, reject) => {
            tile.id = tile.tileX + "-" + tile.tileY + "-" + tile.zoom;
            var request = this.db.transaction(["Tile"], "readwrite")
                .objectStore("Tile")
                .add(tile);

            request.onsuccess = () => {
                resolve("Successully added record: " + tile.id);
            };
            request.onerror = () => {
                reject("Couldn't add record: " + tile.id);
            };
        })
    }

    public getTile(id: string): Promise<{}>
    {
        return new Promise((resolve, reject) => {
            var request = this.db.transaction(["Tile"], "readonly")
                .objectStore("Tile")
                .get(id);

            request.onsuccess = () => {
                 resolve(request.result);
            };
            request.onerror = () => {
                reject("Couldn't get record: " + id);
            };
        })
    }

    public removeTile(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            var request = this.db.transaction(["Tile"], "readwrite")
                .objectStore("Tile")
                .delete(id);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject("Couldn't delete record: " + id);
            };
        })
    }
}