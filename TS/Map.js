var Map = (function () {
    function Map(parent, tileWidth, tileHeight, mapWidth, mapHeight) {
        if (tileWidth === void 0) { tileWidth = 260; }
        if (tileHeight === void 0) { tileHeight = 260; }
        if (mapWidth === void 0) { mapWidth = 500; }
        if (mapHeight === void 0) { mapHeight = 500; }
        this._mapData = [];
        this.root = parent;
        // width and height MUST be set through attribute 
        // AND NOT BY css property n order to stop streching canvas incorrectly
        $(this.root)
            .append($("<canvas>")
            .attr("id", "mapCanvas")
            .attr("width", mapWidth + "px")
            .attr("height", mapHeight + "px")
            .css("top", "250px")
            .css("left", "250px")
            .css("border", "solid black 2px")
            .css("position", "absolute"));
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }
    Map.prototype.display = function (longitude, latitude, zoom, layers) {
        var _this = this;
        this._mapData = [];
        // [X,Y] Position in map tiles scope
        this.currentTileX = this.long2tileX(longitude, zoom);
        this.currentTileY = this.lat2tileY(latitude, zoom);
        this.currentLongitude = longitude;
        this.currentLatitude = latitude;
        this.currentZoom = zoom;
        // [X,Y] Position on canvas element
        var centerX = (this.mapWidth / 2) - (this.tileWidth / 2);
        var centerY = (this.mapHeight / 2) + (this.tileWidth / 2);
        // CENTER tile
        this.fetchTile(this.currentTileX, this.currentTileY, zoom, function (data) {
            console.log("\nCENTER");
            var MapTileData = new MapTile(data, _this.currentTileX, _this.currentTileY, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX, centerY);
        });
        // RIGHT 
        this.fetchTile(this.currentTileX + 1, this.currentTileY, zoom, function (data) {
            console.log("\nRIGHT");
            var MapTileData = new MapTile(data, _this.currentTileX + 1, _this.currentTileY, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX + _this.tileWidth, centerY);
        });
        // LEFT
        this.fetchTile(this.currentTileX - 1, this.currentTileY, zoom, function (data) {
            console.log("\nLEFT");
            var MapTileData = new MapTile(data, _this.currentTileX - 1, _this.currentTileY, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX - _this.tileWidth, centerY);
        });
        // BOTTOM
        this.fetchTile(this.currentTileX, this.currentTileY + 1, zoom, function (data) {
            console.log("\nBOTTOM");
            var MapTileData = new MapTile(data, _this.currentTileX, _this.currentTileY + 1, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX, centerY + _this.tileHeight);
        });
        // BOTTOM RIGHT
        this.fetchTile(this.currentTileX + 1, this.currentTileY + 1, zoom, function (data) {
            console.log("\nBOTTOM RIGHT");
            var MapTileData = new MapTile(data, _this.currentTileX + 1, _this.currentTileY + 1, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX + _this.tileWidth, centerY + _this.tileHeight);
        });
        // BOTTOM LEFT
        this.fetchTile(this.currentTileX - 1, this.currentTileY + 1, zoom, function (data) {
            console.log("\nBOTTOM LEFT");
            var MapTileData = new MapTile(data, _this.currentTileX - 1, _this.currentTileY + 1, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX - _this.tileWidth, centerY + _this.tileHeight);
        });
        // TOP 
        this.fetchTile(this.currentTileX, this.currentTileY - 1, zoom, function (data) {
            console.log("\nTOP");
            var MapTileData = new MapTile(data, _this.currentTileX, _this.currentTileY - 1, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX, centerY - _this.tileHeight);
        });
        // TOP LEFT
        this.fetchTile(this.currentTileX - 1, this.currentTileY - 1, zoom, function (data) {
            console.log("\nTOP LEFT");
            var MapTileData = new MapTile(data, _this.currentTileX - 1, _this.currentTileY - 1, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX - _this.tileWidth, centerY - _this.tileHeight);
        });
        // TOP RIGHT
        this.fetchTile(this.currentTileX + 1, this.currentTileY - 1, zoom, function (data) {
            console.log("\nTOP RIGHT");
            var MapTileData = new MapTile(data, _this.currentTileX + 1, _this.currentTileY - 1, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX + _this.tileWidth, centerY - _this.tileHeight);
        });
    };
    Map.prototype.fetchTile = function (x, y, z, callback) {
        var fetchURL = "https://vector.mapzen.com/osm/all/" + z + "/" + x + "/" + y + ".json?api_key=vector-tiles-fd9uHhC";
        $.getJSON(fetchURL)
            .done(function (data) {
            callback(data);
        })
            .fail(function () {
            console.log("Download failed");
        });
    };
    Map.prototype.printGeometryTypes = function (data) {
        for (var i = 0; i < data.features.length; i++) {
            //if (data.features[i].geometry.type == "MultiPolygon" || data.features[i].geometry.type == "Polygon")
            console.log("Geometry:     " + data.features[i].geometry.type);
        }
    };
    Map.prototype.DrawTile = function (mapTile, shiftX, shiftY) {
        if (mapTile.layers & Layer.Earth) {
            console.log("-------------  Earth geometry      -------------");
            //this.printGeometryTypes(mapTile.data.earth);
            this.DrawLayer(mapTile, mapTile.data.earth, Layer.Earth, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Boundaries) {
            console.log("-------------   Boundaries geometry -------------");
            //this.printGeometryTypes(mapTile.data.boundaries);
            this.DrawLayer(mapTile, mapTile.data.boundaries, Layer.Boundaries, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Buildings) {
            console.log("-------------  Buildings geometry  -------------");
            //this.printGeometryTypes(mapTile.data.buildings);
            this.DrawLayer(mapTile, mapTile.data.buildings, Layer.Buildings, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Landuse) {
            console.log("-------------  Landuse geometry    -------------");
            //this.printGeometryTypes(mapTile.data.landuse);
            this.DrawLayer(mapTile, mapTile.data.landuse, Layer.Landuse, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Landuse_Labels) {
            console.log("-------------  Landuse_Labels geometry  -------------");
            //this.printGeometryTypes(mapTile.data.landuse_labels);
            this.DrawLayer(mapTile, mapTile.data.landuse_labels, Layer.Landuse_Labels, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Places) {
            console.log("-------------  Places geometry     -------------");
            //this.printGeometryTypes(mapTile.data.places);
            this.DrawLayer(mapTile, mapTile.data.places, Layer.Places, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Pois) {
            console.log("-------------  Places of Interest geometry     -------------");
            //this.printGeometryTypes(mapTile.data.pois);
            this.DrawLayer(mapTile, mapTile.data.pois, Layer.Pois, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Roads) {
            console.log("-------------  Roads geometry     -------------");
            //this.printGeometryTypes(mapTile.data.roads);
            this.DrawLayer(mapTile, mapTile.data.roads, Layer.Roads, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Transit) {
            console.log("-------------  Transit geometry     -------------");
            //this.printGeometryTypes(mapTile.data.transit);
            this.DrawLayer(mapTile, mapTile.data.transit, Layer.Transit, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Water) {
            console.log("-------------  Water geometry     -------------");
            //this.printGeometryTypes(mapTile.data.water);
            this.DrawLayer(mapTile, mapTile.data.water, Layer.Water, shiftX, shiftY);
        }
    };
    Map.prototype.DrawLayer = function (mapTile, data, layer, shiftX, shiftY) {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.strokeStyle = '#333333';
        if (typeof data == 'undefined' || data === null)
            console.log("func DrawLayer: parameter 'data' not undefined or null");
        data = data.features;
        for (var i = 0; i < data.length; i++) {
            if (data[i].geometry.type == "Point") {
                this.strokePoint(data[i], mapTile, context, layer, shiftX, shiftY);
            }
            if (data[i].geometry.type == "MultiPoint") {
                this.strokeMultiPoint(data[i], mapTile, context, layer, shiftX, shiftY);
            }
            if (data[i].geometry.type == "LineString") {
                this.strokeLineString(data[i], mapTile, context, layer, shiftX, shiftY);
            }
            if (data[i].geometry.type == "MultiLineString") {
                this.strokeMultiLineString(data[i], mapTile, context, layer, shiftX, shiftY);
            }
            if (data[i].geometry.type == "Polygon") {
                this.strokePolygon(data[i], mapTile, context, layer, shiftX, shiftY);
            }
            if (data[i].geometry.type == "MultiPolygon") {
                this.strokeMultiPolygon(data[i], mapTile, context, layer, shiftX, shiftY);
            }
        }
        /*
        // Border Tile
        context.beginPath();
        context.moveTo(0 + shiftX, 0 + shiftY);
        context.lineTo(this.tileWidth + shiftX, 0 + shiftY);
        context.lineTo(this.tileWidth + shiftX, this.tileHeight + shiftY);
        context.lineTo(0 + shiftX, this.tileHeight + shiftY);
        context.lineTo(0 + shiftX, 0 + shiftY);
        context.stroke();
        */
        console.log("Layer draw");
    };
    Map.prototype.strokeLineString = function (shape, mapTile, context, layer, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            longitude = shape.geometry.coordinates[j][0];
            latitude = shape.geometry.coordinates[j][1];
            point = this.MercatorProjection(longitude, latitude);
            // Scale the points of the coordinate
            // to fit inside bounding box
            point = {
                x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
            };
            // shifts tile relative to others
            point.x += shiftX;
            point.y += shiftY;
            // If this is the first coordinate in a shape, start a new path
            if (j === 0) {
                context.beginPath();
                context.moveTo(point.x, point.y);
            }
            else {
                context.lineTo(point.x, point.y);
            }
        }
        if (layer == Layer.Boundaries) {
            this.styleBoundariesContext(shape, context);
        }
        console.log(shape.properties.kind + ":   " + shape.properties.name);
        context.stroke();
    };
    Map.prototype.strokeMultiLineString = function (shape, mapTile, context, layer, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++) {
                longitude = shape.geometry.coordinates[j][k][0];
                latitude = shape.geometry.coordinates[j][k][1];
                point = this.MercatorProjection(longitude, latitude);
                // Scale the points of the coordinate
                // to fit inside bounding box
                point = {
                    x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                    y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
                };
                // shifts tile relative to others
                point.x += shiftX;
                point.y += shiftY;
                // If this is the first coordinate in a shape, start a new path
                if (k === 0) {
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                }
                else {
                    context.lineTo(point.x, point.y);
                }
            }
            context.stroke();
        }
    };
    Map.prototype.strokePoint = function (shape, mapTile, context, layer, shiftX, shiftY) {
        var longitude, latitude, point;
        longitude = shape.geometry.coordinates[0];
        latitude = shape.geometry.coordinates[1];
        point = this.MercatorProjection(longitude, latitude);
        // Scale the points of the coordinate
        // to fit inside bounding box
        point = {
            x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
            y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
        };
        // shifts tile relative to others
        point.x += shiftX;
        point.y += shiftY;
        if (this.currentZoom <= 5) {
            context.fillStyle = '#ff0000';
            context.textAlign = "center";
            context.fillText(shape.properties.name, point.x, point.y);
        }
        /*
        context.fillStyle = '#b30000';
        context.textAlign = "center";
        context.fillText(shape.properties.addr_street, point.x, point.y);
        */
        context.stroke();
    };
    Map.prototype.strokeMultiPoint = function (shape, mapTile, context, layer, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            longitude = shape.geometry.coordinates[j][0];
            latitude = shape.geometry.coordinates[j][1];
            point = this.MercatorProjection(longitude, latitude);
            // Scale the points of the coordinate
            // to fit inside bounding box
            point = {
                x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
            };
            // shifts tile relative to others
            point.x += shiftX;
            point.y += shiftY;
            // If this is the first coordinate in a shape, start a new path
            if (j === 0) {
                context.beginPath();
                context.moveTo(point.x, point.y);
            }
            else {
                context.lineTo(point.x, point.y);
            }
        }
        context.stroke();
    };
    Map.prototype.strokePolygon = function (shape, mapTile, context, layer, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++) {
                longitude = shape.geometry.coordinates[j][k][0];
                latitude = shape.geometry.coordinates[j][k][1];
                point = this.MercatorProjection(longitude, latitude);
                // Scale the points of the coordinate
                // to fit inside bounding box
                point = {
                    x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                    y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
                };
                // shifts tile relative to others
                point.x += shiftX;
                point.y += shiftY;
                // If this is the first coordinate in a shape, start a new path
                if (k === 0) {
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                }
                else {
                    context.lineTo(point.x, point.y);
                }
            }
            context.fillStyle = '#808080';
            context.fill();
            context.stroke();
        }
    };
    Map.prototype.strokeMultiPolygon = function (shape, mapTile, context, layer, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++) {
                for (var l = 0; l < shape.geometry.coordinates[j][k].length; l++) {
                    longitude = shape.geometry.coordinates[j][k][l][0];
                    latitude = shape.geometry.coordinates[j][k][l][1];
                    point = this.MercatorProjection(longitude, latitude);
                    // Scale the points of the coordinate
                    // to fit inside bounding box
                    point = {
                        x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
                        y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
                    };
                    // shifts tile relative to others
                    point.x += shiftX;
                    point.y += shiftY;
                    // If this is the first coordinate in a shape, start a new path
                    if (l === 0) {
                        context.beginPath();
                        context.moveTo(point.x, point.y);
                    }
                    else {
                        context.lineTo(point.x, point.y);
                    }
                }
                context.fillStyle = '#808080';
                context.fill();
                context.stroke();
            }
        }
    };
    Map.prototype.MercatorProjection = function (longitude, latitude) {
        var radius = 6378137;
        var max = 85.0511287798;
        var radians = Math.PI / 180;
        var point = { x: 0, y: 0 };
        point.x = radius * longitude * radians;
        point.y = Math.max(Math.min(max, latitude), -max) * radians;
        point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));
        return point;
    };
    Map.prototype.long2tileX = function (lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    };
    Map.prototype.lat2tileY = function (lat, zoom) {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    };
    Map.prototype.Xtile2long = function (x, zoom) {
        return (x / Math.pow(2, zoom) * 360 - 180);
    };
    Map.prototype.Ytile2lat = function (y, zoom) {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    };
    Map.prototype.tile2boundingBox = function (x, y, zoom) {
        var bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
        bounds.yMin = this.Ytile2lat(y, zoom);
        bounds.yMax = this.Ytile2lat(y + 1, zoom);
        bounds.xMin = this.Xtile2long(x, zoom);
        bounds.xMax = this.Xtile2long(x + 1, zoom);
        return bounds;
    };
    Map.prototype.clear = function () {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    Map.prototype.styleBoundariesContext = function (shape, context) {
        if (shape.properties.kind == "country")
            context.lineWidth = 2;
        if (shape.properties.kind == "state") {
            context.strokeStyle = "#333333";
            context.lineWidth = 0.6;
        }
        if (shape.properties.kind == "macroregion") {
            context.strokeStyle = "#333333";
            context.lineWidth = 0.6;
        }
    };
    return Map;
})();
//# sourceMappingURL=Map.js.map