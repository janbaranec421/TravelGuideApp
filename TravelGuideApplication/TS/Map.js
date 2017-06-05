var Map = (function () {
    function Map(tileWidth, tileHeight, mapWidth, mapHeight) {
        if (tileWidth === void 0) { tileWidth = 200; }
        if (tileHeight === void 0) { tileHeight = 200; }
        if (mapWidth === void 0) { mapWidth = 700; }
        if (mapHeight === void 0) { mapHeight = 700; }
        this.mapData = [];
        this.user_marks = [];
        this.root = $("#map");
        if (this.root == null)
            console.log("Failure: Element with ID \"map\" not found!");
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
        }));
        this.canvas = document.getElementById('mapCanvas');
        this.context = this.canvas.getContext('2d');
        this.mapStyler = new MapStyler();
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }
    Map.prototype.setMapDimensions = function (mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    };
    Map.prototype.displayPlace = function (latitude, longitude, zoom, layers) {
        this.clear();
        this.mapData = [];
        // [X,Y] Position in map tiles scope
        this.currentTileX = Converter.long2tileX(longitude, zoom);
        this.currentTileY = Converter.lat2tileY(latitude, zoom);
        this.currentLatitude = latitude;
        this.currentLongitude = longitude;
        this.currentZoom = zoom;
        this.currentLayers = layers;
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
        for (var x = box.negativeBoundX - 1; x <= box.positiveBoundX + 1; x++) {
            for (var y = box.negativeBoundY - 1; y <= box.positiveBoundY + 1; y++) {
                var MapTileData = new MapTile(null, this.currentTileX + x, this.currentTileY + y, zoom, layers, centerX - (this.tileWidth * (-1 * x)), centerY - (this.tileHeight * (-1 * y)), this.tileWidth, this.tileHeight);
                this.mapData.push(MapTileData);
                // Outer ring is not filled with data, due to dynamic loading mechanism
                if (!(x == box.positiveBoundX + 1 || x == box.negativeBoundX - 1 || y == box.positiveBoundY + 1 || y == box.negativeBoundY - 1)) {
                    this.fillPlaceholder(MapTileData);
                }
            }
        }
    };
    Map.prototype.shiftMap = function (shiftX, shiftY) {
        for (var i = 0; i < this.mapData.length; i++) {
            this.mapData[i].positionX += shiftX;
            this.mapData[i].positionY += shiftY;
        }
        this.clear();
        for (var i = 0; i < this.mapData.length; i++) {
            this.drawTile(this.mapData[i]);
        }
        this.drawPath(this.currentRoute);
        this.markCollectionRedraw();
        this.updateMap();
    };
    Map.prototype.updateMap = function () {
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
                        if (ph.tileX + 1 == this.mapData[j].tileX && ph.tileY == this.mapData[j].tileY)
                            nextRight = true;
                        if (ph.tileX - 1 == this.mapData[j].tileX && ph.tileY == this.mapData[j].tileY)
                            nextLeft = true;
                        if (ph.tileY + 1 == this.mapData[j].tileY && ph.tileX == this.mapData[j].tileX)
                            nextBot = true;
                        if (ph.tileY - 1 == this.mapData[j].tileY && ph.tileX == this.mapData[j].tileX)
                            nextTop = true;
                    }
                    // If does have neighbor, create placeholders for them
                    if (!nextRight) {
                        this.mapData.push(new MapTile(null, ph.tileX + 1, ph.tileY, ph.zoom, ph.layers, ph.positionX + ph.tileWidth, ph.positionY, ph.tileWidth, ph.tileHeight));
                    }
                    if (!nextLeft) {
                        this.mapData.push(new MapTile(null, ph.tileX - 1, ph.tileY, ph.zoom, ph.layers, ph.positionX - ph.tileWidth, ph.positionY, ph.tileWidth, ph.tileHeight));
                    }
                    if (!nextBot) {
                        this.mapData.push(new MapTile(null, ph.tileX, ph.tileY + 1, ph.zoom, ph.layers, ph.positionX, ph.positionY + ph.tileHeight, ph.tileWidth, ph.tileHeight));
                    }
                    if (!nextTop) {
                        this.mapData.push(new MapTile(null, ph.tileX, ph.tileY - 1, ph.zoom, ph.layers, ph.positionX, ph.positionY - ph.tileHeight, ph.tileWidth, ph.tileHeight));
                    }
                    // At last, fill placeholder tile with data to render and remove this placeholder
                    this.fillPlaceholder(ph);
                }
            }
        }
    };
    Map.prototype.fillPlaceholder = function (tileToFill) {
        var _this = this;
        if (tileToFill.isRequested) {
            return;
        }
        var id = (tileToFill.tileX) + "-" + (tileToFill.tileY) + "-" + (tileToFill.zoom);
        this.database.getTile(id)
            .then(function (tileFromDB) {
            // Search corresponding placeholder and fill it with DB data or fetch from server for him
            for (var i = 0; i < _this.mapData.length; i++) {
                if (_this.mapData[i].rawData == null && _this.mapData[i].tileX == tileToFill.tileX && _this.mapData[i].tileY == tileToFill.tileY) {
                    if (tileFromDB != undefined) {
                        var x = tileFromDB;
                        tileFromDB = new MapTile(x._rawData, x.tileX, x.tileY, x.zoom, x.layers, _this.mapData[i].positionX, _this.mapData[i].positionY, _this.mapData[i].tileWidth, _this.mapData[i].tileHeight);
                        // Replace and draw
                        _this.mapData.splice(i, 1, tileFromDB);
                        _this.drawTile(tileFromDB);
                        _this.drawPath(_this.currentRoute);
                        _this.markCollectionRedraw();
                    }
                    else {
                        _this.mapData[i].isRequested = true;
                        _this.fetchTile(tileToFill.tileX, tileToFill.tileY, tileToFill.zoom, tileToFill.tileX, tileToFill.tileY, function (argX, argY, data) {
                            // Searching placeholder to replace in callback, because there is possible change of his coordinates during of download
                            // In this way, coordinates are corresponding with actual position
                            for (var j = 0; j < _this.mapData.length; j++) {
                                if (_this.mapData[j].rawData == null && _this.mapData[j].tileX == argX && _this.mapData[j].tileY == argY) {
                                    var x = _this.mapData[j];
                                    var MapTileData = new MapTile(data, x.tileX, x.tileY, _this.currentZoom, _this.currentLayers, x.positionX, x.positionY, x.tileWidth, x.tileHeight);
                                    // Add to DB before draw (drawin creates html nodes which cannot be added into IndexedDB)
                                    _this.database.addTile(MapTileData).catch(function () { });
                                    // Replace and draw
                                    _this.mapData.splice(j, 1, MapTileData);
                                    _this.drawTile(MapTileData);
                                    _this.drawPath(_this.currentRoute);
                                    _this.markCollectionRedraw();
                                }
                            }
                        });
                    }
                }
            }
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    Map.prototype.tilesFittingMapBoundingBox = function (centerTilePosX, centerTilePosY) {
        var positiveX = 0;
        while (true) {
            var positionX = centerTilePosX + (positiveX * this.tileWidth);
            var positionY = centerTilePosY;
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;
            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                positiveX++;
            }
            else {
                break;
            }
        }
        var negativeX = -1;
        while (true) {
            var positionX = centerTilePosX + (negativeX * this.tileWidth);
            var positionY = centerTilePosY;
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;
            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                negativeX--;
            }
            else {
                break;
            }
        }
        var positiveY = 0;
        while (true) {
            var positionX = centerTilePosX;
            var positionY = centerTilePosY + (positiveY * this.tileHeight);
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;
            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                positiveY++;
            }
            else {
                break;
            }
        }
        var negativeY = -1;
        while (true) {
            var positionX = centerTilePosX;
            var positionY = centerTilePosY + (negativeY * this.tileHeight);
            var right = positionX + this.tileWidth;
            var left = positionX;
            var top = positionY;
            var bot = positionY + this.tileHeight;
            if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                negativeY--;
            }
            else {
                break;
            }
        }
        return {
            positiveBoundX: --positiveX,
            negativeBoundX: ++negativeX,
            positiveBoundY: --positiveY,
            negativeBoundY: ++negativeY
        };
    };
    Map.prototype.fetchTile = function (x, y, z, argX, argY, callback) {
        var fetchURL = "http://tile.mapzen.com/mapzen/vector/v1/all/" + z + "/" + x + "/" + y + ".json?api_key=mapzen-eES7bmW";
        $.getJSON(fetchURL)
            .done(function (data) {
            callback(argX, argY, data);
        })
            .fail(function () {
            console.log("Download of tile: Z=" + z + ", X=" + x + ", Y=" + y + " failed");
        });
    };
    Map.prototype.fetchRoute = function (points, travelType) {
        var _this = this;
        if (travelType === void 0) { travelType = "auto"; }
        var fetchURL = "http://matrix.mapzen.com/optimized_route?json={\"locations\":[";
        // Add endpoints to URL
        for (var i = 0; i < points.length; i++) {
            fetchURL += "{\"lat\":" + points[i].lat + ", " + "\"lon\":" + points[i].lon + "}";
            (i + 1 == points.length) ? fetchURL += "]," : fetchURL += ",";
        }
        fetchURL += "\"costing\":\"auto\", \"units\":\"mi\"}&api_key=mapzen-eES7bmW";
        $.getJSON(fetchURL)
            .then(function (routeObject) {
            console.log(routeObject);
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
            _this.drawPath(route);
        });
    };
    Map.prototype.drawTile = function (mapTile) {
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
                if (mapTile.sortedData[i].geometry.type == "Point") {
                    this.drawPoint(mapTile.sortedData[i], mapTile);
                }
                if (mapTile.sortedData[i].geometry.type == "MultiPoint") {
                    this.drawMultiPoint(mapTile.sortedData[i], mapTile);
                }
                if (mapTile.sortedData[i].geometry.type == "LineString") {
                    this.drawLineString(mapTile.sortedData[i], mapTile);
                }
                if (mapTile.sortedData[i].geometry.type == "MultiLineString") {
                    this.drawMultiLineString(mapTile.sortedData[i], mapTile);
                }
                if (mapTile.sortedData[i].geometry.type == "Polygon") {
                    this.drawPolygon(mapTile.sortedData[i], mapTile);
                }
                if (mapTile.sortedData[i].geometry.type == "MultiPolygon") {
                    this.drawMultiPolygon(mapTile.sortedData[i], mapTile);
                }
            }
            mapTile.didChange = false;
            this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY, mapTile.tileWidth, mapTile.tileHeight);
            mapTile.context.restore();
        }
        else {
            this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY);
        }
    };
    Map.prototype.drawLineString = function (shape, mapTile) {
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
        this.mapStyler.styleLine(shape, mapTile.context);
        mapTile.context.stroke();
        mapTile.context.restore();
        this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY, mapTile.tileWidth, mapTile.tileHeight);
    };
    Map.prototype.drawMultiLineString = function (shape, mapTile) {
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
            this.mapStyler.styleLine(shape, mapTile.context);
            mapTile.context.stroke();
            mapTile.context.restore();
        }
    };
    Map.prototype.drawPoint = function (shape, mapTile) {
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
        this.mapStyler.stylePoint(shape, mapTile.context, point.x, point.y);
        mapTile.context.stroke();
        mapTile.context.restore();
    };
    Map.prototype.drawMultiPoint = function (shape, mapTile) {
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
            this.mapStyler.stylePoint(shape, mapTile.context, point.x, point.y);
        }
        mapTile.context.stroke();
        mapTile.context.restore();
    };
    Map.prototype.drawPolygon = function (shape, mapTile) {
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
        this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY, mapTile.tileWidth, mapTile.tileHeight);
    };
    Map.prototype.drawMultiPolygon = function (shape, mapTile) {
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
        }
    };
    Map.prototype.drawPath = function (routes) {
        if (routes == undefined) {
            return;
        }
        // Check if path string still have existing endpoints placed on map
        for (var i = 0; i < routes.length; i++) {
            var numOfPoints = 0;
            for (var j = 0; j < routes[i].endpoints.length; j++) {
                for (var k = 0; k < this.user_marks.length; k++) {
                    if (routes[i].endpoints[j].lat == this.user_marks[k].latitude && routes[i].endpoints[j].lon == this.user_marks[k].longitude) {
                        ++numOfPoints;
                    }
                }
            }
            // Mark paths whose don't have endpoints, so we don't draw them
            (numOfPoints == routes[i].endpoints.length) ? routes[i].drawIt = true : routes[i].drawIt = false;
        }
        var canvas = $("#mapCanvas")[0];
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
        context.strokeStyle = '#ff0000';
        context.lineWidth = 3;
        context.stroke();
        context.lineWidth = 2;
        context.strokeStyle = 'yellow';
        context.stroke();
        context.lineWidth = 1;
        this.currentRoute = routes;
        this.markCollectionRedraw();
    };
    Map.prototype.getCoordinatesAtCenter = function () {
        var x = this.mapWidth / 2;
        var y = this.mapHeight / 2;
        // Get tile which is in center of map
        var tileAtCenter;
        for (var i = 0; i < this.mapData.length; i++) {
            var top = this.mapData[i].positionY;
            var bot = this.mapData[i].positionY + this.tileHeight;
            var left = this.mapData[i].positionX;
            var right = this.mapData[i].positionX + this.tileWidth;
            // if touch is in this tile...
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
        };
    };
    Map.prototype.markMap = function (x, y) {
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
            // Remove mark if there is already one
            for (var i = 0; i < this.user_marks.length; i++) {
                var markPositionX = this.user_marks[i].positionX;
                var markPositionY = this.user_marks[i].positionY;
                var touchRadius = this.user_marks[i].touchRadius;
                if (Math.abs(markPositionX - x) <= touchRadius && Math.abs(markPositionY - y) <= touchRadius) {
                    this.user_marks.splice(i, 1);
                    didRemove = true;
                    this.shiftMap(0, 0);
                }
            }
            // If didnt removed mark, draw mark here
            if (!didRemove) {
                var canvas = $("#mapCanvas")[0];
                var context = canvas.getContext('2d');
                var point = {
                    latitude: latitude,
                    longitude: longitude,
                    positionX: x,
                    positionY: y,
                    radius: 10,
                    touchRadius: 20
                };
                context.fillStyle = '#ff0000';
                context.lineWidth = 1;
                context.strokeStyle = '#3B3B3B';
                context.beginPath();
                context.arc(x, y, point.radius, 0, 2 * Math.PI);
                context.fill();
                context.strokeText((this.user_marks.length + 1).toString(), x - point.radius / 3, y + point.radius / 3);
                context.stroke();
                this.user_marks.push(point);
            }
        }
        var marks = new Array();
        if (this.user_marks.length >= 2) {
            for (var i = 0; i < this.user_marks.length; i++) {
                marks.push({ lat: this.user_marks[i].latitude, lon: this.user_marks[i].longitude });
            }
            this.fetchRoute(marks);
        }
    };
    Map.prototype.markCollectionRedraw = function () {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        for (var i = 0; i < this.user_marks.length; i++) {
            for (var j = 0; j < this.mapData.length; j++) {
                var latLeft = this.mapData[j].boundingBox.yMin;
                var latRight = this.mapData[j].boundingBox.yMax;
                var lonTop = this.mapData[j].boundingBox.xMin;
                var lonBot = this.mapData[j].boundingBox.xMax;
                var markLat = this.user_marks[i].latitude;
                var markLon = this.user_marks[i].longitude;
                // If mark is in [latitude, longitude] bounds of tile..
                if ((latLeft <= markLat) && (markLat <= latRight)) {
                    if ((lonTop <= markLon) && (markLon <= lonBot)) {
                        var point = Converter.MercatorProjection(this.user_marks[i].latitude, this.user_marks[i].longitude);
                        point = {
                            x: (this.user_marks[i].longitude - lonTop) * this.mapData[j].xScale,
                            y: (latRight - this.user_marks[i].latitude) * this.mapData[j].yScale
                        };
                        point.x += this.mapData[j].positionX;
                        point.y += this.mapData[j].positionY;
                        context.fillStyle = '#FF0000';
                        context.strokeStyle = '#3B3B3B';
                        context.lineWidth = 1;
                        context.beginPath();
                        context.arc(point.x, point.y, this.user_marks[i].radius, 0, 2 * Math.PI);
                        context.fill();
                        context.strokeText((i + 1).toString(), point.x - this.user_marks[i].radius / 3, point.y + this.user_marks[i].radius / 3);
                        context.lineWidth = 0.5;
                        context.stroke();
                        context.lineWidth = 1;
                        this.user_marks[i].positionX = point.x;
                        this.user_marks[i].positionY = point.y;
                    }
                }
            }
        }
    };
    Map.prototype.clear = function () {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    return Map;
}());
//# sourceMappingURL=Map.js.map