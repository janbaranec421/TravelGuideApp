var MapTile = (function () {
    function MapTile(data, tileX, tileY, zoom, layers, shiftX, shiftY, tileWidth, tileHeight) {
        if (tileWidth === void 0) { tileWidth = 260; }
        if (tileHeight === void 0) { tileHeight = 260; }
        this.didChange = true;
        this.isRendered = false;
        this.isRequested = false;
        this.labelsRendered = false;
        this.sortedData = [];
        this._rawData = data;
        this.tileX = tileX;
        this.tileY = tileY;
        this.zoom = zoom;
        this.layers = layers;
        this.positionX = shiftX;
        this.positionY = shiftY;
        this._tileWidth = tileWidth;
        this._tileHeight = tileHeight;
        this.longitude = Converter.Xtile2long(tileX, this.zoom);
        this.latitude = Converter.Ytile2lat(tileY, this.zoom);
        this.boundingBox = Converter.tile2boundingBox(tileX, tileY, this.zoom);
        this.xScale = this.tileWidth / Math.abs(this.boundingBox.xMax - this.boundingBox.xMin);
        this.yScale = this.tileHeight / Math.abs(this.boundingBox.yMax - this.boundingBox.yMin);
        this.scale = this.xScale < this.yScale ? this.xScale : this.yScale;
        if (this.rawData != null) {
            this.sortedData = this.prepareData(this.rawData, this.layers);
        }
    }
    Object.defineProperty(MapTile.prototype, "rawData", {
        get: function () {
            return this._rawData;
        },
        set: function (data) {
            if (data) {
                this._rawData = data;
                this.sortedData = this.prepareData(data, this.layers);
                this.didChange = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapTile.prototype, "tileWidth", {
        get: function () {
            return this._tileWidth;
        },
        set: function (tileWidth) {
            this._tileWidth = tileWidth;
            if (this.boundingBox != null || this.tileWidth != null) {
                this.xScale = this.tileWidth / Math.abs(this.boundingBox.xMax - this.boundingBox.xMin);
                this.yScale = this.tileHeight / Math.abs(this.boundingBox.yMax - this.boundingBox.yMin);
                this.scale = this.xScale < this.yScale ? this.xScale : this.yScale;
            }
            this.didChange = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapTile.prototype, "tileHeight", {
        get: function () {
            return this._tileHeight;
        },
        set: function (tileHeight) {
            this._tileHeight = tileHeight;
            if (this.boundingBox != null || this.tileWidth != null) {
                this.xScale = this.tileWidth / Math.abs(this.boundingBox.xMax - this.boundingBox.xMin);
                this.yScale = this.tileHeight / Math.abs(this.boundingBox.yMax - this.boundingBox.yMin);
                this.scale = this.xScale < this.yScale ? this.xScale : this.yScale;
            }
            this.didChange = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapTile.prototype, "zoom", {
        get: function () {
            return this._zoom;
        },
        set: function (zoom) {
            if (zoom > 20) {
                this._zoom = 20;
            }
            else if (zoom < 2) {
                this._zoom = 2;
            }
            else {
                this._zoom = zoom;
            }
        },
        enumerable: true,
        configurable: true
    });
    MapTile.prototype.prepareData = function (data, layers) {
        var array = [];
        var holder = [];
        // Compose layers which have sort_key attribute (buildings, roads, etc)
        if (layers & Layer.Water) {
            holder = data.water.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Water; });
            array = array.concat(holder);
        }
        if (layers & Layer.Earth) {
            holder = data.earth.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Earth; });
            array = array.concat(holder);
        }
        if (layers & Layer.Landuse) {
            holder = data.landuse.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Landuse; });
            array = array.concat(holder);
        }
        if (layers & Layer.Buildings) {
            holder = data.buildings.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Buildings; });
            array = array.concat(holder);
        }
        if (layers & Layer.Roads) {
            holder = data.roads.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Roads; });
            array = array.concat(holder);
        }
        if (layers & Layer.Transit) {
            holder = data.transit.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Transit; });
            array = array.concat(holder);
        }
        if (layers & Layer.Boundaries) {
            holder = data.boundaries.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Boundaries; });
            array = array.concat(holder);
        }
        //Sort them
        array = this.sortBySortKey(array);
        //Put rest without sort_key at end of array (addresses, labels, etc.)   
        holder = array.filter(function (obj) { return obj.properties.sort_rank == undefined; });
        array.splice(0, holder.length);
        array = array.concat(holder);
        if (layers & Layer.Places) {
            holder = data.places.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Places; });
            array = array.concat(holder);
        }
        if (layers & Layer.Pois) {
            holder = data.pois.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Pois; });
            array = array.concat(holder);
        }
        if (layers & Layer.Landuse_Labels) {
            holder = data.landuse_labels.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Landuse_Labels; });
            array = array.concat(holder);
        }
        return array;
    };
    MapTile.prototype.sortBySortKey = function (array) {
        return array.sort(function (a, b) {
            var x = a.properties.sort_rank;
            var y = b.properties.sort_rank;
            if (x == null) {
                x = 0;
            }
            if (y == null) {
                y = 0;
            }
            return x - y;
        });
    };
    return MapTile;
})();
//# sourceMappingURL=MapTile.js.map