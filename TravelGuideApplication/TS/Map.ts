class Map {
    private root: JQuery;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    public database: Database;
    private mapData: MapTile[] = [];
    private subCanvasArray: { canvas: HTMLCanvasElement, tileX: number, tileY: number }[] = [];
    private client_marks: { latitude: number, longitude: number, positionX: number, positionY: number, radius: number, touchRadius: number }[] = [];
    private layers: Layer;

    private tileWidth: number;
    private tileHeight: number;
    private mapWidth: number;
    private mapHeight: number;

    // Properties of the Tile in center
    private currentLatitude: number;
    private currentLongitude: number;
    private currentTileX: number;
    private currentTileY: number;
    private currentZoom: number;


    constructor(tileWidth: number = 250, tileHeight: number = 250, mapWidth: number = 750, mapHeight = 750) {
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
                .css("width", "90vw")
                .css("display", "block")
                .css("margin", "auto")
                .css("padding", "0px")
                .css("margin-top", "25px")
                .css("border", "solid black 1.5px")
        );
        this.canvas = <HTMLCanvasElement>document.getElementById('mapCanvas');
        this.context = this.canvas.getContext('2d');

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    public display(latitude: number, longitude: number, zoom: number, layers: Layer) {
        this.clear();
        this.mapData = [];

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
                // Outer ring is not filled with data, so dynamic loading works properly
                if (x == 2 || x == -2 || y == 2 || y == -2) {
                    var MapTileData = new MapTile(null, this.currentTileX + x, this.currentTileY + y, zoom, layers, centerX - (this.tileWidth * (-1 * x)), centerY - (this.tileHeight * (-1 * y)), this.tileWidth, this.tileHeight);
                    this.mapData.push(MapTileData);
                }
                else {
                    var MapTileData = new MapTile(null, this.currentTileX + x, this.currentTileY + y, zoom, layers, centerX - (this.tileWidth * (-1 * x)), centerY - (this.tileHeight * (-1 * y)), this.tileWidth, this.tileHeight);
                    this.mapData.push(MapTileData);
                    this.fillPlaceholder(MapTileData);
                }
            }
        }
        console.log(this.mapData);
    }

    public shiftMap(shiftX: number, shiftY: number) {
        var start = performance.now()

        for (var i = 0; i < this.mapData.length; i++) {
            this.mapData[i].positionX += shiftX;
            this.mapData[i].positionY += shiftY;
        }
        this.clear();
        var totalGeometryObjects = 0;
        for (var i = 0; i < this.mapData.length; i++) {
            totalGeometryObjects += this.mapData[i].sortedData.length;
            this.DrawTile(this.mapData[i]);
        }
        this.markCollectionRedraw();
        this.updateMap();


        //console.log("Total objects: " + totalGeometryObjects + ", time to process: " + ((performance.now() - start) / 1000).toFixed(3) + "s");
    }

    private updateMap() {
        // Loop collection to find placeholders
        for (var i = 0; i < this.mapData.length; i++)
        {
            // If tile is placeholder
            if (this.mapData[i].rawData == null)
            {
                var ph = this.mapData[i];
                var right = ph.positionX + ph.tileWidth;
                var left = ph.positionX;
                var top = ph.positionY;
                var bot = ph.positionY + ph.tileHeight;

                // Check if tile intersect map visible area
                if (0 < right && this.mapWidth > left && 0 < bot && this.mapHeight > top)
                {
                    var nextLeft = false;
                    var nextRight = false;
                    var nextTop = false;
                    var nextBot = false;

                    // Check if this tile have neighbor
                    for (var j = 0; j < this.mapData.length; j++)
                    {
                        if (ph.tileX + 1 == this.mapData[j].tileX && ph.tileY == this.mapData[j].tileY) nextRight = true;
                        if (ph.tileX - 1 == this.mapData[j].tileX && ph.tileY == this.mapData[j].tileY) nextLeft = true;
                        if (ph.tileY + 1 == this.mapData[j].tileY && ph.tileX == this.mapData[j].tileX) nextBot = true;
                        if (ph.tileY - 1 == this.mapData[j].tileY && ph.tileX == this.mapData[j].tileX) nextTop = true;
                    }
                    // If does have neighbor, create placeholders for them
                    if (!nextRight){ this.mapData.push(new MapTile(null, ph.tileX + 1, ph.tileY, ph.zoom, ph.layers, ph.positionX + ph.tileWidth, ph.positionY, ph.tileWidth, ph.tileHeight)); }
                    if (!nextLeft) { this.mapData.push(new MapTile(null, ph.tileX - 1, ph.tileY, ph.zoom, ph.layers, ph.positionX - ph.tileWidth, ph.positionY, ph.tileWidth, ph.tileHeight)); }
                    if (!nextBot)  { this.mapData.push(new MapTile(null, ph.tileX, ph.tileY + 1, ph.zoom, ph.layers, ph.positionX, ph.positionY + ph.tileHeight, ph.tileWidth, ph.tileHeight)); }
                    if (!nextTop)  { this.mapData.push(new MapTile(null, ph.tileX, ph.tileY - 1, ph.zoom, ph.layers, ph.positionX, ph.positionY - ph.tileHeight, ph.tileWidth, ph.tileHeight)); }
                    
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
                for (var i = 0; i < this.mapData.length; i++)
                {
                    if (this.mapData[i].rawData == null && this.mapData[i].tileX == tileToFill.tileX && this.mapData[i].tileY == tileToFill.tileY)
                    {
                        if (tileFromDB != undefined) {
                            tileFromDB.positionX = this.mapData[i].positionX;
                            tileFromDB.positionY = this.mapData[i].positionY;
                            // Replace and draw
                            this.mapData.splice(i, 1, tileFromDB);
                            this.DrawTile(tileFromDB);
                            this.markCollectionRedraw();
                            //console.log("Tile from DB: " + tileFromDB.tileX + "  " + tileFromDB.tileY + " " + tileFromDB.zoom);
                        }
                        else
                        {
                            this.mapData[i].isRequested = true;
                            this.fetchTile(tileToFill.tileX, tileToFill.tileY, tileToFill.zoom, tileToFill.tileX, tileToFill.tileY, (argX, argY, data) => {
                                // Searching placeholder to replace in callback, because there is possible change of his coordinates during of download
                                // In this way, coordinates are corresponding with actual position
                                for (var j = 0; j < this.mapData.length; j++) {
                                    if (this.mapData[j]._rawData == null && this.mapData[j].tileX == argX && this.mapData[j].tileY == argY) {
                                        var x = this.mapData[j];
                                        var MapTileData = new MapTile(data, x.tileX, x.tileY, this.currentZoom, this.layers, x.positionX, x.positionY, x.tileWidth, x.tileHeight);
                                        // Add to DB before draw (drawin creates html nodes which cannot be added into IndexedDB)
                                        this.database.addTile(MapTileData).catch(() => { });
                                        // Replace and draw
                                        this.mapData.splice(j, 1, MapTileData);
                                        this.DrawTile(MapTileData);
                                        this.markCollectionRedraw();
                                        console.log("Tile from server: " + MapTileData.tileX + "  " + MapTileData.tileY);
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

    private fetchTile(x: number, y: number, z: number, argX: number, argY: number, callback: Function): void {
        var fetchURL = "http://tile.mapzen.com/mapzen/vector/v1/all/" + z + "/" + x + "/" + y + ".json?api_key=mapzen-eES7bmW";

        $.getJSON(fetchURL)
            .done((data) => {
                callback(argX, argY, data);
            })
            .fail(() => {
                console.log("Download of tile: Z=" + z + ", X=" + x + ", Y=" + y + " failed");
            })
    }

    public fetchRoute(points: { lat: number, lon: number } [])
    {
        var fetchURL = "http://matrix.mapzen.com/optimized_route?json={\"locations\":[";

        for (var i = 0; i < points.length; i++) {
            fetchURL += "{\"lat\":" + points[i].lat.toFixed(3) + ", " + "\"lon\":" + points[i].lon.toFixed(3) + "}";
            if (i + 1 == points.length) {
                fetchURL += "],";
            }
            else {
                fetchURL += ",";
            }
        }
        fetchURL += "\"costing\":\"auto\", \"units\":\"mi\"}&api_key=mapzen-eES7bmW";

        $.getJSON(fetchURL)
            .then((file) => {
                console.log(file.trip);
            })
    }

    public searchLocationByName(place: string) {
        var fetchURL = "https://search.mapzen.com/v1/search?" + "api_key=mapzen-eES7bmW&text=" + place;

        $.getJSON(fetchURL)
            .then((file) => {
                for (var i = 0; i < file.features.length; i++) {
                    console.log(file.features[i].properties.label);
                }
            })
    }

    public searchLocationByCoords(latitude: number, longitude: number) {
        var fetchURL = "https://search.mapzen.com/v1/reverse?" + "api_key=mapzen-eES7bmW&point.lat=" + latitude + "&point.lon=" + longitude;

        $.getJSON(fetchURL)
            .then((file) => {
                console.log(file);
                for (var i = 0; i < file.features.length; i++) {
                    console.log(file.features[i].properties.label);
                }
            })
    }


    public DrawTile(mapTile: MapTile): void {
        // Placeholders aren't drawn
        if (mapTile.rawData == null) {
            return;
        }
        // Render data changes
        if (mapTile.didChange) {
            mapTile.canvas = document.createElement('canvas');
            mapTile.canvas.width = mapTile.tileWidth;
            mapTile.canvas.height = mapTile.tileHeight;
            mapTile.context = mapTile.canvas.getContext('2d');
            mapTile.context.strokeStyle = '#333333';

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
            this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY);
        }
        else
        {
            this.context.drawImage(mapTile.canvas, mapTile.positionX, mapTile.positionY);
        }
    }

    private drawLineString(shape: any, mapTile: MapTile): void
    {
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

            if (j === 0) {
                mapTile.context.beginPath();
                mapTile.context.moveTo(point.x, point.y);
            }
            else {
                mapTile.context.lineTo(point.x, point.y);
            }
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Boundaries) {
            this.styleBoundariesContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Roads) {
            this.styleRoadsContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, mapTile.context);
        }
        mapTile.context.stroke();
    }

    private drawMultiLineString(shape: any, mapTile: MapTile): void
    {
        var longitude, latitude, point;

        for (var j = 0; j < shape.geometry.coordinates.length; j++)
        {
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++)
            {
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
                if (k === 0) {
                    mapTile.context.beginPath();
                    mapTile.context.moveTo(point.x, point.y);
                }
                else {
                    mapTile.context.lineTo(point.x, point.y);
                }
            }
            if (shape.properties.layer & Layer.Water) {
                this.styleWaterContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Earth) {
                this.styleEarthContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Boundaries) {
                this.styleBoundariesContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Roads) {
                this.styleRoadsContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Transit) {
                this.styleTransitContext(shape, mapTile.context);
            }
            mapTile.context.stroke();
        }
    }

    private drawPoint(shape: any, mapTile: MapTile): void {
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

        mapTile.context.beginPath();

        if (shape.properties.layer & Layer.Pois) {
            this.stylePoisContext(shape, mapTile.context, point.x, point.y);
        }
        if (shape.properties.layer & Layer.Places) {
            this.stylePlacesContext(shape, mapTile.context, point.x, point.y);
        }

        mapTile.context.stroke();
    }

    private drawMultiPoint(shape: any, mapTile: MapTile): void {
        var longitude, latitude, point;

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

            if (shape.properties.layer & Layer.Pois) {
                this.stylePoisContext(shape, mapTile.context, point.x, point.y);
            }
            if (shape.properties.layer & Layer.Places) {
                this.stylePlacesContext(shape, mapTile.context, point.x, point.y);
            }
        }
        mapTile.context.stroke();
    }

    private drawPolygon(shape: any, mapTile: MapTile): void
    {
        var longitude, latitude, point;

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
                if (k === 0 && j !== 0) {
                    mapTile.context.closePath();
                    mapTile.context.moveTo(point.x, point.y);
                }
                mapTile.context.lineTo(point.x, point.y);
            }
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Buildings) {
            this.styleBuildingContext(shape, mapTile.context);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, mapTile.context);
        }
        mapTile.context.stroke();
    }

    private drawMultiPolygon(shape: any, mapTile: MapTile): void
    {
        var longitude, latitude, point;

        for (var j = 0; j < shape.geometry.coordinates.length; j++)
        {
            mapTile.context.beginPath();
            for (var k = 0; k < shape.geometry.coordinates[j].length; k++)
            {
                for (var l = 0; l < shape.geometry.coordinates[j][k].length; l++)
                {
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
                    if (l === 0 && k !== 0) {
                        mapTile.context.closePath();
                        mapTile.context.moveTo(point.x, point.y);
                    }
                    else {
                        mapTile.context.lineTo(point.x, point.y);
                    }
                }
            }
            if (shape.properties.layer & Layer.Water) {
                this.styleWaterContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Earth) {
                this.styleEarthContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Landuse) {
                this.styleLanduseContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Buildings) {
                this.styleBuildingContext(shape, mapTile.context);
            }
            if (shape.properties.layer & Layer.Transit) {
                this.styleTransitContext(shape, mapTile.context);
            }
            mapTile.context.stroke();
        }
    }


    private styleBoundariesContext(shape: any, context: any): void {
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
    }

    private styleRoadsContext(shape: any, context: any): void {
        context.lineWidth = 1.5;
        context.strokeStyle = "#ffffff";

        switch (shape.properties.kind) {
            case "highway":             { context.strokeStyle = "#fffde8"; context.lineWidth = 3; break; };
            case "major_road":          { context.strokeStyle = "white";   context.lineWidth = 1.75; break; };
            case "minor_road":          { context.strokeStyle = "white";   context.lineWidth = 1.5; break; };
            case "rail":                { context.strokeStyle = "#b2b2ae"; context.lineWidth = 1.5; break; };
            case "path":                { context.strokeStyle = "#c6c6c6"; context.lineWidth = 1; break; };
            case "ferry":               { context.strokeStyle = "#ffffff"; break; };
            case "piste":               { context.strokeStyle = "#ffffff"; break; };
            case "aerialway":           { context.strokeStyle = "#ffffff"; break; };
            case "aeroway":             { context.strokeStyle = "#ffffff"; break; };
            case "racetrack":           { context.strokeStyle = "#ffffff"; break; };
            case "portage_way":         { context.strokeStyle = "#ffffff"; break; };
        }
        let holdColor = context.strokeStyle;
        context.lineWidth = context.lineWidth + 1;
        context.strokeStyle = "#7c7c7c";
        context.stroke();
        context.lineWidth = context.lineWidth - 1;
        context.strokeStyle = holdColor;
        context.stroke();
    }

    private styleBuildingContext(shape: any, context: any): void
    {
        context.strokeStyle = "#494949"
        context.lineWidth = 0.2;
        context.fillStyle = "#e7deca";
        context.fill();
    }

    private styleEarthContext(shape: any, context: any): void
    {
        context.fillStyle = '#eaeaea';
        context.strokeStyle = '#8F8F8F';
        context.lineWidth = 0.6;
        context.fill();
    }

    private styleLanduseContext(shape: any, context: any): void {
        context.fillStyle = '#e0d0a6';
        context.strokeStyle = "#8e8e8e"
        context.lineWidth = 0.00001;

        switch (shape.properties.kind) {
            case "forest":              { context.fillStyle = "#d0e5b7"; break;};
            case "garden":              { context.fillStyle = "#d0e5b7"; break;};
            case "grass":               { context.fillStyle = "#d0e5b7"; break;};
            case "park":                { context.fillStyle = "#d0e5b7"; break;};
            case "national_park":       { context.fillStyle = "#d0e5b7"; break;};
            case "nature_reserve":      { context.fillStyle = "#d0e5b7"; break;};
            case "natural_forest":      { context.fillStyle = "#d0e5b7"; break;};
            case "natural_park":        { context.fillStyle = "#d0e5b7"; break;};
            case "natural_wood":        { context.fillStyle = "#d0e5b7"; break;};
            case "dog_park":            { context.fillStyle = "#d0e5b7"; break;};
            case "golf_course":         { context.fillStyle = "#d0e5b7"; break;};
            case "meadow":              { context.fillStyle = "#d0e5b7"; break;};
            case "petting_zoo":         { context.fillStyle = "#d0e5b7"; break;};
            case "picnic_site":         { context.fillStyle = "#d0e5b7"; break;};
            case "plant":               { context.fillStyle = "#d0e5b7"; break;};
            case "rural":               { context.fillStyle = "#d0e5b7"; break;};
            case "scrub":               { context.fillStyle = "#d0e5b7"; break;};
            case "stadium":             { context.fillStyle = "#d0e5b7"; break;};
            case "theme_park":          { context.fillStyle = "#d0e5b7"; break;};
            case "village_green":       { context.fillStyle = "#d0e5b7"; break;};
            case "wildlife_park":       { context.fillStyle = "#d0e5b7"; break;};
            case "wood":                { context.fillStyle = "#d0e5b7"; break;};
            case "zoo":                 { context.fillStyle = "#d0e5b7"; break;};
            case "wetlands":            { context.fillStyle = "#b1c797"; break;};
            case "beach":               { context.fillStyle = "#faf2c7"; break;};
            case "residential":         { context.fillStyle = "#e0d0a6"; break;};
            case "farmland":            { context.fillStyle = "#f2f1e1"; break;};
            case "hospital":            { context.fillStyle = "#e0d0a6"; break; };
            case "urban area":          { context.fillStyle = "#CECECE"; break;};
        }
        if (shape.properties.kind == "protected_area") {
            let val = shape.properties.protect_class;
            if ((val >= 1 && val <= 9) || val >= 97 && val <= 99) {
                context.fillStyle = "#d0e5b7";
            }
            else if (val >= 11 && val <= 19) {
                val == 12 ? context.fillStyle = "#9cc3df" : context.fillStyle = "#FFEB3B";
            }
            else if (val >= 21 && val <= 29) {
                context.fillStyle = "#FFF1BBBB"
            }
        }
        context.strokeStyle = context.fillStyle;
        context.fill();
    }

    private styleWaterContext(shape: any, context: any): void {
        context.fillStyle = '#9cc3df';
        context.strokeStyle = '#C6C6C6';
        context.lineWidth = 0.3;

        if (shape.geometry.type == "LineString" || shape.geometry.type == "MultiLineString") {
            context.strokeStyle = '#9cc3df';
            context.lineWidth = 0.6;
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            context.strokeStyle = '#6d6d6d';
            context.fill();
        }
    }

    private stylePoisContext(shape: any, context: any, posX: number, posY: number): void {
     /*   context.fillStyle = 'black';
        context.textAlign = "center";
        context.font = "bolder 15px Arial";
        context.fillStyle = 'green';
        context.fillText(shape.properties.name, posX, posY);*/
    }

    private stylePlacesContext(shape: any, context: any, posX: number, posY: number): void
    {/*
        context.fillStyle = 'black';
        context.textAlign = "center";
        console.log(shape.properties.kind);

            switch (shape.properties.kind) {
                case "borough": { context.font = "bolder 15px Arial"; context.fillStyle = 'green'; break; }
                case "country": { context.font = "bolder 17px Arial"; context.fillStyle = 'Red'; break; }
                case "locality": { context.font = "bolder 15px Arial"; context.fillStyle = 'blue'; break; }
                case "macrohood": { context.font = "bolder 15px Arial"; context.fillStyle = 'yellow'; break; }
                case "microhood": { context.font = "bolder 15px Arial"; context.fillStyle = 'pink'; break; }
                case "neighbourhood": { context.font = "bolder 15px Arial"; context.fillStyle = '#616161'; break; }
                case "region": { context.font = "bolder 15px Arial"; context.fillStyle = 'black'; break; }
                default: { context.font = "bolder 15px Arial"; }
            }
            context.fillText(shape.properties.name, posX, posY);*/
    }

    private styleTransitContext(shape: any, context: any): void {
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
    }


    public markMapByTouch(x: number, y: number)
    {
        var markedTile;
        for (var i = 0; i < this.mapData.length; i++)
        {
            var top = this.mapData[i].positionY;
            var bot = this.mapData[i].positionY + this.tileHeight;
            var left = this.mapData[i].positionX;
            var right = this.mapData[i].positionX + this.tileWidth;

            // if touch is in this tile...
            if (left <= x && x <= right && top <= y && y <= bot) {
                markedTile = this.mapData[i];
            }
        }

        if (markedTile != null)
        {
            var latLeft = markedTile.boundingBox.xMin;
            var latRight = markedTile.boundingBox.xMax;
            var lonTop = markedTile.boundingBox.yMin;
            var lonBot = markedTile.boundingBox.yMax;
            var onTileX = x - markedTile.positionX;
            var onTileY = y - markedTile.positionY;

            var latitude = (onTileX / markedTile.xScale) + latLeft;
            var longitude = lonBot - (onTileY / markedTile.yScale);

            var didRemove = false;
            // Remove mark if there is already one
            for (var i = 0; i < this.client_marks.length; i++) {
                var markPositionX = this.client_marks[i].positionX;
                var markPositionY = this.client_marks[i].positionY;
                var touchRadius = this.client_marks[i].touchRadius;

                if (Math.abs(markPositionX - x) <= touchRadius && Math.abs(markPositionY - y) <= touchRadius) {
                    this.client_marks.splice(i, 1);
                    didRemove = true;
                    this.shiftMap(0, 0);
                }
            }
            // If didnt removed mark, draw mark here
            if (!didRemove)
            {
                var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
                var context = canvas.getContext('2d');
                var point = {
                    latitude: latitude,
                    longitude: longitude,
                    positionX: x,
                    positionY: y,
                    radius: 5,
                    touchRadius: 20
                };

                context.fillStyle = '#ff0000';
                context.strokeStyle = '#3B3B3B';
                context.beginPath();
                context.arc(x, y, point.radius, 0, 2 * Math.PI);
                context.fill();
                context.stroke();

                this.client_marks.push(point);
                this.searchLocationByCoords(point.latitude, point.longitude);
            }
        }

        var marks = new Array();
        //marks.push({ lat: 49.828, lon: 18.172 });
        //marks.push({ lat: 49.829, lon: 18.173 });

        if (this.client_marks.length >= 2)
        {
            for (var i = 0; i < this.client_marks.length; i++)
            {
                marks.push({ lat: this.client_marks[i].latitude, lon: this.client_marks[i].longitude });
            }
            this.fetchRoute(marks);
        }
    }

    public markCollectionRedraw()
    {
        for (var i = 0; i < this.client_marks.length; i++)
        {
            for (var j = 0; j < this.mapData.length; j++)
            {
                var latLeft = this.mapData[j].boundingBox.xMin;
                var latRight = this.mapData[j].boundingBox.xMax;
                var lonTop = this.mapData[j].boundingBox.yMin;
                var lonBot = this.mapData[j].boundingBox.yMax;

                // If mark is in [latitude, longitude] bounds of tile..
                if ((latLeft <= this.client_marks[i].latitude) && (this.client_marks[i].latitude <= latRight))
                {
                    if ((lonTop <= this.client_marks[i].longitude) && (this.client_marks[i].longitude <= lonBot))
                    {
                        var point = Converter.MercatorProjection(this.client_marks[i].latitude, this.client_marks[i].longitude);

                        point = {
                            x: (this.client_marks[i].latitude - latLeft) * this.mapData[j].xScale,
                            y: (lonBot - this.client_marks[i].longitude) * this.mapData[j].yScale
                        };

                        point.x += this.mapData[j].positionX;
                        point.y += this.mapData[j].positionY;
                        
                        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
                        var context = canvas.getContext('2d');
                        context.fillStyle = '#ff0000';
                        context.strokeStyle = '#3B3B3B';
                        context.beginPath();
                        context.arc(point.x, point.y, this.client_marks[i].radius, 0, 2 * Math.PI);
                        context.fill();
                        context.stroke();

                        this.client_marks[i].positionX = point.x;
                        this.client_marks[i].positionY = point.y;
                    }
                }
            }
        }
    }

    public clear(): void {
        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        var context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}
