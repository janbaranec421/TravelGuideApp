var MapStyler = (function () {
    function MapStyler() {
    }
    MapStyler.prototype.stylePoint = function (shape, ctx, zoomLvL, positionX, positionY) {
        if (positionX === void 0) { positionX = 0; }
        if (positionY === void 0) { positionY = 0; }
        if (shape.properties.layer & Layer.Buildings) {
            this.styleBuildingContext(shape, ctx, zoomLvL, positionX, positionY);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, ctx, zoomLvL, positionX, positionY);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, ctx, zoomLvL, positionX, positionY);
        }
        if (shape.properties.layer & Layer.Places) {
            this.stylePlacesContext(shape, ctx, zoomLvL, positionX, positionY);
        }
        if (shape.properties.layer & Layer.Pois) {
            this.stylePoisContext(shape, ctx, zoomLvL, positionX, positionY);
        }
    };
    MapStyler.prototype.styleLine = function (shape, ctx, zoomLvL) {
        if (shape.properties.layer & Layer.Boundaries) {
            this.styleBoundariesContext(shape, ctx, zoomLvL);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Roads) {
            this.styleRoadsContext(shape, ctx, zoomLvL);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, ctx);
        }
    };
    MapStyler.prototype.stylePolygon = function (shape, ctx) {
        if (shape.properties.layer & Layer.Buildings) {
            this.styleBuildingContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Earth) {
            this.styleEarthContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Landuse) {
            this.styleLanduseContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Transit) {
            this.styleTransitContext(shape, ctx);
        }
        if (shape.properties.layer & Layer.Water) {
            this.styleWaterContext(shape, ctx);
        }
    };
    MapStyler.prototype.styleBoundariesContext = function (shape, ctx, zoomLvL) {
        switch (shape.properties.kind) {
            case "country": {
                if (shape.properties.maritime_boundary) {
                    ctx.strokeStyle = "#f1f1f1";
                    ctx.lineWidth = 1.5;
                    break;
                }
                else if (zoomLvL <= 4) {
                    ctx.strokeStyle = "#848484";
                    ctx.lineWidth = 1;
                    break;
                }
                else {
                    ctx.strokeStyle = "#929292";
                    ctx.lineWidth = 1.5;
                    break;
                }
            }
            case "state": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "macroregion": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "aboriginal_lands": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "county": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "disputed": {
                ctx.strokeStyle = "#8e8e8e";
                ctx.lineWidth = 1.5;
                break;
            }
            case "indefinite": {
                ctx.strokeStyle = "#8e8e8e";
                ctx.lineWidth = 1.5;
                break;
            }
            case "indeterminate": {
                ctx.strokeStyle = "#8e8e8e";
                ctx.lineWidth = 1.5;
                break;
            }
            case "line_of_control": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "locality": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "map_unit": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "overlay_limit": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            case "region": {
                ctx.strokeStyle = "#A5A5A5";
                ctx.lineWidth = 0.7;
                break;
            }
            default: {
                ctx.strokeStyle = "#8e8e8e";
                ctx.lineWidth = 0.7;
                break;
            }
        }
    };
    MapStyler.prototype.styleRoadsContext = function (shape, ctx, zoomLvL) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff";
        switch (shape.properties.kind) {
            case "aerialway":
                {
                    ctx.strokeStyle = "#dedcd9";
                    break;
                }
                ;
            case "aeroway":
                {
                    ctx.strokeStyle = "#dedcd9";
                    ctx.lineWidth = 2;
                    break;
                }
                ;
            case "highway":
                {
                    ctx.strokeStyle = "#ffd69b";
                    ctx.lineWidth = 2.75;
                    break;
                }
                ;
            case "major_road":
                {
                    ctx.strokeStyle = "#ffecae";
                    ctx.lineWidth = 2.25;
                    break;
                }
                ;
            case "minor_road":
                {
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    break;
                }
                ;
            case "rail":
                {
                    ctx.strokeStyle = "#d8d8d8";
                    ctx.lineWidth = 1.5;
                    break;
                }
                ;
            case "path":
                {
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1;
                    break;
                }
                ;
            case "ferry":
                {
                    ctx.strokeStyle = "#8EC6EF";
                    ctx.lineWidth = 0.5;
                    ctx.setLineDash([8, 13]);
                    break;
                }
                ;
            case "piste":
                {
                    ctx.strokeStyle = "#E43838";
                    ctx.lineWidth = 0.2;
                    ctx.setLineDash([4, 8]);
                    break;
                }
                ;
            case "racetrack":
                {
                    ctx.strokeStyle = "#E43838";
                    ctx.lineWidth = 0.2;
                    ctx.setLineDash([4, 8]);
                    break;
                }
                ;
            case "portage_way":
                {
                    ctx.strokeStyle = "#00ff00";
                    break;
                }
                ;
        }
        if (shape.properties.kind == "highway" || shape.properties.kind == "major_road") {
            if (zoomLvL == 5) {
                ctx.lineWidth -= 1;
            }
            if (zoomLvL == 6) {
                ctx.lineWidth -= 0.75;
            }
            if (zoomLvL == 7) {
                ctx.lineWidth -= 0.50;
            }
            if (zoomLvL == 8) {
                ctx.lineWidth -= 0.25;
            }
        }
        if (shape.properties.kind == "minor_road") {
            if (zoomLvL == 15) {
                ctx.lineWidth += 0;
            }
            if (zoomLvL == 16) {
                ctx.lineWidth += 0.5;
            }
            if (zoomLvL == 17) {
                ctx.lineWidth += 1;
            }
            if (zoomLvL == 18) {
                ctx.lineWidth += 1.5;
            }
            if (zoomLvL == 19) {
                ctx.lineWidth += 2;
            }
        }
        ctx.lineWidth = ctx.lineWidth + 1;
        ctx.strokeStyle = this.toneColor(ctx.strokeStyle, -70);
        ctx.stroke();
        ctx.setLineDash([0, 0]);
        ctx.lineWidth = ctx.lineWidth - 1;
        ctx.strokeStyle = this.toneColor(ctx.strokeStyle, 70);
        ctx.stroke();
    };
    MapStyler.prototype.styleBuildingContext = function (shape, ctx, zoomLvL, posX, posY) {
        if (zoomLvL === void 0) { zoomLvL = 0; }
        if (posX === void 0) { posX = 0; }
        if (posY === void 0) { posY = 0; }
        ctx.strokeStyle = "DimGray";
        ctx.lineWidth = 0.35;
        ctx.fillStyle = this.toneColor(ctx.strokeStyle, 115);
        ctx.fill();
        /*
        if (shape.geometry.type = "Point" || shape.geometry.type == "MultiPoint") {
            if (zoomLvL >= 20) {
                ctx.fillStyle = "red";
                ctx.fillText(shape.properties.addr_street, posX, posY);
            }
        }*/
    };
    MapStyler.prototype.styleEarthContext = function (shape, ctx, zoomLvL, posX, posY) {
        if (zoomLvL === void 0) { zoomLvL = 0; }
        if (posX === void 0) { posX = 0; }
        if (posY === void 0) { posY = 0; }
        if (shape.geometry.type == "Point" || shape.geometry.type == "MultiPoint") {
            if (zoomLvL == 2) {
                ctx.font = "bolder 15px Arial";
            }
            if (zoomLvL == 3) {
                ctx.font = "bolder 17px Arial";
            }
            if (zoomLvL == 4) {
                ctx.font = "bolder 16px Arial";
            }
            if (zoomLvL >= 5) {
                return;
            }
            ctx.fillStyle = "#3E3B3B";
            ctx.fillText(shape.properties.name, posX, posY);
        }
        else {
            ctx.fillStyle = '#E6E6E6';
            ctx.strokeStyle = this.toneColor(ctx.fillStyle, -100);
            ctx.lineWidth = 0.6;
        }
        ctx.fill();
    };
    MapStyler.prototype.styleLanduseContext = function (shape, ctx) {
        ctx.lineWidth = 0.00001;
        ctx.strokeStyle = "#E6E6E6";
        ctx.fillStyle = "#E6E6E6";
        switch (shape.properties.kind) {
            case "forest":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "garden":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "grass":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "park":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "national_park":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "nature_reserve":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "natural_forest":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "natural_park":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "natural_wood":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "dog_park":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "golf_course":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "meadow":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "petting_zoo":
                {
                    ctx.fillStyle = "#D4F1B1";
                    break;
                }
                ;
            case "picnic_site":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "plant":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "rural":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "scrub":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "stadium":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "theme_park":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "village_green":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "wildlife_park":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "wood":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "zoo":
                {
                    ctx.fillStyle = "#D4F1B1";
                    break;
                }
                ;
            case "wetland":
                {
                    ctx.fillStyle = "#C4DCA8";
                    break;
                }
                ;
            case "beach":
                {
                    ctx.fillStyle = "#faf2c7";
                    break;
                }
                ;
            case "farmland":
                {
                    ctx.fillStyle = "#f2f1e1";
                    break;
                }
                ;
            case "farmyard":
                {
                    ctx.fillStyle = "#f2f1e1";
                    break;
                }
                ;
            case "farm":
                {
                    ctx.fillStyle = "#f2f1e1";
                    break;
                }
                ;
            case "pitch":
                {
                    ctx.fillStyle = "#e0d0a6";
                    break;
                }
                ;
            case "aerodrome":
                {
                    ctx.fillStyle = "#dedcd9";
                    break;
                }
                ;
            case "cemetery":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "dam":
                {
                    ctx.fillStyle = "#dedcd9";
                    break;
                }
                ;
            case "dike":
                {
                    ctx.fillStyle = "#dedcd9";
                    break;
                }
                ;
            case "fort":
                {
                    ctx.fillStyle = "#dedcd9";
                    break;
                }
                ;
            case "graveyard":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "hospital":
                {
                    ctx.fillStyle = "#F7E7E7";
                    break;
                }
                ;
            case "groyne":
                {
                    ctx.fillStyle = "#dedcd9";
                    break;
                }
                ;
            case "playground":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "quarry":
                {
                    ctx.fillStyle = "#dedcd9";
                    break;
                }
                ;
            case "village_green":
                {
                    ctx.fillStyle = "#d0e5b7";
                    break;
                }
                ;
            case "fence":
                {
                    ctx.strokeStyle = "#E6E6E6";
                    ctx.lineWidth = 1;
                    break;
                }
                ;
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            ctx.strokeStyle = this.toneColor(ctx.fillStyle, 100);
            /*
                Fence as polygon makes no sense, because it overlaps content inside fence.
                Most likely data integrity failure because rendering it as string makes it work smoothly
               #Spent 3 hours here
            */
            shape.properties.kind != "fence" ? ctx.fill() : ctx.stroke();
        }
    };
    MapStyler.prototype.styleWaterContext = function (shape, ctx, zoomLvL, posX, posY) {
        if (zoomLvL === void 0) { zoomLvL = 0; }
        if (posX === void 0) { posX = 0; }
        if (posY === void 0) { posY = 0; }
        ctx.fillStyle = '#2B93FF';
        ctx.strokeStyle = '#DEDEDE';
        ctx.textAlign = "center";
        ctx.lineWidth = 0.3;
        if (shape.geometry.type == "Point" || shape.geometry.type == "MultiPoint") {
            if (zoomLvL >= 15 && (shape.properties.kind == "river")) {
                ctx.font = "bolder 10px Arial";
                ctx.strokeText(shape.properties.name, posX, posY);
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (zoomLvL >= 15 && (shape.properties.kind == "lake")) {
                ctx.font = "bolder 10px Arial";
                ctx.strokeText(shape.properties.name, posX, posY);
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (zoomLvL >= 18 && (shape.properties.kind == "water")) {
                ctx.font = "bolder 10px Arial";
                ctx.strokeText(shape.properties.name, posX, posY);
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (zoomLvL >= 14 && (shape.properties.kind == "basin")) {
                ctx.font = "bolder 10px Arial";
                ctx.strokeText(shape.properties.name, posX, posY);
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (zoomLvL >= 6 && (shape.properties.kind == "sea")) {
                ctx.font = "bolder 10px Arial";
                ctx.strokeText(shape.properties.name, posX, posY);
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (zoomLvL >= 1 && (shape.properties.kind == "ocean")) {
                ctx.font = "bolder 11px Arial";
                ctx.strokeText(shape.properties.name, posX, posY);
                ctx.fillText(shape.properties.name, posX, posY);
            }
        }
        if (shape.geometry.type == "LineString" || shape.geometry.type == "MultiLineString") {
            ctx.strokeStyle = '#9cc3df';
            ctx.fillStyle = '#9cc3df';
            ctx.lineWidth = 0.6;
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            ctx.strokeStyle = '#6d6d6d';
            ctx.fillStyle = '#9cc3df';
            ctx.fill();
        }
    };
    MapStyler.prototype.stylePoisContext = function (shape, ctx, zoomLvL, posX, posY) {
        ctx.strokeStyle = '#E6E6E6';
        ctx.textAlign = "center";
        ctx.lineWidth = 2;
        if (shape.properties.name && zoomLvL >= shape.properties.min_zoom) {
            var name = shape.properties.name;
            var kind = shape.properties.kind;
            if (zoomLvL >= 19) {
                switch (kind) {
                    case "cafe": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "restaurant": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 9px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "bar": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "club": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "fuel": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "cinema": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "carousel": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "information": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "mall": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "pharmacy": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "pub": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "supermarket": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "resort": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "roller_coaster": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "pharmacy": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "theatre": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "stadium": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "clothes": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "attraction": {
                        ctx.fillStyle = '#B06727';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "lighthouse": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "military": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "prison": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "school": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "townhall": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "university": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "government": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "educational_institution": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "fort": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "airport": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "college": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "association": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "police": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "cemetery": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "dam": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "embassy": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    default: { }
                }
            }
            if (zoomLvL >= 18) {
                switch (kind) {
                    case "memorial": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "historical ": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "gallery ": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "monument": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "museum": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "place_of_religion": {
                        ctx.fillStyle = '#7A3D3D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    default: { }
                }
            }
            if (zoomLvL >= 17) {
                switch (kind) {
                    case "bank": {
                        ctx.fillStyle = '#5D70D1';
                        ctx.font = "bolder 9px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "national_park": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "nature_reserve": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "park": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "wood": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "zoo": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "forest": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "garden": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "camp_site": {
                        ctx.fillStyle = '#0D540D';
                        ctx.font = "bolder 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    default: { }
                }
            }
            if (zoomLvL >= 16) {
                switch (kind) {
                    case "hotel": {
                        ctx.fillStyle = '#1E3EDC';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "motel": {
                        ctx.fillStyle = '#1E3EDC';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "hostel": {
                        ctx.fillStyle = '#1E3EDC';
                        ctx.font = "bold 10px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "ambulatory_care": {
                        ctx.fillStyle = '#E74E4E';
                        ctx.font = "bolder 11px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "clinic": {
                        ctx.fillStyle = '#E74E4E';
                        ctx.font = "bolder 11px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "doctors": {
                        ctx.fillStyle = '#E74E4E';
                        ctx.font = "bolder 11px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "healthcare": {
                        ctx.fillStyle = '#E74E4E';
                        ctx.font = "bolder 11px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    case "hospital": {
                        ctx.fillStyle = '#E74E4E';
                        ctx.font = "bolder 11px Arial";
                        ctx.strokeText(name, posX, posY);
                        ctx.fillText(name, posX, posY);
                        return;
                    }
                    default: { }
                }
            }
        }
    };
    MapStyler.prototype.stylePlacesContext = function (shape, ctx, zoomLvL, posX, posY) {
        ctx.fillStyle = '#333333';
        ctx.textAlign = "center";
        ctx.lineWidth = 1;
        if (shape.properties.min_zoom <= zoomLvL) {
            if (shape.properties.kind == "locality") {
                if (12 >= zoomLvL && shape.properties.kind_detail == "locality") {
                    if (zoomLvL == 14) {
                        ctx.font = "bolder 9px Arial";
                    }
                    else if (zoomLvL == 13) {
                        ctx.font = "bolder 11px Arial";
                    }
                    else {
                        ctx.font = "bolder 12px Arial";
                    }
                    ctx.fillText(shape.properties.name, posX, posY);
                }
                if (13 <= zoomLvL && shape.properties.kind_detail == "village") {
                    if (zoomLvL == 14) {
                        ctx.font = "bolder 10px Arial";
                    }
                    if (zoomLvL == 15) {
                        ctx.font = "bolder 9px Arial";
                    }
                    else {
                        ctx.font = "bolder 11px Arial";
                    }
                    ctx.fillText(shape.properties.name, posX, posY);
                }
                if (12 <= zoomLvL && zoomLvL <= 14 && shape.properties.kind_detail == "town") {
                    if (zoomLvL == 10) {
                        ctx.font = "bolder 9px Arial";
                    }
                    else if (zoomLvL == 12) {
                        ctx.font = "bolder 11px Arial";
                    }
                    else {
                        ctx.font = "bolder 12px Arial";
                    }
                    ctx.fillText(shape.properties.name, posX, posY);
                }
                if (13 <= zoomLvL && shape.properties.kind_detail == "hamlet") {
                    ctx.font = "bolder 11px Arial";
                    ctx.fillText(shape.properties.name, posX, posY);
                }
                if (8 <= zoomLvL && zoomLvL <= 16 && shape.properties.kind_detail == "city") {
                    if (zoomLvL == 8) {
                        ctx.font = "bolder 14px Arial";
                    }
                    else if (zoomLvL == 9) {
                        ctx.font = "bolder 17px Arial";
                    }
                    else if (zoomLvL == 10) {
                        ctx.font = "bolder 17px Arial";
                    }
                    else if (zoomLvL == 11) {
                        ctx.font = "bolder 18px Arial";
                    }
                    else if (zoomLvL == 12) {
                        ctx.font = "bolder 21px Arial";
                    }
                    else {
                        ctx.font = "bolder 17px Arial";
                    }
                    ctx.fillText(shape.properties.name, posX, posY);
                }
            }
            if (shape.properties.kind == "neighbourhood" && 13 <= zoomLvL && zoomLvL <= 18) {
                ctx.font = "bolder 14px Roboto_Regular";
                ctx.fillStyle = '#473D3D';
                ctx.lineWidth = 0.1;
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (shape.properties.kind == "macrohood" && 12 <= zoomLvL && zoomLvL <= 14) {
                ctx.font = "bolder 16px Roboto_Regular";
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (shape.properties.kind == "microhood" && 14 <= zoomLvL && zoomLvL <= 18) {
                ctx.font = "bolder 15px Roboto_Regular";
                ctx.fillStyle = '#5F0000';
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (shape.properties.kind == "borough" && 10 <= zoomLvL && zoomLvL <= 13) {
                ctx.font = "bolder 14px Roboto_Regular";
                ctx.fillText(shape.properties.name, posX, posY);
            }
            if (shape.properties.kind == "country" && 2 < zoomLvL && zoomLvL < 9) {
                ctx.font = "italic bolder 17px Arial";
                var name = !shape.properties["name:en"] ? shape.properties.name : shape.properties["name:en"];
                if (zoomLvL < 5) {
                    return;
                }
                if (zoomLvL == 5) {
                    if (shape.properties.population < 2000000) {
                        return;
                    }
                    else if (shape.properties.population < 3000000) {
                        ctx.font = "italic bolder 10px Arial";
                    }
                    else if (shape.properties.population < 5000000) {
                        ctx.font = "italic bolder 11px Arial";
                    }
                    else {
                        ctx.font = "italic bolder 12px Arial";
                    }
                }
                if (zoomLvL == 6) {
                    ctx.font = "italic bolder 14px Arial";
                }
                if (zoomLvL == 7) {
                    ctx.font = "italic bolder 19px Arial";
                }
                if (zoomLvL == 8) {
                    ctx.font = "italic bolder 25px Arial";
                }
                ctx.fillText(name, posX, posY);
            }
        }
    };
    MapStyler.prototype.styleTransitContext = function (shape, ctx) {
        ctx.fillStyle = '#b2b2ae';
        ctx.lineWidth = 0.5;
        if (shape.geometry.type == "LineString" || shape.geometry.type == "MultiLineString") {
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = '#DCA6A6';
        }
        if (shape.geometry.type == "Polygon" || shape.geometry.type == "MultiPolygon") {
            ctx.fillStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.fill();
        }
    };
    MapStyler.prototype.toneColor = function (clr, diff) {
        /* -diff darken
           +diff brighten */
        var isHEX = false;
        if (clr[0] == "#") {
            clr = clr.slice(1);
            isHEX = true;
        }
        var num = parseInt(clr, 16);
        var r = (num >> 16) + diff;
        if (r > 255)
            r = 255;
        else if (r < 0)
            r = 0;
        var b = ((num >> 8) & 0x00FF) + diff;
        if (b > 255)
            b = 255;
        else if (b < 0)
            b = 0;
        var g = (num & 0x0000FF) + diff;
        if (g > 255)
            g = 255;
        else if (g < 0)
            g = 0;
        return (isHEX ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    };
    return MapStyler;
})();
//# sourceMappingURL=MapStyler.js.map