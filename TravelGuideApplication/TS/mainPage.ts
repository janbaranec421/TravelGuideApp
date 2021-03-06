﻿window.onload = () => {
    var mainPage = new MainPage();
}

class MainPage {
    public topMenu: TopMenu;
    public sideMenu: SideMenu;
    public map: Map;
    public searchPanel: MapSearchingPanel;
    public db: Database;
    public scheduleList: ScheduleList;
    public placesList: PlacesList;

    public crumbsLocation: string[];

    public touchXstart: number;
    public touchYstart: number;
    public touchXstart_second: number;
    public touchYstart_second: number;
    public swipe_threshold: number = 40;
    public touch_threshold: number = 10;
    public isSwipeFired = false;

    // Used to count delta of touch movement on canvas
    public lastTouchPositionX: number = 0;
    public lastTouchPositionY: number = 0;

    static mapzen_API_key = "mapzen-eES7bmW";
    static openweather_API_key = "57cf72874229f081c28596f80a572323";

    // Ostrava - Poruba
    // 49.828526
    // 18.173270

    // Bratislava - mesto
    // 48.1492400
    // 17.1070000

    public latitude: number = 49.833683;
    public longitude: number = 18.163609;
    public _zoomLvl: number = 15;

    get zoomLvl(): any {
        return this._zoomLvl;
    }
    set zoomLvl(zoom: any) {
        if (zoom > 20) { this._zoomLvl = 20; }
        else if (zoom < 2) { this._zoomLvl = 2 }
        else { this._zoomLvl = zoom; }
    }

    public layers: Layer = Layer.Boundaries | Layer.Roads | Layer.Buildings | Layer.Earth | Layer.Landuse | Layer.Water | Layer.Places | Layer.Pois;

    constructor() {
        this.sideMenu = new SideMenu(this);
        this.topMenu = new TopMenu(this, this.sideMenu);
        this.scheduleList = new ScheduleList(this);
        this.placesList = new PlacesList(this);
        this.map = new Map(this);
        this.searchPanel = new MapSearchingPanel(this.map);
        this.map.setMapSearchingPanel(this.searchPanel);

        this.crumbsLocation = ["Home"];
        this.topMenu.setNavigationPath(this.crumbsLocation);


        this.db = new Database();
        this.db.initializeDB()
            .then((value) => {
                this.map.database = this.db;

                var lastMapCoords = JSON.parse(window.sessionStorage.getItem("lastMapCoords"));
                if (lastMapCoords) {
                    this.latitude = lastMapCoords.latitude;
                    this.longitude = lastMapCoords.longitude;
                    this.zoomLvl = lastMapCoords.zoom;
                }

                this.map.displayPlace(this.latitude, this.longitude, this.zoomLvl, this.layers, true);
                window.addEventListener('resize', this.adjustMapToViewport.bind(this), false);
                this.adjustMapToViewport();

                var lastVisitedList = JSON.parse(window.sessionStorage.getItem("lastVisitedList"));
                if (lastVisitedList) {
                    if (lastVisitedList.selectorType == "collection") { this.showPlacesByCollection(lastVisitedList.selectorValue); }
                    if (lastVisitedList.selectorType == "schedule") { this.showSchedules(); }
                    if (lastVisitedList.selectorType == "tag") { this.showPlacesByTag(lastVisitedList.selectorValue); }
                }
            })
            .catch((err) => {
                console.log(err);
            });

        var canvas = document.getElementById("mapCanvasLabels");
        canvas.addEventListener('wheel', this.HandleCanvasWheel.bind(this));
        canvas.addEventListener('touchmove', this.HandleCanvasTouchMove.bind(this), false);
        canvas.addEventListener('touchstart', this.HandleCanvasTouchStart.bind(this), false);
        canvas.addEventListener('touchend', this.HandleCanvasTouchEnd.bind(this), false);

        var pageContent = document.getElementById("pageContent");
        pageContent.addEventListener('touchmove', this.HandleTouchMove.bind(this), false);
        pageContent.addEventListener('touchstart', this.HandleTouchStart.bind(this), false);
        pageContent.addEventListener('touchend', this.HandleTouchEnd.bind(this), false);

        $(window).on("beforeunload ", () => {
            var obj = this.map.getCoordinatesAtCenter();
            this.zoomLvl = this.map.currentZoom;
            var item = {
                latitude: obj.latitude,
                longitude: obj.longitude,
                zoom: this.zoomLvl
            }
            window.sessionStorage.setItem("lastMapCoords", JSON.stringify(item));
        });
    }

    public showMap(lat: number = null, lon: number = null) {
        $("#mapContent").css({ "display": "block" });
        $("#scheduleList").css({ "display": "none" });
        $("#placesList").css({ "display": "none" });

        this.crumbsLocation = ["Home"];
        this.topMenu.setNavigationPath(this.crumbsLocation);
        this.adjustMapToViewport();

        if (lat && lon) {
            this.latitude = lat;
            this.longitude = lon;
            this.zoomLvl = 15;
            this.map.clearPlaceMark();
            this.map.displayPlace(this.latitude, this.longitude, this.zoomLvl, this.layers, true);
        }
    }

    public showSchedules() {
        $("#mapContent").css({ "display": "none" });
        $("#scheduleList").css({ "display": "block" });
        $("#placesList").css({ "display": "none" });

        this.crumbsLocation = ["Home", "Schedules"];
        this.topMenu.setNavigationPath(this.crumbsLocation);
        this.scheduleList.displaySchedulesByProjectID(this.sideMenu.currentProjectID);
    }

    public showPlaces() {
        $("#mapContent").css({ "display": "none" });
        $("#scheduleList").css({ "display": "none" });
        $("#placesList").css({ "display": "block" });
    }

    public showPlacesByCollection(collection: string) {
        $("#mapContent").css({ "display": "none" });
        $("#scheduleList").css({ "display": "none" });
        $("#placesList").css({ "display": "block" });

        this.crumbsLocation = ["Home", "Collection (" + collection + ")"];
        this.topMenu.setNavigationPath(this.crumbsLocation);
        this.placesList.displayPlacesWithCollectionName(collection);
    }

    public showPlacesByTag(tag: string) {
        $("#mapContent").css({ "display": "none" });
        $("#scheduleList").css({ "display": "none" });
        $("#placesList").css({ "display": "block" });

        this.crumbsLocation = ["Home", "Tag (" + tag + ")"];
        this.topMenu.setNavigationPath(this.crumbsLocation);
        this.placesList.displayPlacesWithTagName(tag);
    }

    public showPlacesBySchedule(schedule: string) {
        $("#mapContent").css({ "display": "none" });
        $("#scheduleList").css({ "display": "none" });
        $("#placesList").css({ "display": "block" });

        this.crumbsLocation = ["Home", "Schedules", schedule ];
        this.topMenu.setNavigationPath(this.crumbsLocation);
        this.placesList.displayPlacesWithScheduleName(schedule);
    }

    private HandleTouchStart(evt): void {
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
    }

    private HandleTouchMove(evt): void {
        if (!this.touchXstart || !this.touchYstart) {
            return;
        }
        var xDiff = evt.touches[0].clientX - this.touchXstart;
        var yDiff = evt.touches[0].clientY - this.touchYstart;

        // checks if single swipe
        if ((Math.abs(xDiff) > this.swipe_threshold) || (Math.abs(yDiff) > this.swipe_threshold)) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff < 0) {  // Left swipe
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {            // Right swipe
                    this.sideMenu.showMenu(true);
                    this.isSwipeFired = true;
                }
            }
            else {
                if (yDiff < 0) {  // Up swipe
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {            // Down swipe
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
            }
        }
    }

    private HandleTouchEnd(evt): void {
        if (!this.isSwipeFired) {
            this.sideMenu.showMenu(false);
        }
        this.isSwipeFired = false;
    }

    private HandleCanvasTouchStart(evt): void {
        evt.stopPropagation();
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;

        if (evt.touches.length > 1) {
            this.touchXstart_second = evt.touches[1].clientX;
            this.touchYstart_second = evt.touches[1].clientY;
        }
    }

    private HandleCanvasTouchMove(evt): void {
        //Stop handling event by parent
        evt.stopPropagation();
        //Stop resizing of page
        evt.preventDefault();

        if (this.isSwipeFired)
            return;
        if (!this.touchXstart || !this.touchYstart) {
            return;
        }
        var xDiff = evt.touches[0].clientX - this.touchXstart;
        var yDiff = evt.touches[0].clientY - this.touchYstart;

        if (this.lastTouchPositionX != 0 && this.lastTouchPositionY != 0) {
            this.map.shiftMap(evt.touches[0].clientX - this.lastTouchPositionX, evt.touches[0].clientY - this.lastTouchPositionY);
        }

        this.lastTouchPositionX = evt.touches[0].clientX;
        this.lastTouchPositionY = evt.touches[0].clientY;
 
        // checks if doubleswipe 
        if (evt.touches.length > 1) {
            var xDiff_second = evt.touches[1].clientX - this.touchXstart_second;
            var yDiff_second = evt.touches[1].clientY - this.touchYstart_second;

            var coords = this.map.getCoordinatesAtCenter();
            this.latitude = coords.latitude;
            this.longitude = coords.longitude;
            this.zoomLvl = this.map.currentZoom;
            // Horizontal double swipe
            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff_second) > Math.abs(yDiff_second)) {
                if (xDiff > this.swipe_threshold && xDiff_second < -this.swipe_threshold && this.touchXstart < this.touchXstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl -= 1), this.layers);
                    this.isSwipeFired = true;
                }
                if (xDiff < -this.swipe_threshold && xDiff_second > this.swipe_threshold && this.touchXstart > this.touchXstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl -= 1), this.layers);
                    this.isSwipeFired = true;
                }
                if (xDiff < -this.swipe_threshold && xDiff_second > this.swipe_threshold && this.touchXstart < this.touchXstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl += 1), this.layers);
                    this.isSwipeFired = true;
                }
                if (xDiff > this.swipe_threshold && xDiff_second < -this.swipe_threshold && this.touchXstart > this.touchXstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl += 1), this.layers);
                    this.isSwipeFired = true;
                }
            }
            // Vertical double swipe
            else if (Math.abs(yDiff) > Math.abs(xDiff) && Math.abs(yDiff_second) > Math.abs(xDiff_second)) {
                if (yDiff > this.swipe_threshold && yDiff_second < -this.swipe_threshold && this.touchYstart < this.touchYstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl -= 1), this.layers);
                    this.isSwipeFired = true;
                }
                if (yDiff < -this.swipe_threshold && yDiff_second > this.swipe_threshold && this.touchYstart > this.touchYstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl -= 1), this.layers);
                    this.isSwipeFired = true;
                }
                if (yDiff < -this.swipe_threshold && yDiff_second > this.swipe_threshold && this.touchYstart < this.touchYstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl += 1), this.layers);
                    this.isSwipeFired = true;
                }
                if (yDiff > this.swipe_threshold && yDiff_second < -this.swipe_threshold && this.touchYstart > this.touchYstart_second) {
                    this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl += 1), this.layers);
                    this.isSwipeFired = true;
                }
            }
        }
    }

    private HandleCanvasTouchEnd(evt): void {
        evt.stopPropagation();

        this.lastTouchPositionX = 0;
        this.lastTouchPositionY = 0;

        var clientX = evt.changedTouches[0].clientX;
        var clientY = evt.changedTouches[0].clientY;

        // Detects touch on single point with certain threshold
        if (Math.pow((clientX - this.touchXstart), 2) + Math.pow((clientY - this.touchYstart), 2) < Math.pow(this.touch_threshold, 2)) {
            var canvas = <HTMLCanvasElement>document.getElementById("mapCanvas");
            var rect = canvas.getBoundingClientRect();
            var x = Math.round((evt.changedTouches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width);
            var y = Math.round((evt.changedTouches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
            this.map.markPlace(x, y);         
        }
        this.isSwipeFired = false;
    }

    private HandleCanvasWheel(evt): void {
        evt.preventDefault();
        var canvas = <HTMLCanvasElement>document.getElementById("mapCanvas");
        var rect = canvas.getBoundingClientRect();
        var x = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
        var y = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
        var coords = this.map.getCoordinatesAtCenter();
        this.latitude = coords.latitude;
        this.longitude = coords.longitude;
        this.zoomLvl = this.map.currentZoom;
        if (evt.deltaY > 0)
            this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl -= 1), this.layers);
        else
            this.map.displayPlace(coords.latitude, coords.longitude, (this.zoomLvl += 1), this.layers);
    }

    private adjustMapToViewport() {
        // Get canvas dimensions in pixels
        var width = parseInt($("#mapCanvas").css("width"));
        var height = parseInt($("#mapCanvas").css("height"));

        var coords = this.map.getCoordinatesAtCenter();
        this.latitude = coords.latitude;
        this.longitude = coords.longitude;

        // Set canvas coordinates accordingly to canvas element dimensions
        $("#mapCanvas").attr('width', width);
        $("#mapCanvas").attr('height', height);
        $("#mapCanvasLabels").attr('width', width);
        $("#mapCanvasLabels").attr('height', height);
        this.map.setMapDimensions(width, height);

        // Display adjusted map to coordinates, whose were in center before adjusting.
        this.map.displayPlace(coords.latitude, coords.longitude, this.zoomLvl, this.layers);
    }
}
