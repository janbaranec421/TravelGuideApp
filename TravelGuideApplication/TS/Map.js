var Map = (function () {
    function Map(parent, tileWidth, tileHeight, mapWidth, mapHeight) {
        if (tileWidth === void 0) { tileWidth = 250; }
        if (tileHeight === void 0) { tileHeight = 250; }
        if (mapWidth === void 0) { mapWidth = 750; }
        if (mapHeight === void 0) { mapHeight = 750; }
        this._mapData = [];
        this.client_marks = [];
        this.root = parent;
        // width and height MUST be set through attribute 
        // AND NOT BY css property n order to stop streching canvas incorrectly
        $(this.root)
            .append($("<canvas>")
            .attr("id", "mapCanvas")
            .attr("width", mapWidth + "px")
            .attr("height", mapHeight + "px")
            .css("width", "90vw")
            .css("display", "block")
            .css("margin", "auto")
            .css("padding", "0px")
            .css("margin-top", "25px")
            .css("border", "solid black 2px"));
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }
    Map.prototype.display = function (latitude, longitude, zoom, layers) {
        var _this = this;
        this.clear();
        this._mapData = [];
        console.log("Latitude: " + latitude);
        console.log("Longitude: " + longitude);
        this.layers = layers;
        // [X,Y] Position in map tiles scope
        this.currentTileX = Converter.long2tileX(longitude, zoom);
        this.currentTileY = Converter.lat2tileY(latitude, zoom);
        this.currentLatitude = latitude;
        this.currentLongitude = longitude;
        this.currentZoom = zoom;
        // [X,Y] Position on canvas element
        var centerX = (this.mapWidth / 2) - (this.tileWidth / 2);
        var centerY = (this.mapHeight / 2) - (this.tileWidth / 2);
        for (var x = -2; x <= 2; x++) {
            for (var y = -2; y <= 2; y++) {
                // Outside tiles
                if (x == 2 || x == -2 || y == 2 || y == -2) {
                    var MapTileData = new MapTile(null, this.currentTileX + x, this.currentTileY + y, zoom, layers, centerX - (this.tileWidth * (-1 * x)), centerY - (this.tileHeight * (-1 * y)), this.tileWidth, this.tileHeight);
                    this._mapData.push(MapTileData);
                }
                else {
                    this.fetchTile(this.currentTileX + x, this.currentTileY + y, zoom, x, y, function (posX, posY, data) {
                        var MapTileData = new MapTile(data, _this.currentTileX + posX, _this.currentTileY + posY, zoom, layers, centerX - (_this.tileWidth * (-1 * posX)), centerY - (_this.tileHeight * (-1 * posY)), _this.tileWidth, _this.tileHeight);
                        _this._mapData.push(MapTileData);
                        _this.DrawTile(MapTileData);
                    });
                }
            }
        }
        console.log(this._mapData);
    };
    Map.prototype.shiftMap = function (shiftX, shiftY) {
        for (var i = 0; i < this._mapData.length; i++) {
            this._mapData[i].positionX += shiftX;
            this._mapData[i].positionY += shiftY;
        }
        this.clear();
        for (var i = 0; i < this._mapData.length; i++) {
            this.DrawTile(this._mapData[i]);
        }
        this.updateMap();
    };
    Map.prototype.updateMap = function () {
        // Loop collection to find placeholders
        for (var i = 0; i < this._mapData.length; i++) {
            // If tile is placeholder
            if (this._mapData[i].data == null) {
                var right = this._mapData[i].positionX + this._mapData[i].tileWidth;
                var left = this._mapData[i].positionX;
                var top = this._mapData[i].positionY;
                var bot = this._mapData[i].positionY + this._mapData[i].tileHeight;
                // Check if tile intersect map visible area
                if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top) {
                    var nextLeft = false;
                    var nextRight = false;
                    var nextTop = false;
                    var nextBot = false;
                    // Check if this tile have neighbor
                    for (var j = 0; j < this._mapData.length; j++) {
                        if (this._mapData[i].tileX + 1 == this._mapData[j].tileX && this._mapData[i].tileY == this._mapData[j].tileY)
                            nextRight = true;
                        if (this._mapData[i].tileX - 1 == this._mapData[j].tileX && this._mapData[i].tileY == this._mapData[j].tileY)
                            nextLeft = true;
                        if (this._mapData[i].tileY + 1 == this._mapData[j].tileY && this._mapData[i].tileX == this._mapData[j].tileX)
                            nextBot = true;
                        if (this._mapData[i].tileY - 1 == this._mapData[j].tileY && this._mapData[i].tileX == this._mapData[j].tileX)
                            nextTop = true;
                    }
                    var tileX = this._mapData[i].tileX;
                    var tileY = this._mapData[i].tileY;
                    var posX = this._mapData[i].positionX;
                    var posY = this._mapData[i].positionY;
                    var tileWidth = this._mapData[i].tileWidth;
                    var tileHeight = this._mapData[i].tileHeight;
                    // If does have neighbor, create placeholders for them
                    if (!nextRight) {
                        var MapTileData = new MapTile(null, tileX + 1, tileY, this.currentZoom, this.layers, posX + tileWidth, posY, this.tileWidth, this.tileHeight);
                        this._mapData.push(MapTileData);
                    }
                    if (!nextLeft) {
                        var MapTileData = new MapTile(null, tileX - 1, tileY, this.currentZoom, this.layers, posX - tileWidth, posY, this.tileWidth, this.tileHeight);
                        this._mapData.push(MapTileData);
                    }
                    if (!nextBot) {
                        var MapTileData = new MapTile(null, tileX, tileY + 1, this.currentZoom, this.layers, posX, posY + tileHeight, this.tileWidth, this.tileHeight);
                        this._mapData.push(MapTileData);
                    }
                    if (!nextTop) {
                        var MapTileData = new MapTile(null, tileX, tileY - 1, this.currentZoom, this.layers, posX, posY - tileHeight, this.tileWidth, this.tileHeight);
                        this._mapData.push(MapTileData);
                    }
                    // At last, fill intersecting tile with data to render and remove his placeholder
                    this.fillPlaceholder(tileX, tileY);
                }
            }
        }
    };
    Map.prototype.fillPlaceholder = function (tileX, tileY) {
        var _this = this;
        // Search corresponding placeholder and fetch data for him
        for (var i = 0; i < this._mapData.length; i++) {
            if (this._mapData[i].data == null) {
                if (this._mapData[i].tileX == tileX && this._mapData[i].tileY == tileY) {
                    this.fetchTile(tileX, tileY, this.currentZoom, tileX, tileY, function (argX, argY, data) {
                        // Searching placeholder to replace in callback, because there is possible change of his coordinates during of download
                        // In this way, coordinates are corresponding with actual position
                        for (var j = 0; j < _this._mapData.length; j++) {
                            if (_this._mapData[j].tileX == argX && _this._mapData[j].tileY == argY) {
                                var MapTileData = new MapTile(data, _this._mapData[j].tileX, _this._mapData[j].tileY, _this.currentZoom, _this.layers, _this._mapData[j].positionX, _this._mapData[j].positionY, _this._mapData[j].tileWidth, _this._mapData[j].tileHeight);
                                _this._mapData.splice(j, 1);
                                _this._mapData.push(MapTileData);
                                _this.DrawTile(MapTileData);
                                console.log(MapTileData);
                            }
                        }
                    });
                }
            }
        }
    };
    Map.prototype.fetchTile = function (x, y, z, argX, argY, callback) {
        var fetchURL = "http://tile.mapzen.com/mapzen/vector/v1/all/" + z + "/" + x + "/" + y + ".json?api_key=mapzen-fd9uHhC";
        $.getJSON(fetchURL)
            .done(function (data) {
            callback(argX, argY, data);
        })
            .fail(function () {
            console.log("Download of tile: Z=" + z + ", X=" + x + ", Y=" + y + " failed");
        });
    };
    Map.prototype.DrawTile = function (mapTile) {
        this.DrawLayer(mapTile);
        /*
        if (mapTile.layers & Layer.Water) {
            console.log("-------------  Water geometry     -------------");
            //this.printGeometryTypes(mapTile.data.water);
            this.DrawLayer(mapTile, mapTile.data.water, Layer.Water, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Earth) {
            console.log("-------------  Earth geometry      -------------");
            //this.printGeometryTypes(mapTile.data.earth);
            this.DrawLayer(mapTile, mapTile.data.earth, Layer.Earth, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Landuse) {
            console.log("-------------  Landuse geometry    -------------");
            //this.printGeometryTypes(mapTile.data.landuse);
            this.DrawLayer(mapTile, mapTile.data.landuse, Layer.Landuse, shiftX, shiftY);
        }
        if (mapTile.layers & Layer.Buildings) {
            console.log("-------------  Buildings geometry  -------------");
            //this.printGeometryTypes(mapTile.data.buildings);
            this.DrawLayer(mapTile, mapTile.data.buildings, Layer.Buildings, shiftX, shiftY);
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
        if (mapTile.layers & Layer.Boundaries) {
            console.log("-------------   Boundaries geometry -------------");
            //this.printGeometryTypes(mapTile.data.boundaries);
            this.DrawLayer(mapTile, mapTile.data.boundaries, Layer.Boundaries, shiftX, shiftY);
        }
        */
    };
    Map.prototype.DrawLayer = function (mapTile) {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.strokeStyle = '#333333';
        var shiftX = mapTile.positionX;
        var shiftY = mapTile.positionY;
        if (mapTile.data == null) {
            return;
        }
        for (var i = 0; i < mapTile.sortedData.length; i++) {
            if (mapTile.sortedData[i].geometry.type == "Point") {
                this.drawPoint(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "MultiPoint") {
                this.drawMultiPoint(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "LineString") {
                this.drawLineString(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "MultiLineString") {
                this.drawMultiLineString(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "Polygon") {
                this.drawPolygon(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "MultiPolygon") {
                this.drawMultiPolygon(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
        }
        //console.log("------------");
        //console.log("Tile draw");
    };
    Map.prototype.drawLineString = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
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
            // shifts tile relative to others
            point.x += shiftX;
            point.y += shiftY;
            if (j === 0) {
                context.beginPath();
                context.moveTo(point.x, point.y);
            }
            else {
                context.lineTo(point.x, point.y);
            }
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, context);
        }
        if (shape.properties.layer & Layer.Boundaries) {
            this.styleBoundariesContext(shape, context);
        }
        if (shape.properties.layer & Layer.Roads) {
            this.styleRoadsContext(shape, context);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, context);
        }
        context.stroke();
    };
    Map.prototype.drawMultiLineString = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
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
            if (shape.properties.layer & Layer.Water) {
                this.styleWaterContext(shape, context);
            }
            if (shape.properties.layer & Layer.Earth) {
                this.styleEarthContext(shape, context);
            }
            if (shape.properties.layer & Layer.Boundaries) {
                this.styleBoundariesContext(shape, context);
            }
            if (shape.properties.layer & Layer.Roads) {
                this.styleRoadsContext(shape, context);
            }
            if (shape.properties.layer & Layer.Transit) {
                this.styleTransitContext(shape, context);
            }
            context.stroke();
        }
    };
    Map.prototype.drawPoint = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        longitude = shape.geometry.coordinates[0];
        latitude = shape.geometry.coordinates[1];
        point = Converter.MercatorProjection(latitude, longitude);
        // Scale the points of the coordinate
        // to fit inside bounding box
        point = {
            x: (longitude - mapTile.boundingBox.xMin) * mapTile.xScale,
            y: (mapTile.boundingBox.yMax - latitude) * mapTile.yScale
        };
        // shifts tile relative to others
        point.x += shiftX;
        point.y += shiftY;
        context.beginPath();
        // Names of continents
        if (this.currentZoom <= 5 && (shape.properties.layer & Layer.Boundaries)) {
            context.fillStyle = 'black';
            context.textAlign = "center";
            context.fillText(shape.properties.name, point.x, point.y);
        }
        if (shape.properties.layer & Layer.Pois && shape.properties.name != undefined) {
            context.fillStyle = 'black';
            context.textAlign = "center";
            context.fillRect(point.x, point.y + 2, 3, 3);
            context.fillText(shape.properties.name, point.x, point.y);
        }
        if (shape.properties.layer & Layer.Places && shape.properties.name != undefined) {
            context.fillStyle = 'black';
            context.textAlign = "center";
            context.fillRect(point.x, point.y + 2, 3, 3);
            context.fillText(shape.properties.name, point.x, point.y);
        }
        if (shape.properties.layer & Layer.Pois) {
            this.stylePoisContext(shape, context);
        }
        if (shape.properties.layer & Layer.Places) {
            this.stylePlacesContext(shape, context);
        }
        context.stroke();
    };
    Map.prototype.drawMultiPoint = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        context.beginPath();
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
            // shifts tile relative to others
            point.x += shiftX;
            point.y += shiftY;
            if (shape.properties.layer & Layer.Pois && shape.properties.name != undefined) {
                context.fillStyle = 'black';
                context.textAlign = "center";
                context.fillRect(point.x, point.y + 2, 3, 3);
                context.fillText(shape.properties.name, point.x, point.y);
            }
        }
        context.stroke();
    };
    Map.prototype.drawPolygon = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        context.beginPath();
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
                // shifts tile relative to others
                point.x += shiftX;
                point.y += shiftY;
                // If this is the first coordinate in a shape, start a new path
                if (k === 0 && j !== 0) {
                    context.closePath();
                    context.moveTo(point.x, point.y);
                }
                context.lineTo(point.x, point.y);
            }
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, context);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, context);
        }
        if (shape.properties.layer & Layer.Buildings) {
            this.styleBuildingContext(shape, context);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, context);
        }
        context.stroke();
    };
    Map.prototype.drawMultiPolygon = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            context.beginPath();
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
                    // shifts tile relative to others
                    point.x += shiftX;
                    point.y += shiftY;
                    // If this is the first coordinate in a shape, start a new path
                    if (l === 0 && k !== 0) {
                        context.closePath();
                        context.moveTo(point.x, point.y);
                    }
                    else {
                        context.lineTo(point.x, point.y);
                    }
                }
            }
            if (shape.properties.layer & Layer.Water) {
                this.styleWaterContext(shape, context);
            }
            if (shape.properties.layer & Layer.Earth) {
                this.styleEarthContext(shape, context);
            }
            if (shape.properties.layer & Layer.Landuse) {
                this.styleLanduseContext(shape, context);
            }
            if (shape.properties.layer & Layer.Buildings) {
                this.styleBuildingContext(shape, context);
            }
            if (shape.properties.layer & Layer.Transit) {
                this.styleTransitContext(shape, context);
            }
            context.stroke();
        }
    };
    Map.prototype.styleBoundariesContext = function (shape, context) {
        context.strokeStyle = "#8e8e8e";
        switch (shape.properties.kind) {
            case "country": {
                context.strokeStyle = "#8e8e8e";
                context.lineWidth = 1.5;
                break;
            }
            case "state": {
                context.strokeStyle = "#A5A5A5";
                context.lineWidth = 0.7;
                break;
            }
            case "macroregion": {
                context.strokeStyle = "#A5A5A5";
                context.lineWidth = 0.7;
                break;
            }
        }
    };
    Map.prototype.styleRoadsContext = function (shape, context) {
        context.lineWidth = 1.5;
        context.strokeStyle = "#ffffff";
        switch (shape.properties.kind) {
            case "highway":
                {
                    context.strokeStyle = "#fffde8";
                    context.lineWidth = 3;
                    break;
                }
                ;
            case "major_road":
                {
                    context.strokeStyle = "white";
                    context.lineWidth = 1.75;
                    break;
                }
                ;
            case "minor_road":
                {
                    context.strokeStyle = "white";
                    context.lineWidth = 1.5;
                    break;
                }
                ;
            case "rail":
                {
                    context.strokeStyle = "#b2b2ae";
                    context.lineWidth = 1.5;
                    break;
                }
                ;
            case "path":
                {
                    context.strokeStyle = "#c6c6c6";
                    context.lineWidth = 1;
                    break;
                }
                ;
            case "ferry":
                {
                    context.strokeStyle = "#ffffff";
                    break;
                }
                ;
            case "piste":
                {
                    context.strokeStyle = "#ffffff";
                    break;
                }
                ;
            case "aerialway":
                {
                    context.strokeStyle = "#ffffff";
                    break;
                }
                ;
            case "aeroway":
                {
                    context.strokeStyle = "#ffffff";
                    break;
                }
                ;
            case "racetrack":
                {
                    context.strokeStyle = "#ffffff";
                    break;
                }
                ;
            case "portage_way":
                {
                    context.strokeStyle = "#ffffff";
                    break;
                }
                ;
        }
        var holdColor = context.strokeStyle;
        context.lineWidth = context.lineWidth + 1;
        context.strokeStyle = "#7c7c7c";
        context.stroke();
        context.lineWidth = context.lineWidth - 1;
        context.strokeStyle = holdColor;
        context.stroke();
    };
    Map.prototype.styleBuildingContext = function (shape, context) {
        context.strokeStyle = "#494949";
        context.lineWidth = 0.2;
        context.fillStyle = "#e7deca";
        context.fill();
    };
    Map.prototype.styleEarthContext = function (shape, context) {
        context.fillStyle = '#eaeaea';
        context.lineWidth = 0.6;
        context.fill();
    };
    Map.prototype.styleLanduseContext = function (shape, context) {
        context.fillStyle = '#e0d0a6';
        context.strokeStyle = "#8e8e8e";
        context.lineWidth = 0.00001;
        switch (shape.properties.kind) {
            case "forest":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "garden":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "grass":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "park":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "national_park":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "nature_reserve":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "natural_forest":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "natural_park":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "natural_wood":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "dog_park":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "golf_course":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "meadow":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "petting_zoo":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "picnic_site":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "plant":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "rural":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "scrub":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "stadium":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "theme_park":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "village_green":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "wildlife_park":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "wood":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "zoo":
                {
                    context.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "wetlands":
                {
                    context.fillStyle = "#b1c797";
                    break;
                }
                ;
            case "beach":
                {
                    context.fillStyle = "#faf2c7";
                    break;
                }
                ;
            case "residential":
                {
                    context.fillStyle = "#e0d0a6";
                    break;
                }
                ;
            case "farmland":
                {
                    context.fillStyle = "#f2f1e1";
                    break;
                }
                ;
            case "hospital":
                {
                    context.fillStyle = "#e0d0a6";
                    break;
                }
                ;
            case "urban area":
                {
                    context.fillStyle = "#CECECE";
                    break;
                }
                ;
        }
        if (shape.properties.kind == "protected_area") {
            var val = shape.properties.protect_class;
            if ((val >= 1 && val <= 9) || val >= 97 && val <= 99) {
                context.fillStyle = "#d0e5b7";
            }
            else if (val >= 11 && val <= 19) {
                val == 12 ? context.fillStyle = "#9cc3df" : context.fillStyle = "#FFEB3B";
            }
            else if (val >= 21 && val <= 29) {
                context.fillStyle = "#FFF1BBBB";
            }
        }
        context.strokeStyle = context.fillStyle;
        context.fill();
    };
    Map.prototype.styleWaterContext = function (shape, context) {
        context.fillStyle = '#9cc3df';
        context.lineWidth = 0.6;
        if (shape.geometry.type == "LineString" || shape.geometry.type == "MultiLineString") {
            context.strokeStyle = '#9cc3df';
            context.lineWidth = 0.6;
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            context.strokeStyle = '#6d6d6d';
            context.fill();
        }
    };
    Map.prototype.stylePoisContext = function (shape, context) {
    };
    Map.prototype.stylePlacesContext = function (shape, context) {
    };
    Map.prototype.styleTransitContext = function (shape, context) {
        context.fillStyle = '#b2b2ae';
        context.lineWidth = 0.5;
        if (shape.geometry.type == "LineString" || shape.geometry.type == "MultiLineString") {
            context.lineWidth = 0.5;
            context.strokeStyle = '#DCA6A6';
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            context.fillStyle = '#00ff00';
            context.lineWidth = 2;
            context.fill();
        }
    };
    /*
    public markMap_by_xy(x: number, y: number): { latitude: number, longitude: number } {
        // for single rendered tile - temporary
        //(x >= this.tileWidth) && (x < this.tileWidth*2) ? x -= this.tileWidth : x = x;
        //(x >= this.tileWidth * 2) && (x < this.tileWidth * 3) ? x -= this.tileWidth * 2 : x = x;
        //(y >= this.tileHeight) && (y < this.tileHeight * 2) ? y -= this.tileHeight : y = y;
        //(y >= this.tileHeight * 2) && (y < this.tileHeight * 3) ? y -= this.tileHeight * 2 : y = y;
        
        var longitude = (x / this._mapData[0].xScale) + this._mapData[0].boundingBox.xMin;
        var latitude = this._mapData[0].boundingBox.yMax - (y / this._mapData[0].yScale);

        console.log("touch X:" + x);
        console.log("touch Y:" + y);
        console.log("touch x:" + longitude);
        console.log("touch y:" + latitude);

        longitude >= this._mapData[0].boundingBox.xMin && longitude <= this._mapData[0].boundingBox.xMax ? console.log("x in bounds") : console.log("x not in bounds");
        latitude >= this._mapData[0].boundingBox.yMin && latitude <= this._mapData[0].boundingBox.yMax ? console.log("y in bounds") : console.log("y not in bounds");

        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.fillStyle = '#ff0000';
        context.strokeStyle = '#000000';
        context.fillRect(x-2, y-2, 4, 4);

        var point = { latitude: latitude, longitude: longitude };
        this.client_marks.push(point);
        return point;
        

        //TODO: implement mark logic for multiple tiles at once
    }

    public markMap_by_lonlat(latitude: number, longitude: number) {
        // for single rendered tile - temporary
        if (this._mapData.length == 1) {
            var point = Converter.MercatorProjection(latitude, longitude);

            point = {
                x: (longitude - this._mapData[0].boundingBox.xMin) * this._mapData[0].xScale,
                y: (this._mapData[0].boundingBox.yMax - latitude) * this._mapData[0].yScale
            };

            var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
            var context = canvas.getContext('2d');
            context.fillStyle = '#ff0000';
            context.strokeStyle = '#000000';
            context.fillRect(point.x - 2, point.y - 2, 4, 4);

            this.client_marks.push({ latitude, longitude });
        }
    }

    public markMap_redraw_all() {

        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.fillStyle = '#ff0000';
        context.strokeStyle = '#000000';

        for (var mark = 0; mark < this.client_marks.length; mark++) {
            var lat = this.client_marks[mark].latitude;
            var long = this.client_marks[mark].longitude;

            for (var tile = 0; tile < this._mapData.length; tile++) {
                var bbox = this._mapData[tile].boundingBox;

                if (long >= bbox.xMin  &&  long <= bbox.xMax  &&  lat >= bbox.yMin  &&  lat <= bbox.yMax) {
                    var point = Converter.MercatorProjection(lat, long);

                    point = {
                        x: (long - bbox.xMin) * this._mapData[tile].xScale,
                        y: (bbox.yMax - lat) * this._mapData[tile].yScale
                    };

                    context.fillRect(point.x - 2, point.y - 2, 4, 4);
                }
            }
        }
    }
*/
    Map.prototype.clear = function () {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    return Map;
})();
//# sourceMappingURL=Map.js.map