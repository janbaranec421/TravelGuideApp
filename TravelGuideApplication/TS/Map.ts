class Map {
    private root: HTMLElement;
    private canvas: HTMLElement;
    private _mapData: any;
    private tileWidth: number;
    private tileHeight: number;
    private mapWidth: number;
    private mapHeight: number;

    constructor(parent: HTMLElement, tileWidth: number = 150, tileHeight: number = 150, mapWidth: number = 500 , mapHeight = 500) {
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
            .css("position", "absolute")
        );

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        var centerX = (this.mapWidth / 2) - (this.tileWidth / 2);
        var centerY = (this.mapHeight / 2) - (this.tileWidth / 2);

        // CENTER tile
        this.fetchTile(17, 71764, 45476, (data) => {
            console.log(this._mapData)
            this.DrawTile(this._mapData, centerX, centerY, Layer.Boundaries);
        });
        /*
        // RIGHT 
        this.fetchTile(10, 561, 355, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX + this.tileWidth, centerY)
        });
        // LEFT
        this.fetchTile(10, 559, 355, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX - this.tileWidth, centerY)
        });
        // BOTTOM
        this.fetchTile(10, 560, 356, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX, centerY + this.tileHeight)
        });
        // BOTTOM RIGHT
        this.fetchTile(10, 561, 356, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX + this.tileWidth, centerY + this.tileHeight)
        });
        // BOTTOM LEFT
        this.fetchTile(10, 559, 356, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX - this.tileWidth, centerY + this.tileHeight)
        });
        // TOP 
        this.fetchTile(10, 560, 354, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX, centerY - this.tileHeight)
        });
        // TOP LEFT
        this.fetchTile(10, 559, 354, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX - this.tileWidth, centerY - this.tileHeight)
        });
        // TOP RIGHT
        this.fetchTile(10, 561, 354, (data) => {
            console.log(this._mapData)
            this.DrawBoundaries(this._mapData, centerX + this.tileWidth, centerY - this.tileHeight)
        });
        */
    }

    public fetchTile(z: number, x: number, y: number, callback: Function) {
        var fetchURL = "https://vector.mapzen.com/osm/all/" + z + "/" + x + "/" + y + ".json?api_key=vector-tiles-fd9uHhC";

        $.getJSON(fetchURL)
            .done((data) => {
            this._mapData = data;
            callback(data);
         })
            .fail(function () {
                console.log("Download failed")
            })

    }

    // [longitude, latitude] bounding box of data 
    public getBoundingBox(data) {
        var coords, point, latitude, longitude;
        var bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };

        data = data.boundaries.features;

        // Loop through each “feature”
        for (var i = 0; i < data.length; i++) {

            // …and for each coordinate…
            for (var j = 0; j < data[i].geometry.coordinates.length; j++) {
                
                // Update the bounds by comparing the current
                // xMin/xMax and yMin/yMax with the coordinate
                // we're currently checking
                if (data[i].geometry.type == "MultiLineString") {
                    for (var k = 0; k < data[i].geometry.coordinates[j].length; k++) {

                        longitude = data[i].geometry.coordinates[j][k][0];
                        latitude = data[i].geometry.coordinates[j][k][1];

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
                    }
                }
                else {
                    longitude = data[i].geometry.coordinates[j][0];
                    latitude = data[i].geometry.coordinates[j][1];

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
                }
            }
        }

        // Returns an object that contains the bounds of this GeoJSON
        // data. The keys of this object describe a box formed by the
        // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
        return bounds;
    }

    public DrawTile(data, shiftX: number, shiftY: number, layers: Layer)
    {
        if (layers & Layer.Boundaries) {
            this.DrawBoundaries(data, shiftX, shiftY);
        }
        if (layers & Layer.Buildings) {
            //this.DrawBuildings(data, shiftX, shiftY);
        }
        if (layers & Layer.Earth) {
            console.log("Earth layer")
        }
        if (layers & Layer.Landuse) {
            console.log("Landuse layer")
        }
        if (layers & Layer.Landuse_Labels) {
            console.log("Landuse_Labels layer")
        }
        if (layers & Layer.Places) {
            console.log("Places layer")
        }
        if (layers & Layer.Pois) {
            console.log("Pois layer")
        }
        if (layers & Layer.Roads) {
            console.log("Roads layer")
        }
        if (layers & Layer.Transit) {
            console.log("Transit layer")
        }
        if (layers & Layer.Water) {
            console.log("Water layer")
        }

    }

    public DrawBuildings(data, shiftX: number, shiftY: number)
    {
        var context, bounds, point, latitude, longitude, xScale, yScale, scale;

        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        context = canvas.getContext('2d');
        context.strokeStyle = '#9C9A9A';

        bounds = this.getBoundingBox(data);

        // Determine how much to scale our coordinates by
        xScale = this.tileWidth / Math.abs(bounds.xMax - bounds.xMin);
        yScale = this.tileHeight / Math.abs(bounds.yMax - bounds.yMin);
        scale = xScale < yScale ? xScale : yScale;

        data = data.buildings.features;

        for (var i = 0; i < data.length; i++) {
            
            // for each coordinate…
            for (var j = 0; j < data[i].geometry.coordinates.length; j++) {

                if (data[i].geometry.type == "Polygon") {
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

                    // Otherwise just keep drawing
                } else {
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

        console.log("Draw Buildings");
    }

    public DrawBoundaries(data, shiftX: number, shiftY: number) {
        var context, bounds, point, latitude, longitude, xScale, yScale, scale;

        var canvas = <HTMLCanvasElement>$("#mapCanvas")[0];
        context = canvas.getContext('2d');
        context.strokeStyle = '#9C9A9A';

        bounds = this.getBoundingBox(data);

        // Determine how much to scale our coordinates by
        xScale = this.tileWidth / Math.abs(bounds.xMax - bounds.xMin);
        yScale = this.tileHeight / Math.abs(bounds.yMax - bounds.yMin);
        scale = xScale < yScale ? xScale : yScale;

        data = data.boundaries.features;

        for (var i = 0; i < data.length; i++) {
            
            // for each coordinate…
            for (var j = 0; j < data[i].geometry.coordinates.length; j++) {

                longitude = data[i].geometry.coordinates[j][0];
                latitude = data[i].geometry.coordinates[j][1];

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

                    // Otherwise just keep drawing
                } else {
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
        
        console.log("Boundaries draw");
    }

    public MercatorProjection(longitude, latitude) {
        var radius = 6378137;
        var max = 85.0511287798;
        var radians = Math.PI / 180;
        var point = { x: 0, y: 0 };

        point.x = radius * longitude * radians;
        point.y = Math.max(Math.min(max, latitude), -max) * radians;
        point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

        return point;
    }

    public long2tileX(lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }

    public lat2tileY(lat, zoom) {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }

    public Xtile2long(x, zoom) {
        return (x / Math.pow(2, zoom) * 360 - 180);
    }

    public Ytile2lat(y, zoom) {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }
}