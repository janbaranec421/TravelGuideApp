class Map {
    private root: JQuery;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    public mainPage: MainPage;
    public database: Database;
    private mapStyler: MapStyler;
    private mapPanel: MapSearchingPanel;
    private mapData: Array<MapTile> = [];
    private placeMark: { latitude: number, longitude: number, positionX: number, positionY: number, width: number, height: number, touchRadius: number };
    private routeMarks: { latitude: number, longitude: number, positionX: number, positionY: number, width: number, height: number, touchRadius: number }[] = [];

    private tileWidth: number;
    private tileHeight: number;
    private mapWidth: number;
    private mapHeight: number;

    private labelsCanvas: HTMLCanvasElement;
    private labelsContext: CanvasRenderingContext2D;

    private initialDrawTileNumber = 0;

    // Properties of the Tile in center
    public currentLatitude: number;
    public currentLongitude: number;
    public currentTileX: number;
    public currentTileY: number;

    public currentRoute: any;
    private _currentZoom: number;
    public currentLayers: Layer;

    get currentZoom(): number {
        return this._currentZoom;
    };

    set currentZoom(zoom: number) {
        if (zoom > 20) { this._currentZoom = 20; }
        else if (zoom < 2) { this._currentZoom = 2 }
        else { this._currentZoom = zoom; }
    }


    constructor(page: MainPage, tileWidth: number = 200, tileHeight: number = 200, mapWidth: number = 700, mapHeight = 700) {
        this.mainPage = page;
        this.root = $("#map");

        if (this.root == null)
            console.log("Failure: Element with ID \"map\" not found!")

        // width and height MUST be set through attribute 
        // AND NOT BY css property n order to stop streching canvas incorrectly
        $(this.root)
            .append($("<canvas>")
                .attr("id", "mapCanvas")
                .attr("width", mapWidth + "px")
                .attr("height", mapHeight + "px")
                .css({
                    "width": "100%",
                    "height": "calc(100vh - 55px)",
                    "display": "block",
                    "padding": "0px",
                }))
            .append($("<canvas>")
                .attr("id", "mapCanvasLabels")
                .attr("width", mapWidth + "px")
                .attr("height", mapHeight + "px")
                .css({
                    "width": "100%",
                    "height": "calc(100vh - 55px)",
                    "display": "block",
                    "padding": "0px",
                    "position": "absolute",
                    "top": "0px",
                    "left": "0px"
                }))

            .append($("<img>", { "id": "mapPlusButton", "src": "./Resources/plus.png" })
                .on("click", (evt) => {
                    var coords = this.getCoordinatesAtCenter();
                    this.displayPlace(coords.latitude, coords.longitude, (this.currentZoom += 1), this.currentLayers);
                }))
            .append($("<img>", { "id": "mapMinusButton", "src": "./Resources/minus.png" })
                .on("click", (evt) => {
                    var coords = this.getCoordinatesAtCenter();
                    this.displayPlace(coords.latitude, coords.longitude, (this.currentZoom -= 1), this.currentLayers);
                }));

        this.canvas = <HTMLCanvasElement>document.getElementById('mapCanvas');
        this.context = this.canvas.getContext('2d');

        this.labelsCanvas = <HTMLCanvasElement>document.getElementById('mapCanvasLabels');
        this.labelsContext = this.labelsCanvas.getContext('2d');

        this.mapStyler = new MapStyler();
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    public setMapDimensions(mapWidth: number, mapHeight: number) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }

    public setMapSearchingPanel(mapPanel: MapSearchingPanel) {
        this.mapPanel = mapPanel;
    }

    public displayPlace(latitude: number, longitude: number, zoom: number, layers: Layer, mark: boolean = false) {
        this.clearCanvas();
        this.mapData = [];

        // [X,Y] Position in map tiles scope
        this.currentZoom = zoom;
        this.currentTileX = Converter.long2tileX(longitude, this.currentZoom);
        this.currentTileY = Converter.lat2tileY(latitude, this.currentZoom);
        this.currentLatitude = latitude;
        this.currentLongitude = longitude;
        this.currentLayers = layers;

        // Variables to calculate centerX, centerY
        var boundingBox = Converter.tile2boundingBox(this.currentTileX, this.currentTileY, this.currentZoom);
        var xScale = this.tileWidth / Math.abs(boundingBox.xMax - boundingBox.xMin);
        var yScale = this.tileHeight / Math.abs(boundingBox.yMax - boundingBox.yMin);
        var scale = xScale < yScale ? xScale : yScale;
        var point = {
            x: (longitude - boundingBox.xMin) * xScale,
            y: (boundingBox.yMax - latitude) * yScale
        };
        // [X,Y] Position of Tile on canvas element
        var centerX = (this.mapWidth / 2) - point.x;
        var centerY = (this.mapHeight / 2) - point.y;

        var box = this.tilesFittingMapBoundingBox(centerX, centerY);
        this.initialDrawTileNumber = 0;
        for (var x = box.negativeBoundX - 1; x <= box.positiveBoundX + 1; x++) {
            for (var y = box.negativeBoundY - 1; y <= box.positiveBoundY + 1; y++) {
                var MapTileData = new MapTile(null, this.currentTileX + x, this.currentTileY + y, this.currentZoom, layers, centerX - (this.tileWidth * (-1 * x)), centerY - (this.tileHeight * (-1 * y)), this.tileWidth, this.tileHeight);
                this.mapData.push(MapTileData);
                // Outer ring is not filled with data, due to dynamic loading mechanism
                if (!(x == box.positiveBoundX + 1 || x == box.negativeBoundX - 1 || y == box.positiveBoundY + 1 || y == box.negativeBoundY - 1)) {
                    this.fillPlaceholder(MapTileData);
                    this.initialDrawTileNumber++;
                }
            }
        }
        if (mark) {
            this.markPlace(this.mapWidth / 2, this.mapHeight / 2);
        }
    }

    public shiftMap(shiftX: number, shiftY: number) {
        for (var i = 0; i < this.mapData.length; i++) {
            this.mapData[i].positionX += shiftX;
            this.mapData[i].positionY += shiftY;
            this.mapData[i].isRendered = false;
        }
        this.clearCanvas();
        for (var i = 0; i < this.mapData.length; i++) {
            this.drawTile(this.mapData[i]);
        }
        this.drawPath(this.currentRoute);
        this.redrawAllMarks();
        this.updateTiles();
    }

    private updateTiles() {
        // Loop collection to find placeholders
        for (var i = 0; i < this.mapData.length; i++) {
            // If tile is placeholder
            if (this.mapData[i].rawData == null) {
                var ph = this.mapData[i];
                var right = ph.positionX + ph.tileWidth;
                var left = ph.positionX;
                var top = ph.positionY;
                var bot = ph.positionY + ph.tileHeight;

                // Check if tile intersect map visible area
                if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                    var nextLeft = false;
                    var nextRight = false;
                    var nextTop = false;
                    var nextBot = false;

                    // Check if this tile have neighbor
                    for (var j = 0; j < this.mapData.length; j++) {
                        if (ph.tileX + 1 == this.mapData[j].tileX && ph.tileY == this.mapData[j].tileY) nextRight = true;
                        if (ph.tileX - 1 == this.mapData[j].tileX && ph.tileY == this.mapData[j].tileY) nextLeft = true;
                        if (ph.tileY + 1 == this.mapData[j].tileY && ph.tileX == this.mapData[j].tileX) nextBot = true;
                        if (ph.tileY - 1 == this.mapData[j].tileY && ph.tileX == this.mapData[j].tileX) nextTop = true;
                    }
                    // If does have neighbor, create placeholders for them
                    if (!nextRight) { this.mapData.push(new MapTile(null, ph.tileX + 1, ph.tileY, ph.zoom, ph.layers, ph.positionX + ph.tileWidth, ph.positionY, ph.tileWidth, ph.tileHeight)); }
                    if (!nextLeft) { this.mapData.push(new MapTile(null, ph.tileX - 1, ph.tileY, ph.zoom, ph.layers, ph.positionX - ph.tileWidth, ph.positionY, ph.tileWidth, ph.tileHeight)); }
                    if (!nextBot) { this.mapData.push(new MapTile(null, ph.tileX, ph.tileY + 1, ph.zoom, ph.layers, ph.positionX, ph.positionY + ph.tileHeight, ph.tileWidth, ph.tileHeight)); }
                    if (!nextTop) { this.mapData.push(new MapTile(null, ph.tileX, ph.tileY - 1, ph.zoom, ph.layers, ph.positionX, ph.positionY - ph.tileHeight, ph.tileWidth, ph.tileHeight)); }
                    
                    // At last, fill placeholder tile with data to render and remove this placeholder
                    this.fillPlaceholder(ph);
                }
            }
        }
    }

    private fillPlaceholder(tileToFill: MapTile) {
        if (tileToFill.isRequested) {
            return;
        }
        var id = (tileToFill.tileX) + "-" + (tileToFill.tileY) + "-" + (tileToFill.zoom);

        this.database.getTile(id)
            .then((tileFromDB: MapTile) => {
                // Search corresponding placeholder and fill it with DB data or fetch from server for him
                for (var i = 0; i < this.mapData.length; i++) {
                    if (this.mapData[i].rawData == null && this.mapData[i].tileX == tileToFill.tileX && this.mapData[i].tileY == tileToFill.tileY) {
                        if (tileFromDB != undefined) {
                            var MapTileWithData = new MapTile(tileFromDB._rawData, this.mapData[i].tileX, this.mapData[i].tileY, this.mapData[i].zoom, this.mapData[i].layers, this.mapData[i].positionX, this.mapData[i].positionY, this.mapData[i].tileWidth, this.mapData[i].tileHeight);
                            // Replace and draw
                            this.mapData.splice(i, 1, MapTileWithData);
                            this.drawTile(MapTileWithData);
                            this.drawPath(this.currentRoute);
                            this.redrawAllMarks();
                        }
                        else {
                            this.mapData[i].isRequested = true;
                            this.fetchTile(tileToFill.tileX, tileToFill.tileY, tileToFill.zoom, tileToFill.tileX, tileToFill.tileY, (argX, argY, data) => {
                                // Searching placeholder to replace in callback, because there is possible change of his coordinates during of download
                                // In this way, coordinates are corresponding with actual position
                                for (var j = 0; j < this.mapData.length; j++) {
                                    if (this.mapData[j].rawData == null && this.mapData[j].tileX == argX && this.mapData[j].tileY == argY) {
                                        var x = this.mapData[j];
                                        var MapTileWithData = new MapTile(data, x.tileX, x.tileY, this.currentZoom, this.currentLayers, x.positionX, x.positionY, x.tileWidth, x.tileHeight);
                                        // Add to DB before draw (drawin creates html nodes which cannot be added into IndexedDB)
                                        this.database.addTile(MapTileWithData).catch(() => { });
                                        // Replace and draw
                                        this.mapData.splice(j, 1, MapTileWithData);
                                        this.drawTile(MapTileWithData);
                                        this.drawPath(this.currentRoute);
                                        this.redrawAllMarks();
                                    }
                                }
                            });
                        }
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    private tilesFittingMapBoundingBox(centerTilePosX: number, centerTilePosY: number): { positiveBoundX: number, negativeBoundX: number, positiveBoundY: number, negativeBoundY: number } {
        var positiveX = 0;
        while (true) {
            var positionX = centerTilePosX + (positiveX * this.tileWidth);
            var positionY = centerTilePosY;
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;

            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) { positiveX++; }
            else { break; }
        }

        var negativeX = -1;
        while (true) {
            var positionX = centerTilePosX + (negativeX * this.tileWidth);
            var positionY = centerTilePosY;
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;

            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) { negativeX--; }
            else { break; }
        }
        var positiveY = 0;
        while (true) {
            var positionX = centerTilePosX;
            var positionY = centerTilePosY + (positiveY * this.tileHeight);
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;

            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) { positiveY++; }
            else { break; }
        }

        var negativeY = -1;
        while (true) {
            var positionX = centerTilePosX;
            var positionY = centerTilePosY + (negativeY * this.tileHeight);
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;

            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) { negativeY--; }
            else { break; }
        }

        return {
            positiveBoundX: --positiveX,
            negativeBoundX: ++negativeX,
            positiveBoundY: --positiveY,
            negativeBoundY: ++negativeY
        }
    }

    private fetchTile(x: number, y: number, z: number, argX: number, argY: number, callback: Function): void {
        var fetchURL = "https://tile.mapzen.com/mapzen/vector/v1/all/" + z + "/" + x + "/" + y + ".json?api_key=" + MainPage.mapzen_API_key;

        $.getJSON(fetchURL)
            .done((data) => {
                callback(argX, argY, data);
            })
            .fail(() => {
                console.log("Download of tile: Z=" + z + ", X=" + x + ", Y=" + y + " failed");
            })
    }

    public fetchRoute(points: Array<{ lat: number, lon: number }>, travelType: string = "auto") {
        var fetchURL = "https://matrix.mapzen.com/optimized_route?json={\"locations\":[";
        // Add endpoints to URL
        for (var i = 0; i < points.length; i++) {
            fetchURL += "{\"lat\":" + points[i].lat + ", " + "\"lon\":" + points[i].lon + "}";
            (i + 1 == points.length) ? fetchURL += "]," : fetchURL += ",";
        }
        fetchURL += "\"costing\":\"" + travelType + "\", \"units\":\"mi\"}&api_key=" + MainPage.mapzen_API_key;

        $.getJSON(fetchURL)
            .then((routeObject) => {
                if (points.length - 1 == routeObject.trip.legs.length) {
                    var route = new Array();
                    for (var i = 0; i < routeObject.trip.legs.length; i++) {
                        var obj = [points[i], points[i + 1]];
                        route.push({
                            endpoints: obj,
                            path: Converter.decodePolyline(routeObject.trip.legs[i].shape, 6)
                        });
                    }
                }
                var hours = Math.floor((routeObject.trip.summary.time / 60) / 60);
                var mins = ((routeObject.trip.summary.time / 60) - (60 * hours)).toFixed(0);
                var timeString = hours > 0 ? hours + "h " + mins + " " + "min" : mins + "min";
                var units = routeObject.trip.units == "kilometers" ? "Km" : "m";
                $(".routeDetailInfo").text("Distance: " + routeObject.trip.summary.length.toFixed(1) + " " + units + ", " + "Time: " + timeString);
                this.drawPath(route);
            })
            .fail((fail, textStatus, error) => {
                var txt = (error == "Bad Request" ? "Path length limit exceeded" : "Too many requests in short period");
                $(".routeDetailInfo").text(txt).css("animation", "routeLimit-highlight 2s")
                    .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", (evt) => {
                        $(evt.currentTarget).css("animation", "none");
                    });
            })
    }


    private drawTile(mapTile: MapTile): void {
        // Placeholders aren't drawn
        if (mapTile.rawData == null) {
            return;
        }
        // Render data changes
        if (mapTile.didChange) {
            mapTile.canvas = document.createElement('canvas');
            mapTile.context = mapTile.canvas.getContext('2d');
            mapTile.context.save();
            mapTile.context.strokeStyle = '#333333';
            mapTile.context.canvas.width = mapTile.tileWidth;
            mapTile.context.canvas.height = mapTile.tileHeight;
            
            for (var i = 0; i < mapTile.sortedData.length; i++) {
                if (mapTile.sortedData[i].geometry.type == "LineString") { this.drawLineString(mapTile.sortedData[i], mapTile); }
                if (mapTile.sortedData[i].geometry.type == "MultiLineString") { this.drawMultiLineString(mapTile.sortedData[i], mapTile); }
                if (mapTile.sortedData[i].geometry.type == "Polygon") { this.drawPolygon(mapTile.sortedData[i], mapTile); }
                if (mapTile.sortedData[i].geometry.type == "MultiPolygon") { this.drawMultiPolygon(mapTile.sortedData[i], mapTile); }
            }
            mapTile.didChange = false;
            this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY, mapTile.tileWidth, mapTile.tileHeight);
            mapTile.context.restore();
        }
        else {
            this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY);
        }
        
        // Draw labels when are rendered all tiles with data
        mapTile.isRendered = true;
        var withDataCount = 0;
        var alreadyRenderedCount = 0;
        for (var i = 0; i < this.mapData.length; i++){
            if (this.mapData[i].rawData) { withDataCount++;  }
            if (this.mapData[i].isRendered) { alreadyRenderedCount++;  }
        }
        if (alreadyRenderedCount == withDataCount) {
            this.drawLabels();
        }
    }

    private drawLabels() {
        this.labelsContext.beginPath();
        this.labelsContext.strokeStyle = '#333333';
        this.labelsContext.canvas.width = this.mapWidth;
        this.labelsContext.canvas.height = this.mapHeight;
        this.labelsContext.save();
        
        for (var i = 0; i < this.mapData.length; i++) {
            if (this.mapData[i].rawData) {
                var mapTile = {
                    context: this.labelsContext,
                    boundingBox: this.mapData[i].boundingBox,
                    xScale: this.mapData[i].xScale,
                    yScale: this.mapData[i].yScale
                }
                for (var j = 0; j < this.mapData[i].sortedData.length; j++) {
                    if (this.mapData[i].sortedData[j].geometry.type == "Point" || this.mapData[i].sortedData[j].geometry.type == "MultiPoint") {
                        this.drawLabel(this.mapData[i].sortedData[j], mapTile, this.mapData[i].positionX, this.mapData[i].positionY);
                    }
                }
            }
        }
        this.labelsContext.drawImage(this.labelsCanvas, 0, 0, this.mapWidth, this.mapHeight);
    }

    private drawLabel(shape: any, mapTile: any, posX: number, posY: number): void {
        var longitude, latitude, point;
        mapTile.context.save();

        longitude = shape.geometry.coordinates[0];
        latitude = shape.geometry.coordinates[1];

        point = Converter.MercatorProjection(latitude, longitude);
        // Scale the points of the coordinate
        // to fit inside bounding box
        point = {
            x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
            y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
        };
        point.x += posX;
        point.y += posY;

        mapTile.context.beginPath();
        this.mapStyler.stylePoint(shape, mapTile.context, this.currentZoom, point.x, point.y);
        mapTile.context.stroke();
        mapTile.context.restore();
        mapTile.context.closePath();
    }
    
    private drawLineString(shape: any, mapTile: MapTile): void {
        var longitude, latitude, point;
        mapTile.context.save();

        for (var i = 0; i < shape.geometry.coordinates.length; i++) {
            longitude = shape.geometry.coordinates[i][0];
            latitude = shape.geometry.coordinates[i][1];

            point = Converter.MercatorProjection(latitude, longitude);
            // Scale the points of the coordinate
            // to fit inside bounding box
            point = {
                x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
            };

            if (i == 0) {
                mapTile.context.beginPath();
                mapTile.context.moveTo(point.x, point.y);
            }
            else {
                mapTile.context.lineTo(point.x, point.y);
            }
        }
        this.mapStyler.styleLine(shape, mapTile.context, this.currentZoom);
        mapTile.context.stroke();
        mapTile.context.restore();
        mapTile.context.closePath();
    }

    private drawMultiLineString(shape: any, mapTile: MapTile): void {
        var longitude, latitude, point;
        mapTile.context.save();

        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++) {
                longitude = shape.geometry.coordinates[j][k][0];
                latitude = shape.geometry.coordinates[j][k][1];

                point = Converter.MercatorProjection(latitude, longitude);
                // Scale the points of the coordinate
                // to fit inside bounding box
                point = {
                    x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                    y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
                };
                // If this is the first coordinate in a shape, start a new path
                if (k == 0) {
                    mapTile.context.beginPath();
                    mapTile.context.moveTo(point.x, point.y);
                }
                else {
                    mapTile.context.lineTo(point.x, point.y);
                }
            }
            this.mapStyler.styleLine(shape, mapTile.context, this.currentZoom);
            mapTile.context.stroke();
            mapTile.context.restore();
            mapTile.context.closePath();
        }
    }

    private drawPoint(shape: any, mapTile: any): void {
        var longitude, latitude, point;
        mapTile.context.save();

        longitude = shape.geometry.coordinates[0];
        latitude = shape.geometry.coordinates[1];

        point = Converter.MercatorProjection(latitude, longitude);
        // Scale the points of the coordinate
        // to fit inside bounding box
        point = {
            x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
            y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
        };
        mapTile.context.beginPath();
        this.mapStyler.stylePoint(shape, mapTile.context, this.currentZoom, point.x, point.y);
        mapTile.context.stroke();
        mapTile.context.restore();
        mapTile.context.closePath();
    }

    private drawMultiPoint(shape: any, mapTile: MapTile): void {
        var longitude, latitude, point;
        mapTile.context.save();

        mapTile.context.beginPath();
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            longitude = shape.geometry.coordinates[j][0];
            latitude = shape.geometry.coordinates[j][1];

            point = Converter.MercatorProjection(latitude, longitude);
            // Scale the points of the coordinate
            // to fit inside bounding box
            point = {
                x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
            };

            this.mapStyler.stylePoint(shape, mapTile.context, this.currentZoom, point.x, point.y);
        }
        mapTile.context.stroke();
        mapTile.context.restore();
        mapTile.context.closePath();
    }

    private drawPolygon(shape: any, mapTile: MapTile): void {
        var longitude, latitude, point;
        mapTile.context.save();

        mapTile.context.beginPath();

        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++) {
                longitude = shape.geometry.coordinates[j][k][0];
                latitude = shape.geometry.coordinates[j][k][1];

                point = Converter.MercatorProjection(latitude, longitude);
                // Scale the points of the coordinate
                // to fit inside bounding box
                point = {
                    x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                    y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
                };

                // If this is the first coordinate in a shape, start a new path
                if (k == 0 && j != 0) {
                    mapTile.context.closePath();
                    mapTile.context.moveTo(point.x, point.y);
                }
                mapTile.context.lineTo(point.x, point.y);
            }
        }
        this.mapStyler.stylePolygon(shape, mapTile.context);
        mapTile.context.stroke();
        mapTile.context.restore();
        mapTile.context.closePath();
    }

    private drawMultiPolygon(shape: any, mapTile: MapTile): void {
        var longitude, latitude, point;
        mapTile.context.save();

        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            mapTile.context.beginPath();
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++) {
                for (var l = 0; l < shape.geometry.coordinates[j][k].length; l++) {
                    longitude = shape.geometry.coordinates[j][k][l][0];
                    latitude = shape.geometry.coordinates[j][k][l][1];

                    point = Converter.MercatorProjection(latitude, longitude);
                    // Scale the points of the coordinate
                    // to fit inside bounding box
                    point = {
                        x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                        y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
                    };

                    // If this is the first coordinate in a shape, start a new path
                    if (l == 0 && k != 0) {
                        mapTile.context.closePath();
                        mapTile.context.moveTo(point.x, point.y);
                    }
                    else {
                        mapTile.context.lineTo(point.x, point.y);
                    }
                }
            }
            this.mapStyler.stylePolygon(shape, mapTile.context);
            mapTile.context.stroke();
            mapTile.context.restore();
            mapTile.context.closePath();
        }
    }

    private drawPath(routes: any) {
        if (routes == undefined) {
            return;
        }
        // Check if path string still have existing endpoints placed on map
        for (var i = 0; i < routes.length; i++) {
            var numOfPoints = 0;
            for (var j = 0; j < routes[i].endpoints.length; j++) {
                for (var k = 0; k < this.routeMarks.length; k++) {
                    if (routes[i].endpoints[j].lat == this.routeMarks[k].latitude && routes[i].endpoints[j].lon == this.routeMarks[k].longitude) {
                        ++numOfPoints;
                    }
                }
            }
            // Mark paths whose don't have endpoints, so we don't draw them
            (numOfPoints == routes[i].endpoints.length) ? routes[i].drawIt = true : routes[i].drawIt = false;
        }
        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.beginPath();

        for (var i = 0; i < routes.length; i++) {
            if (routes[i].drawIt) {
                for (var j = 0; j < routes[i].path.length; j++) {
                    for (var k = 0; k < this.mapData.length; k++) {
                        var latLeft = this.mapData[k].boundingBox.yMin;
                        var latRight = this.mapData[k].boundingBox.yMax;
                        var lonTop = this.mapData[k].boundingBox.xMin;
                        var lonBot = this.mapData[k].boundingBox.xMax;

                        // If mark is in [latitude, longitude] bounds of tile..
                        if ((latLeft <= routes[i].path[j][0]) && (routes[i].path[j][0] <= latRight) && (lonTop <= routes[i].path[j][1]) && (routes[i].path[j][1] <= lonBot)) {
                            var point = Converter.MercatorProjection(routes[i].path[j][0], routes[i].path[j][1]);

                            point = {
                                x: (routes[i].path[j][1] - lonTop) * this.mapData[k].xScale,
                                y: (latRight - routes[i].path[j][0]) * this.mapData[k].yScale
                            };

                            point.x += this.mapData[k].positionX;
                            point.y += this.mapData[k].positionY;

                            if (j == 0) {
                                context.moveTo(point.x, point.y);
                            }
                            else {
                                context.lineTo(point.x, point.y);
                            }
                        }
                    }
                }
            }
        }
        context.strokeStyle = '#FF4949';
        context.lineWidth = 3;
        context.stroke();
        context.lineWidth = 2;
        context.strokeStyle = 'yellow';
        context.stroke();
        context.lineWidth = 1;
        context.closePath();

        this.currentRoute = routes;
        this.redrawAllMarks();
    }


    public getCoordinatesAtCenter(): { latitude: number, longitude: number } {
        var x = this.mapWidth / 2;
        var y = this.mapHeight / 2;
        // Get tile which is in center of map
        var tileAtCenter;
        for (var i = 0; i < this.mapData.length; i++) {
            var top = this.mapData[i].positionY;
            var bot = this.mapData[i].positionY + this.tileHeight;
            var left = this.mapData[i].positionX;
            var right = this.mapData[i].positionX + this.tileWidth;

            // If coordinates are in center of this tile...
            if (left <= x && x <= right && top <= y && y <= bot) {
                tileAtCenter = this.mapData[i];
            }
        }
        // Calculate [lat,long]
        var latLeft = tileAtCenter.boundingBox.xMin;
        var lonBot = tileAtCenter.boundingBox.yMax;
        var onTileX = x - tileAtCenter.positionX;
        var onTileY = y - tileAtCenter.positionY;

        var longitude = (onTileX / tileAtCenter.xScale) + latLeft;
        var latitude = lonBot - (onTileY / tileAtCenter.yScale);
        return {
            latitude: latitude,
            longitude: longitude
        }
    }

    public markPathPointByGPS(lat: number, lon: number, remove: boolean = true) {
        var markedTile;
        for (var i = 0; i < this.mapData.length; i++) {
            var latLeft = this.mapData[i].boundingBox.yMin;
            var latRight = this.mapData[i].boundingBox.yMax;
            var lonTop = this.mapData[i].boundingBox.xMin;
            var lonBot = this.mapData[i].boundingBox.xMax;
            // if touch is in this tile...
            if (latLeft <= lat && lat <= latRight && lonTop <= lon && lon <= lonBot) {
                markedTile = this.mapData[i];
            }
        }
        if (markedTile != null) {
            var newMark = Converter.MercatorProjection(markedTile.latitude, markedTile.longitude);

            newMark = {
                x: (lon - markedTile.boundingBox.xMin) * markedTile.xScale,
                y: (markedTile.boundingBox.yMax - lat) * markedTile.yScale
            };

            newMark.x += markedTile.positionX;
            newMark.y += markedTile.positionY;

            var didRemove = false;
            if (remove) {
                // Remove mark if there is already one
                for (var i = 0; i < this.routeMarks.length; i++) {
                    var markPositionX = this.routeMarks[i].positionX;
                    var markPositionY = this.routeMarks[i].positionY;
                    var touchRadius = this.routeMarks[i].touchRadius;
                    var height = this.routeMarks[i].height;

                    if (Math.abs(markPositionX - newMark.x) <= touchRadius && Math.abs((markPositionY - (height / 3)) - newMark.y) <= touchRadius) {
                        this.routeMarks.splice(i, 1);
                        didRemove = true;
                        this.shiftMap(0, 0);
                    }
                }
            }
            // If didnt removed mark, draw mark here
            if (!didRemove) {
                var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
                var context = canvas.getContext('2d');
                var point = {
                    latitude: lat,
                    longitude: lon,
                    positionX: newMark.x,
                    positionY: newMark.y,
                    width: 32,
                    height: 32,
                    touchRadius: 20
                };
                context.beginPath();
                // Mark
                context.fillStyle = 'red';
                context.strokeStyle = '#616161';
                context.lineWidth = 0.5;
                context.moveTo(point.positionX, point.positionY - 32);
                context.quadraticCurveTo(point.positionX - 18, point.positionY - 32, point.positionX, point.positionY);
                context.stroke();
                context.moveTo(point.positionX, point.positionY - 32);
                context.quadraticCurveTo(point.positionX + 18, point.positionY - 32, point.positionX, point.positionY);
                context.stroke();
                context.fill();

                context.beginPath();
                // Mark number
                context.fillStyle = 'white';
                context.font = "bold 18px Roboto_Light";
                context.fillText((i + 1).toString(), point.positionX - 5, point.positionY - 16);

                this.routeMarks.push(point);
            }
        }
    }

    public markPathPoint(x: number, y: number, remove: boolean = true) {
        var markedTile;
        for (var i = 0; i < this.mapData.length; i++) {
            var top = this.mapData[i].positionY;
            var bot = this.mapData[i].positionY + this.tileHeight;
            var left = this.mapData[i].positionX;
            var right = this.mapData[i].positionX + this.tileWidth;

            // if touch is in this tile...
            if (left <= x && x <= right && top <= y && y <= bot) {
                markedTile = this.mapData[i];
            }
        }
        if (markedTile != null) {
            var latLeft = markedTile.boundingBox.xMin;
            var lonBot = markedTile.boundingBox.yMax;
            var onTileX = x - markedTile.positionX;
            var onTileY = y - markedTile.positionY;

            var longitude = (onTileX / markedTile.xScale) + latLeft;
            var latitude = lonBot - (onTileY / markedTile.yScale);

            var didRemove = false;
            if (remove) {
                // Remove mark if there is already one
                for (var i = 0; i < this.routeMarks.length; i++) {
                    var markPositionX = this.routeMarks[i].positionX;
                    var markPositionY = this.routeMarks[i].positionY;
                    var touchRadius = this.routeMarks[i].touchRadius;
                    var height = this.routeMarks[i].height;

                    if (Math.abs(markPositionX - x) <= touchRadius && Math.abs((markPositionY - (height / 3)) - y) <= touchRadius) {
                        this.routeMarks.splice(i, 1);
                        didRemove = true;
                        this.shiftMap(0, 0);
                    }
                }
            }
            // If didnt removed mark, draw mark here
            if (!didRemove) {
                var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
                var context = canvas.getContext('2d');
                var point = {
                    latitude: latitude,
                    longitude: longitude,
                    positionX: x,
                    positionY: y,
                    width: 32,
                    height: 32,
                    touchRadius: 20
                };
                context.beginPath();
                // Mark
                context.fillStyle = 'red';
                context.strokeStyle = '#616161';
                context.lineWidth = 0.5;
                context.moveTo(x, y - 32);
                context.quadraticCurveTo(x - 18, y - 32, x, y);
                context.stroke();
                context.moveTo(x, y - 32);
                context.quadraticCurveTo(x + 18, y - 32, x, y);
                context.stroke();
                context.fill();

                context.beginPath();
                // Mark number
                context.fillStyle = 'white';
                context.font = "bold 18px Roboto_Light";
                context.fillText((i + 1).toString(), x - 5, y - 16);

                this.routeMarks.push(point);
            }

        }
    }

    public markPlace(x: number, y: number) {
        var markedTile;
        for (var i = 0; i < this.mapData.length; i++) {
            var top = this.mapData[i].positionY;
            var bot = this.mapData[i].positionY + this.tileHeight;
            var left = this.mapData[i].positionX;
            var right = this.mapData[i].positionX + this.tileWidth;
            // if touch is in this tile...
            if (left <= x && x <= right && top <= y && y <= bot) {
                markedTile = this.mapData[i];
            }
        }
        if (markedTile != null) {
            var longitude = ((x - markedTile.positionX) / markedTile.xScale) + markedTile.boundingBox.xMin;
            var latitude = markedTile.boundingBox.yMax - ((y - markedTile.positionY) / markedTile.yScale);

            // If placeMark exists, check if needs to be removed
            if (this.placeMark && (Math.abs(this.placeMark.positionX - x) <= this.placeMark.touchRadius) && (Math.abs((this.placeMark.positionY - (this.placeMark.height / 3)) - y) <= this.placeMark.touchRadius)) {
                this.placeMark = null;
                this.mapPanel.hideMarkedPointInfo();
            }
            else {
                // If didnt removed mark, draw mark here
                var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
                var context = canvas.getContext('2d');
                var point = {
                    latitude: latitude,
                    longitude: longitude,
                    positionX: x,
                    positionY: y,
                    width: 32,
                    height: 32,
                    touchRadius: 20
                };
                // Mark
                context.beginPath();
                context.fillStyle = '#ff0000';
                context.strokeStyle = '#616161';
                context.lineWidth = 0.5;
                context.moveTo(x, y - 32);
                context.quadraticCurveTo(x - 18, y - 32, x, y);
                context.stroke();
                context.moveTo(x, y - 32);
                context.quadraticCurveTo(x + 18, y - 32, x, y);
                context.stroke();
                context.fill();
                context.moveTo(x, y - 24);
                context.fillStyle = "#FFF288";
                context.arc(x, y - 23, 6, 0, 2 * Math.PI);
                context.fill();

                this.placeMark = point;
                this.mapPanel.hideMarkedPointInfo();
                this.mapPanel.displayMarkedPointInfo(point.latitude, point.longitude);
            }
            this.shiftMap(0, 0);
        }
    }

    public markPlaceByGPS(lat: number, lon: number) {
        var markedTile;
        for (var i = 0; i < this.mapData.length; i++) {
            var latLeft = this.mapData[i].boundingBox.yMin;
            var latRight = this.mapData[i].boundingBox.yMax;
            var lonTop = this.mapData[i].boundingBox.xMin;
            var lonBot = this.mapData[i].boundingBox.xMax;
            // if touch is in this tile...
            if (latLeft <= lat && lat <= latRight && lonTop <= lon && lon <= lonBot) {
                markedTile = this.mapData[i];
            }
        }
        if (markedTile != null) {
            var newMark = Converter.MercatorProjection(markedTile.latitude, markedTile.longitude);

            newMark = {
                x: (lon - markedTile.boundingBox.xMin) * markedTile.xScale,
                y: (markedTile.boundingBox.yMax - lat) * markedTile.yScale
            };

            newMark.x += markedTile.positionX;
            newMark.y += markedTile.positionY;

            // If placeMark exists, check if needs to be removed
            if (this.placeMark && Math.abs(this.placeMark.positionX - newMark.x) <= this.placeMark.touchRadius && Math.abs((this.placeMark.positionY - (this.placeMark.height / 3)) - newMark.y) <= this.placeMark.touchRadius) {
                this.placeMark = null;
                this.mapPanel.hideMarkedPointInfo();
                this.shiftMap(0, 0);
            }
            // If didnt removed mark, draw mark here
            else {
                var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
                var context = canvas.getContext('2d');
                var point = {
                    latitude: lat,
                    longitude: lon,
                    positionX: newMark.x,
                    positionY: newMark.y,
                    width: 32,
                    height: 32,
                    touchRadius: 20
                };
                // Mark
                context.beginPath();
                context.fillStyle = '#ff0000';
                context.strokeStyle = '#616161';
                context.lineWidth = 0.5;
                context.moveTo(newMark.x, newMark.y - 32);
                context.quadraticCurveTo(newMark.x - 18, newMark.y - 32, newMark.x, newMark.y);
                context.stroke();
                context.moveTo(newMark.x, newMark.y - 32);
                context.quadraticCurveTo(newMark.x + 18, newMark.y - 32, newMark.x, newMark.y);
                context.stroke();
                context.fill();
                context.moveTo(newMark.x, newMark.y - 24);
                context.fillStyle = "#FFF288";
                context.arc(newMark.x, newMark.y - 23, 6, 0, 2 * Math.PI);
                context.fill();

                this.placeMark = point;
                this.mapPanel.hideMarkedPointInfo();
                this.mapPanel.displayMarkedPointInfo(point.latitude, point.longitude);
            }
            this.shiftMap(0, 0);
        }
    }

    public redrawAllMarks() {
        this.redrawPathMarks();
        this.redrawPlaceMark();
    }

    private redrawPathMarks() {
        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        for (var i = 0; i < this.routeMarks.length; i++) {
            for (var j = 0; j < this.mapData.length; j++) {
                var latLeft = this.mapData[j].boundingBox.yMin;
                var latRight = this.mapData[j].boundingBox.yMax;
                var lonTop = this.mapData[j].boundingBox.xMin;
                var lonBot = this.mapData[j].boundingBox.xMax;

                var markLat = this.routeMarks[i].latitude;
                var markLon = this.routeMarks[i].longitude;

                // If mark is in [latitude, longitude] bounds of tile..
                if ((latLeft <= markLat) && (markLat <= latRight)) {
                    if ((lonTop <= markLon) && (markLon <= lonBot)) {
                        var point = Converter.MercatorProjection(this.routeMarks[i].latitude, this.routeMarks[i].longitude);

                        point = {
                            x: (this.routeMarks[i].longitude - lonTop) * this.mapData[j].xScale,
                            y: (latRight - this.routeMarks[i].latitude) * this.mapData[j].yScale
                        };
                        point.x += this.mapData[j].positionX;
                        point.y += this.mapData[j].positionY;

                        context.beginPath();
                        // Mark
                        context.fillStyle = 'red';
                        context.strokeStyle = '#616161';
                        context.lineWidth = 0.5;
                        context.moveTo(point.x, point.y - 32);
                        context.quadraticCurveTo(point.x - 18, point.y - 32, point.x, point.y);
                        context.stroke();
                        context.moveTo(point.x, point.y - 32);
                        context.quadraticCurveTo(point.x + 18, point.y - 32, point.x, point.y);
                        context.stroke();
                        context.fill();

                        context.beginPath();
                        // Mark number
                        context.fillStyle = 'white';
                        context.font = "bold 18px Roboto_Light";
                        context.fillText((i + 1).toString(), point.x - 5, point.y - 16);

                        this.routeMarks[i].positionX = point.x;
                        this.routeMarks[i].positionY = point.y;
                    }
                }
            }
        }
    }

    private redrawPlaceMark() {
        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        if (this.placeMark) {
            for (var j = 0; j < this.mapData.length; j++) {
                var latLeft = this.mapData[j].boundingBox.yMin;
                var latRight = this.mapData[j].boundingBox.yMax;
                var lonTop = this.mapData[j].boundingBox.xMin;
                var lonBot = this.mapData[j].boundingBox.xMax;

                var markLat = this.placeMark.latitude;
                var markLon = this.placeMark.longitude;

                // If mark is in [latitude, longitude] bounds of tile..
                if ((latLeft <= markLat) && (markLat <= latRight)) {
                    if ((lonTop <= markLon) && (markLon <= lonBot)) {
                        var point = Converter.MercatorProjection(this.placeMark.latitude, this.placeMark.longitude);
                        point = {
                            x: (this.placeMark.longitude - lonTop) * this.mapData[j].xScale,
                            y: (latRight - this.placeMark.latitude) * this.mapData[j].yScale
                        };
                        point.x += this.mapData[j].positionX;
                        point.y += this.mapData[j].positionY;

                        context.beginPath();
                        // Mark
                        context.fillStyle = '#ff0000';
                        context.strokeStyle = '#616161';
                        context.lineWidth = 0.5;
                        context.moveTo(point.x, point.y - 32);
                        context.quadraticCurveTo(point.x - 18, point.y - 32, point.x, point.y);
                        context.stroke();
                        context.moveTo(point.x, point.y - 32);
                        context.quadraticCurveTo(point.x + 18, point.y - 32, point.x, point.y);
                        context.stroke();
                        context.fill();
                        context.beginPath();
                        context.moveTo(point.x, point.y - 24);
                        context.fillStyle = "#FFF288";
                        context.arc(point.x, point.y - 23, 6, 0, 2 * Math.PI, false);
                        context.fill();

                        this.placeMark.positionX = point.x;
                        this.placeMark.positionY = point.y;
                    }
                }
            }
        }
    }

    public getPlaceMarkGPS() {
        if (this.placeMark) {
            return { lat: this.placeMark.latitude, lon: this.placeMark.longitude };
        }
    }

    public replacePlaceWithRouteMark() {
        if (this.placeMark) {
            var mark = this.placeMark;
            this.markPlace(mark.positionX, mark.positionY);
            this.markPathPoint(mark.positionX, mark.positionY);
        }
    }

    public clearPathPoints() {
        this.routeMarks = [];
    }

    public clearPlaceMark() {
        this.placeMark = null;
    }

    public clearCanvas(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public areGPSonScreen(lat: number, lon: number) {
        for (var i = 0; i < this.mapData.length; i++) {
            var latLeft = this.mapData[i].boundingBox.yMin;
            var latRight = this.mapData[i].boundingBox.yMax;
            var lonTop = this.mapData[i].boundingBox.xMin;
            var lonBot = this.mapData[i].boundingBox.xMax;
            // if touch is in this tile...
            if (latLeft <= lat && lat <= latRight && lonTop <= lon && lon <= lonBot) {
                var right = this.mapData[i].positionX + this.mapData[i].tileWidth;
                var left = this.mapData[i].positionX;
                var top = this.mapData[i].positionY;
                var bot = this.mapData[i].positionY + this.mapData[i].tileHeight;
                if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                    return true;
                }
            }
        }
        return false;
    }

    public makeReturnOnItemButton(lat: string, lon: string) {
        $(this.root)
            .append($("<button>", { "id": "returnOnItemButton" }).text("Return to project")
                .click((evt) => {
                    this.removeReturnOnItemButton();
                    this.mainPage.showPlaces();
                    this.mainPage.placesList.findShowedPlaceByGPS(lat, lon);
                }).addClass("returnButton-highlight"));
    }

    public removeReturnOnItemButton() {
        $("#returnOnItemButton").remove();
    }
}
