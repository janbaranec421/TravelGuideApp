class MapStyler {

    public stylePoint(shape: any, context: any, positionX: number = 0, positionY: number = 0): void {
        if (shape.properties.layer & Layer.Buildings) {
            this.styleBuildingContext(shape, context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, context);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, context);
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, context);
        }
        if (shape.properties.layer & Layer.Places) {
            this.stylePlacesContext(shape, context, positionX, positionY);
        }
        if (shape.properties.layer & Layer.Pois) {
            this.stylePoisContext(shape, context, positionX, positionY);
        }
    }

    public styleLine(shape: any, context: any): void {
        if (shape.properties.layer & Layer.Boundaries) {
            this.styleBoundariesContext(shape, context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, context);
        }
        if (shape.properties.layer & Layer.Roads) {
            this.styleRoadsContext(shape, context);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, context);
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, context);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, context);
        }
    }

    public stylePolygon(shape: any, context: any): void {
        if (shape.properties.layer & Layer.Buildings) {
            this.styleBuildingContext(shape, context);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, context);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, context);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, context);
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, context);
        }
    }

    private styleBoundariesContext(shape: any, context: any): void {
        
        switch (shape.properties.kind) {
            case "country": {
                if (shape.properties.maritime_boundary) { context.strokeStyle = "#f1f1f1"; context.lineWidth = 1.5; break; }
                else { context.strokeStyle = "#A5A5A5"; context.lineWidth = 1.5; break; }
            }
            case "state": {  context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            case "macroregion": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            case "aboriginal_lands": {  context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7;  break; }
            case "county": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7;  break; }
            case "disputed": { context.strokeStyle = "#8e8e8e"; context.lineWidth = 1.5; break; }
            case "indefinite": { context.strokeStyle = "#8e8e8e"; context.lineWidth = 1.5; break; }
            case "indeterminate": { context.strokeStyle = "#8e8e8e"; context.lineWidth = 1.5;  break; }
            case "line_of_control": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            case "locality": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            case "map_unit": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            case "overlay_limit": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            case "region": { context.strokeStyle = "#A5A5A5"; context.lineWidth = 0.7; break; }
            default: { context.strokeStyle = "#8e8e8e"; context.lineWidth = 0.7; break; }
        }
    }

    private styleRoadsContext(shape: any, context: any): void {
        context.lineWidth = 1.5;
        context.strokeStyle = "#ffffff";

        switch (shape.properties.kind) {
            case "aerialway": { context.strokeStyle = "#dedcd9"; break; };
            case "aeroway": { context.strokeStyle = "#dedcd9"; context.lineWidth = 2; break; };
            case "highway": { context.strokeStyle = "#ffd69b"; context.lineWidth = 2.75; break; };
            case "major_road": { context.strokeStyle = "#ffecae"; context.lineWidth = 2.25; break; };
            case "minor_road": { context.strokeStyle = "white"; context.lineWidth = 2; break; };
            case "rail": { context.strokeStyle = "#d8d8d8"; context.lineWidth = 1.5; break; };
            case "path": { context.strokeStyle = "#ffffff"; context.lineWidth = 1; break; };
            case "ferry": { context.strokeStyle = "#8EC6EF"; context.lineWidth = 0.5; context.setLineDash([8, 13]); break; };
            case "piste": { context.strokeStyle = "#E43838"; context.lineWidth = 0.2; context.setLineDash([4, 8]);break; };
            case "racetrack": { context.strokeStyle = "#E43838"; context.lineWidth = 0.2; context.setLineDash([4, 8]); break; };
            case "portage_way": { context.strokeStyle = "#00ff00"; break; };
        } 
            context.lineWidth = context.lineWidth + 1;
            context.strokeStyle = this.toneColor(context.strokeStyle, -70);
            context.stroke();
            context.setLineDash([0, 0]);
            context.lineWidth = context.lineWidth - 1;
            context.strokeStyle = this.toneColor(context.strokeStyle, 70);
            context.stroke();
        
    }

    private styleBuildingContext(shape: any, context: any): void {
        context.strokeStyle = "DimGray"
        context.lineWidth = 0.35;
        context.fillStyle = this.toneColor(context.strokeStyle, 115);
        context.fill();
    }

    private styleEarthContext(shape: any, context: any): void {
        context.fillStyle = '#E6E6E6';
        context.strokeStyle = this.toneColor(context.fillStyle, -100);
        context.lineWidth = 0.6;
        context.fill();
    }

    private styleLanduseContext(shape: any, context: any): void {
        context.lineWidth = 0.00001;
        context.strokeStyle = "#E6E6E6";
        context.fillStyle = "#E6E6E6";

        switch (shape.properties.kind) {
            case "forest": { context.fillStyle = "#d0e5b7"; break; };
            case "garden": { context.fillStyle = "#d0e5b7"; break; };
            case "grass": { context.fillStyle = "#d0e5b7"; break; };
            case "park": { context.fillStyle = "#d0e5b7"; break; };
            case "national_park": { context.fillStyle = "#d0e5b7"; break; };
            case "nature_reserve": { context.fillStyle = "#d0e5b7"; break; };
            case "natural_forest": { context.fillStyle = "#d0e5b7"; break; };
            case "natural_park": { context.fillStyle = "#d0e5b7"; break; };
            case "natural_wood": { context.fillStyle = "#d0e5b7"; break; };
            case "dog_park": { context.fillStyle = "#d0e5b7"; break; };
            case "golf_course": { context.fillStyle = "#d0e5b7"; break; };
            case "meadow": { context.fillStyle = "#d0e5b7"; break; };
            case "petting_zoo": { context.fillStyle = "#D4F1B1"; break; };
            case "picnic_site": { context.fillStyle = "#d0e5b7"; break; };
            case "plant": { context.fillStyle = "#d0e5b7"; break; };
            case "rural": { context.fillStyle = "#d0e5b7"; break; };
            case "scrub": { context.fillStyle = "#d0e5b7"; break; };
            case "stadium": { context.fillStyle = "#d0e5b7"; break; };
            case "theme_park": { context.fillStyle = "#d0e5b7"; break; };
            case "village_green": { context.fillStyle = "#d0e5b7"; break; };
            case "wildlife_park": { context.fillStyle = "#d0e5b7"; break; };
            case "wood": { context.fillStyle = "#d0e5b7"; break; };
            case "zoo": { context.fillStyle = "#D4F1B1"; break; };
            case "wetland": { context.fillStyle = "#C4DCA8"; break; };
            case "beach": { context.fillStyle = "#faf2c7"; break; };
            case "farmland": { context.fillStyle = "#f2f1e1"; break; };
            case "farmyard": { context.fillStyle = "#f2f1e1"; break; };
            case "farm": { context.fillStyle = "#f2f1e1"; break; };
            case "pitch": { context.fillStyle = "#e0d0a6"; break; };
            case "aerodrome": { context.fillStyle = "#dedcd9"; break; };
            case "cemetery": { context.fillStyle = "#d0e5b7"; break; };
            case "dam": { context.fillStyle = "#dedcd9"; break; };
            case "dike": { context.fillStyle = "#dedcd9"; break; };
            case "fort": { context.fillStyle = "#dedcd9"; break; };
            case "graveyard": { context.fillStyle = "#d0e5b7"; break; };
            case "hospital": { context.fillStyle = "#F7E7E7"; break; };
            case "groyne": { context.fillStyle = "#dedcd9"; break; };
            case "playground": { context.fillStyle = "#d0e5b7"; break; };
            case "quarry": { context.fillStyle = "#dedcd9"; break; };
            case "village_green": { context.fillStyle = "#d0e5b7"; break; };
            case "fence": { context.strokeStyle = "#E6E6E6"; context.lineWidth = 1; break; };
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            context.strokeStyle = this.toneColor(context.fillStyle, 100);
            /* 
            Fence as polygon makes no sense, because it overlaps content inside fence. 
            Most likely data integrity failure bcuz rendering it as string makes it work smoothly
               #Spent 2 hours here
            */
            shape.properties.kind != "fence" ? context.fill() : context.stroke();
        }
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

    private stylePlacesContext(shape: any, context: any, posX: number, posY: number): void {/*
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

    private toneColor(clr, diff) {
        /* -diff darken
           +diff brighten */
        var isHEX = false;

        if (clr[0] == "#") {
            clr = clr.slice(1);
            isHEX = true;
        }

        var num = parseInt(clr, 16);

        var r = (num >> 16) + diff;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + diff;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        var g = (num & 0x0000FF) + diff;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return (isHEX ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }
}