var Map = (function () {
    function Map(parent, tileWidth, tileHeight, mapWidth, mapHeight) {
        if (tileWidth === void 0) { tileWidth = 650; }
        if (tileHeight === void 0) { tileHeight = 650; }
        if (mapWidth === void 0) { mapWidth = 650; }
        if (mapHeight === void 0) { mapHeight = 650; }
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
        console.log("Latitude: " + latitude);
        console.log("Longitude: " + longitude);
        // CENTER tile
        this.fetchTile(this.currentTileX, this.currentTileY, zoom, function (data) {
            console.log("\nCENTER");
            var MapTileData = new MapTile(data, _this.currentTileX, _this.currentTileY, zoom, layers, _this.tileWidth, _this.tileHeight);
            _this._mapData.push(MapTileData);
            console.log(_this._mapData);
            _this.DrawTile(MapTileData, centerX, centerY);
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
        this.DrawLayer(mapTile, shiftX, shiftY);
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
    Map.prototype.DrawLayer = function (mapTile, shiftX, shiftY) {
        var canvas = $("#mapCanvas")[0];
        var context = canvas.getContext('2d');
        context.strokeStyle = '#333333';
        for (var i = 0; i < mapTile.sortedData.length; i++) {
            if (mapTile.sortedData[i].geometry.type == "Point") {
                this.strokePoint(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "MultiPoint") {
                this.strokeMultiPoint(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "LineString") {
                this.strokeLineString(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "MultiLineString") {
                this.strokeMultiLineString(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "Polygon") {
                this.strokePolygon(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
            if (mapTile.sortedData[i].geometry.type == "MultiPolygon") {
                this.strokeMultiPolygon(mapTile.sortedData[i], mapTile, context, shiftX, shiftY);
            }
        }
        console.log("Layer draw");
    };
    Map.prototype.strokeLineString = function (shape, mapTile, context, shiftX, shiftY) {
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
        context.stroke();
    };
    Map.prototype.strokeMultiLineString = function (shape, mapTile, context, shiftX, shiftY) {
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
            context.stroke();
        }
    };
    Map.prototype.strokePoint = function (shape, mapTile, context, shiftX, shiftY) {
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
    Map.prototype.strokeMultiPoint = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        context.beginPath();
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
            /*
            context.fillStyle = '#ff0000';
            context.textAlign = "center";
            context.fillText(shape.properties.name, point.x, point.y);
            */
            if (shape.properties.layer & Layer.Pois && shape.properties.name != undefined) {
                context.fillStyle = 'black';
                context.textAlign = "center";
                context.fillRect(point.x, point.y + 2, 3, 3);
                context.fillText(shape.properties.name, point.x, point.y);
            }
        }
        context.stroke();
    };
    Map.prototype.strokePolygon = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        context.beginPath();
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
        context.stroke();
    };
    Map.prototype.strokeMultiPolygon = function (shape, mapTile, context, shiftX, shiftY) {
        var longitude, latitude, point;
        for (var j = 0; j < shape.geometry.coordinates.length; j++) {
            context.beginPath();
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
            context.stroke();
        }
    };
    Map.prototype.styleBoundariesContext = function (shape, context) {
        if (shape.properties.kind == "country") {
            context.strokeStyle = "#8e8e8e";
            context.lineWidth = 1.4;
        }
        if (shape.properties.kind == "state") {
            context.strokeStyle = "#8e8e8e";
            context.lineWidth = 0.8;
        }
        if (shape.properties.kind == "macroregion") {
            context.strokeStyle = "#8e8e8e";
            context.lineWidth = 0.8;
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
                    context.lineWidth = 1.75;
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
        context.strokeStyle = "#8e8e8e";
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
        context.lineWidth = 0.01;
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
        }
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
    return Map;
})();
//# sourceMappingURL=Map.js.map