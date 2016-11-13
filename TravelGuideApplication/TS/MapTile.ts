﻿class MapTile {
    public data: any;
    public boundingBox: any = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    public scale: number;
    public xScale: number;
    public yScale: number;
    public layers: Layer;

    public sortedData: any[] = [];

    private tileX: number;
    private tileY: number;
    private tileWidth: number;
    private tileHeight: number;
    private longitude: number;
    private latitude: number;
    private zoom: number;


    constructor(data: any, tileX: number, tileY: number, zoom: number, layers: Layer, tileWidth: number = 260, tileHeight: number = 260)
    {
        this.data = data;
        this.tileX = tileX;
        this.tileY = tileY;
        this.zoom = zoom;
        this.layers = layers;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.longitude = this.Xtile2long(tileX, zoom);
        this.latitude = this.Ytile2lat(tileX, zoom);
        this.boundingBox = this.tile2boundingBox(tileX, tileY, zoom);

        this.xScale = this.tileWidth / Math.abs(this.boundingBox.xMax - this.boundingBox.xMin);
        this.yScale = this.tileHeight / Math.abs(this.boundingBox.yMax - this.boundingBox.yMin);
        this.scale = this.xScale < this.yScale ? this.xScale : this.yScale;    

        this.sortedData = this.prepareData(this.data, this.layers);
    }

    private prepareData(data: any, layers: Layer): any[]
    {
        let array: any[] = [];
        let holder: any[] = [];

        // Compose layers which have sort_key attribute
        if (layers & Layer.Water) {
            holder = data.water.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Water });
            array = array.concat(holder);
        }
        if (layers & Layer.Earth) {
            holder = data.earth.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Earth });
            array = array.concat(holder);
        }
        if (layers & Layer.Landuse) {
            holder = data.landuse.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Landuse });
            array = array.concat(holder);
        }
        if (layers & Layer.Buildings) {
            holder = data.buildings.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Buildings });
            array = array.concat(holder);
        }
        if (layers & Layer.Roads) {
            holder = data.roads.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Roads });
            array = array.concat(holder);
        }
        if (layers & Layer.Transit) {
            holder = data.transit.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Transit });
            array = array.concat(holder);
        }
        if (layers & Layer.Boundaries) {
            holder = data.boundaries.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Boundaries });
            array = array.concat(holder);
        }
        //Sort them
        array = this.sortBySortKey(array);

        //Put rest without sort_key at end of array
        if (layers & Layer.Places) {
            holder = data.places.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Places });
            array = array.concat(holder);
        }
        if (layers & Layer.Pois) {
            holder = data.pois.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Pois });
            array = array.concat(holder);
        }
        if (layers & Layer.Landuse_Labels) {
            holder = data.landuse_labels.features;
            holder.forEach(function (obj) { obj.properties.layer = Layer.Landuse_Labels });
            array = array.concat(holder);
        }
        return array;
    }

    private print(data) {
        for (var i = 0; i < data.length; i++)
            console.log(data[i].properties.sort_key);
    }

    private sortBySortKey(array) {
        return array.sort(function(a,b) {
            let x = a.properties.sort_key;
            let y = b.properties.sort_key;
            if (x == null) { x = 0; }
            if (y == null) { y = 0; }

            return x - y;
        });
    }

    public long2tileX(lon, zoom): number
    {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }

    public lat2tileY(lat, zoom): number
    {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }

    public Xtile2long(x, zoom): number
    {
        return (x / Math.pow(2, zoom) * 360 - 180);
    }

    public Ytile2lat(y, zoom): number
    {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    public tile2boundingBox(x: number, y: number, zoom: number): { xMin: number, xMax: number, yMin: number, yMax: number }
    {
        var bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
        bounds.yMin = this.Ytile2lat(y, zoom);
        bounds.yMax = this.Ytile2lat(y + 1, zoom);
        bounds.xMin = this.Xtile2long(x, zoom);
        bounds.xMax = this.Xtile2long(x + 1, zoom);
        return bounds;
    }
}