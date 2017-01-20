class MapTile {
    public rawData: any;

    set _rawData(data: any) {
        this.rawData = data;
        this.sortedData = this.prepareData(data, this.layers);
        this.didChange = true;
    }

    public boundingBox: any = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    public scale: number;
    public xScale: number;
    public yScale: number;
    public layers: Layer;

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public didChange = true;
    public isRequested = false;

    public sortedData: any[] = [];

    public tileX: number;
    public tileY: number;
    public tileWidth: number;
    public tileHeight: number;
    public longitude: number;
    public latitude: number;
    public zoom: number;

    public positionX: number;
    public positionY: number;

    constructor(data: any, tileX: number, tileY: number, zoom: number, layers: Layer, shiftX: number, shiftY: number, tileWidth: number = 260, tileHeight: number = 260)
    {
        this.rawData = data;
        this.tileX = tileX;
        this.tileY = tileY;
        this.zoom = zoom;
        this.layers = layers;
        this.positionX = shiftX;
        this.positionY = shiftY;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.longitude = Converter.Xtile2long(tileX, zoom);
        this.latitude = Converter.Ytile2lat(tileX, zoom);
        this.boundingBox = Converter.tile2boundingBox(tileX, tileY, zoom);

        this.xScale = this.tileWidth / Math.abs(this.boundingBox.xMax - this.boundingBox.xMin);
        this.yScale = this.tileHeight / Math.abs(this.boundingBox.yMax - this.boundingBox.yMin);
        this.scale = this.xScale < this.yScale ? this.xScale : this.yScale;   

        if (this.rawData != null)
        {
            this.sortedData = this.prepareData(this.rawData, this.layers);
        }
    }

    private prepareData(data: any, layers: Layer): any[]
    {
        let array: any[] = [];
        let holder: any[] = [];

        // Compose layers which have sort_key attribute (buildings, roads, etc)
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

        //Put rest without sort_key at end of array (addresses, labels, etc.)   
        holder = array.filter((obj) => { return obj.properties.sort_rank == undefined; });
        array.splice(0, holder.length);
        array = array.concat(holder);
        
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
            if (data[i].properties.sort_rank == undefined) {
                console.log(data[i].properties.addr_street);
            }
            else {
                console.log(data[i].properties.sort_rank);
            }
    }

    private sortBySortKey(array) {
        return array.sort(function(a,b) {
            let x = a.properties.sort_rank;
            let y = b.properties.sort_rank;
            if (x == null) { x = 0; }
            if (y == null) { y = 0; }

            return x - y;
        });
    }
}
