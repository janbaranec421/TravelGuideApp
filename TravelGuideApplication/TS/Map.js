var Map = (function () {
    function Map(parent, tileWidth, tileHeight, mapWidth, mapHeight) {
        var _this = this;
        if (tileWidth === void 0) { tileWidth = 150; }
        if (tileHeight === void 0) { tileHeight = 150; }
        if (mapWidth === void 0) { mapWidth = 500; }
        if (mapHeight === void 0) { mapHeight = 500; }
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
        var centerX = (this.mapWidth / 2) - (this.tileWidth / 2);
        var centerY = (this.mapHeight / 2) - (this.tileWidth / 2);
        console.log(this.lat2tileY(48.588712, 15));
        console.log(this.long2tileX(17.838396, 15));
        // CENTER tile
        this.fetchTile(15, this.long2tileX(17.838396, 15), this.lat2tileY(48.588712, 15), function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX, centerY, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // RIGHT 
        this.fetchTile(15, 18008, 11310, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX + _this.tileWidth, centerY, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // LEFT
        this.fetchTile(15, 18006, 11310, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX - _this.tileWidth, centerY, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // BOTTOM
        this.fetchTile(15, 18007, 11311, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX, centerY + _this.tileHeight, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // BOTTOM RIGHT
        this.fetchTile(15, 18008, 11311, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX + _this.tileWidth, centerY + _this.tileHeight, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // BOTTOM LEFT
        this.fetchTile(15, 18006, 11311, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX - _this.tileWidth, centerY + _this.tileHeight, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // TOP 
        this.fetchTile(15, 18007, 11309, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX, centerY - _this.tileHeight, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // TOP LEFT
        this.fetchTile(15, 18006, 11309, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX - _this.tileWidth, centerY - _this.tileHeight, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
        // TOP RIGHT
        this.fetchTile(15, 18008, 11309, function (data) {
            console.log(_this._mapData);
            _this.DrawTile(_this._mapData, centerX + _this.tileWidth, centerY - _this.tileHeight, Layer.Buildings | Layer.Landuse | Layer.Places | Layer.Pois | Layer.Water);
        });
    }
    Map.prototype.fetchTile = function (z, x, y, callback) {
        var _this = this;
        var fetchURL = "https://vector.mapzen.com/osm/all/" + z + "/" + x + "/" + y + ".json?api_key=vector-tiles-fd9uHhC";
        $.getJSON(fetchURL)
            .done(function (data) {
            _this._mapData = data;
            callback(data);
        })
            .fail(function () {
            console.log("Download failed");
        });
    };
    Map.prototype.printGeometryTypes = function (data) {
        for (var i = 0; i < data.features.length; i++) {
            if (data.features[i].geometry.type == "MultiPoint" || data.features[i].geometry.type == "Point")
                console.log("Geometry:     " + data.features[i].geometry.type);
        }
    };
    // [longitude, latitude] bounding box of data 
    Map.prototype.getBoundingBox = function (data) {
        var point, latitude, longitude;
        var bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
        if (typeof data == 'undefined' || data === null)
            console.log("`function getBoundingBox: parameter 'data' not undefined or null");
        data = data.features;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].geometry.coordinates.length; j++) {
                if (data[i].geometry.type == "MultiLineString" || data[i].geometry.type == "Polygon") {
                    for (var k = 0; k < data[i].geometry.coordinates[j].length; k++) {
                        longitude = data[i].geometry.coordinates[j][k][0];
                        latitude = data[i].geometry.coordinates[j][k][1];
                        bounds = this.compareBoundingData(latitude, longitude, bounds);
                    }
                }
                else if (data[i].geometry.type == "MultiPolygon") {
                    for (var k = 0; k < data[i].geometry.coordinates[j].length; k++) {
                        for (var l = 0; l < data[i].geometry.coordinates[j][k].length; l++) {
                            longitude = data[i].geometry.coordinates[j][k][l][0];
                            latitude = data[i].geometry.coordinates[j][k][l][1];
                            bounds = this.compareBoundingData(latitude, longitude, bounds);
                        }
                    }
                }
                else if (data[i].geometry.type == "MultiPoint" || data[i].geometry.type == "LineString") {
                    longitude = data[i].geometry.coordinates[j][0];
                    latitude = data[i].geometry.coordinates[j][1];
                    bounds = this.compareBoundingData(latitude, longitude, bounds);
                }
                else if (data[i].geometry.type == "Point") {
                    longitude = data[i].geometry.coordinates[0];
                    latitude = data[i].geometry.coordinates[1];
                    bounds = this.compareBoundingData(latitude, longitude, bounds);
                }
            }
        }
        // Returns an object that contains the bounds of this GeoJSON
        // data. The keys of this object describe a box formed by the
        // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
        return bounds;
    };
    Map.prototype.compareBoundingData = function (latitude, longitude, bounds) {
        if (bounds.xMax == 0 || bounds.xMin == 0) {
            bounds.xMax = longitude;
            bounds.xMin = longitude;
        }
        if (bounds.yMax == 0 || bounds.yMin == 0) {
            bounds.yMax = latitude;
            bounds.yMin = latitude;
        }
        bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
        bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
        bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
        bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
        return bounds;
    };
    Map.prototype.DrawTile = function (data, shiftX, shiftY, layers) {
        if (layers & Layer.Boundaries) {
            console.log("-------------   Boundaries geometry -------------");
            this.printGeometryTypes(data.boundaries);
            this.DrawLayer(data.boundaries, shiftX, shiftY);
        }
        if (layers & Layer.Buildings) {
            console.log("-------------  Buildings geometry  -------------");
            this.printGeometryTypes(data.buildings);
            this.DrawLayer(data.buildings, shiftX, shiftY);
        }
        if (layers & Layer.Earth) {
            console.log("-------------  Earth geometry      -------------");
            this.printGeometryTypes(data.earth);
        }
        if (layers & Layer.Landuse) {
            console.log("-------------  Landuse geometry    -------------");
            this.printGeometryTypes(data.landuse);
            this.DrawLayer(data.landuse, shiftX, shiftY);
        }
        if (layers & Layer.Landuse_Labels) {
            console.log("-------------  Landuse_Labels geometry  -------------");
            this.printGeometryTypes(data.landuse_labels);
            this.DrawLayer(data.landuse_labels, shiftX, shiftY);
        }
        if (layers & Layer.Places) {
            console.log("-------------  Places geometry     -------------");
            this.printGeometryTypes(data.places);
            this.DrawLayer(data.places, shiftX, shiftY);
        }
        if (layers & Layer.Pois) {
            console.log("-------------  Places of Interest geometry     -------------");
            this.printGeometryTypes(data.pois);
            this.DrawLayer(data.pois, shiftX, shiftY);
        }
        if (layers & Layer.Roads) {
            console.log("-------------  Roads geometry     -------------");
            this.printGeometryTypes(data.roads);
            this.DrawLayer(data.roads, shiftX, shiftY);
        }
        if (layers & Layer.Transit) {
            console.log("-------------  Transit geometry     -------------");
            this.printGeometryTypes(data.transit);
            this.DrawLayer(data.transit, shiftX, shiftY);
        }
        if (layers & Layer.Water) {
            console.log("-------------  Water geometry     -------------");
            this.printGeometryTypes(data.water);
            this.DrawLayer(data.water, shiftX, shiftY);
        }
    };
    Map.prototype.DrawLayer = function (data, shiftX, shiftY) {
        var context, bounds, point, latitude, longitude, xScale, yScale, scale;
        var canvas = $("#mapCanvas")[0];
        context = canvas.getContext('2d');
        context.strokeStyle = '#636363';
        bounds = this.getBoundingBox(data);
        // Determine how much to scale our coordinates by
        xScale = this.tileWidth / Math.abs(bounds.xMax - bounds.xMin);
        yScale = this.tileHeight / Math.abs(bounds.yMax - bounds.yMin);
        scale = xScale < yScale ? xScale : yScale;
        if (typeof data == 'undefined' || data === null)
            console.log("`function DrawLayer: parameter 'data' not undefined or null");
        data = data.features;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].geometry.coordinates.length; j++) {
                if (data[i].geometry.type == "Polygon" || data[i].geometry.type == "MultiLineString") {
                    for (var k = 0; k < data[i].geometry.coordinates[j].length; k++) {
                        longitude = data[i].geometry.coordinates[j][k][0];
                        latitude = data[i].geometry.coordinates[j][k][1];
                        point = this.MercatorProjection(longitude, latitude);
                        // Scale the points of the coordinate
                        // to fit inside bounding box
                        point = {
                            x: (longitude - bounds.xMin) * xScale,
                            y: (bounds.yMax - latitude) * yScale
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
                    context.strokeStyle = '#636363';
                    context.stroke();
                    context.strokeStyle = '#636363';
                    continue;
                }
                else if (data[i].geometry.type == "MultiPolygon") {
                    for (var k = 0; k < data[i].geometry.coordinates[j].length; k++) {
                        for (var l = 0; l < data[i].geometry.coordinates[j][k].length; l++) {
                            longitude = data[i].geometry.coordinates[j][k][l][0];
                            latitude = data[i].geometry.coordinates[j][k][l][1];
                            point = this.MercatorProjection(longitude, latitude);
                            // Scale the points of the coordinate
                            // to fit inside bounding box
                            point = {
                                x: (longitude - bounds.xMin) * xScale,
                                y: (bounds.yMax - latitude) * yScale
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
                        context.strokeStyle = '#636363';
                        context.stroke();
                        context.strokeStyle = '#636363';
                    }
                    continue;
                }
                else if (data[i].geometry.type == "LineString" || data[i].geometry.type == "MultiPoint") {
                    longitude = data[i].geometry.coordinates[j][0];
                    latitude = data[i].geometry.coordinates[j][1];
                }
                else if (data[i].geometry.type == "Point") {
                    longitude = data[i].geometry.coordinates[0];
                    latitude = data[i].geometry.coordinates[1];
                }
                point = this.MercatorProjection(longitude, latitude);
                // Scale the points of the coordinate
                // to fit inside bounding box
                point = {
                    x: (longitude - bounds.xMin) * xScale,
                    y: (bounds.yMax - latitude) * yScale
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
        }
        // Border Tile
        context.beginPath();
        context.moveTo(0 + shiftX, 0 + shiftY);
        context.lineTo(this.tileWidth + shiftX, 0 + shiftY);
        context.lineTo(this.tileWidth + shiftX, this.tileHeight + shiftY);
        context.lineTo(0 + shiftX, this.tileHeight + shiftY);
        context.lineTo(0 + shiftX, 0 + shiftY);
        context.stroke();
        console.log("Layer draw");
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
    return Map;
})();
//# sourceMappingURL=Map.js.map