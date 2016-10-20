class MapTile {
    public data: any;
    public boundingBox: any = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    public scale: number;
    public xScale: number;
    public yScale: number;
    public layers: Layer;

    public sortedData: any [] = [];

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

        //this.data.boundaries.features = this.sortBySortKey(this.data.boundaries.features);
        //this.data.buildings = this.sortBySortKey(this.data.buildings.features);
        this.data.earth.features = this.sortBySortKey(this.data.earth.features);
        //this.data.landuse = this.sortBySortKey(this.data.landuse.features);
        //this.data.roads = this.sortBySortKey(this.data.roads.features);
        //this.data.transit = this.sortBySortKey(this.data.transit.features);
        this.data.water.features = this.sortBySortKey(this.data.water.features);

        console.log("--------------");
        this.print(this.data.water.features);
        //this.print(this.data.buildings);
        console.log("--------------");
        this.print(this.data.earth.features);
        //this.print(this.data.landuse);
        //this.print(this.data.roads);
        //this.print(this.data.transit);
        //this.print(this.data.boundaries);
        

        console.log(this.prepareData(this.data, this.layers));
    }

    private prepareData(data: any, layers: Layer) : any[]
    {
        let array: any[] = [];
        let sorted: any[] = [];

        // Compose layers which have sort_key attribute
        if (layers & Layer.Water)           array = array.concat(data.water.features);
        if (layers & Layer.Earth)           array = array.concat(data.earth.features);
        if (layers & Layer.Landuse)         array = array.concat(data.landuse.features);
        if (layers & Layer.Buildings)       array = array.concat(data.buildings.features);
        if (layers & Layer.Roads)           array = array.concat(data.roads.features);
        if (layers & Layer.Transit)         array = array.concat(data.transit.features);
        if (layers & Layer.Boundaries)      array = array.concat(data.boundaries.features);
        //Sort them

        console.log("--------------");
        this.print(this.sortBySortKey(array));
        console.log("--------------");
        this.print(this.sortBySortKey(array));
        sorted = this.sortBySortKey(array);
        console.log("--------------");
        this.print(sorted);

        //Put rest without sort_key at end of array
        if (layers & Layer.Places)          array = array.concat(data.places.features);
        if (layers & Layer.Pois)            array = array.concat(data.pois.features);
        if (layers & Layer.Landuse_Labels)  array = array.concat(data.landuse_labels.features);

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
