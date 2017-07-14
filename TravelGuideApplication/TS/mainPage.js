window.onload = function () {
    var mainPage = new MainPage();
};
var MainPage = (function () {
    function MainPage() {
        var _this = this;
        this.swipe_threshold = 40;
        this.touch_threshold = 10;
        this.isSwipeFired = false;
        // Used to count delta of touch movement on canvas
        this.lastTouchPositionX = 0;
        this.lastTouchPositionY = 0;
        this._zoomLvl = 15;
        this.layers = Layer.Boundaries | Layer.Roads | Layer.Buildings | Layer.Earth | Layer.Landuse | Layer.Water | Layer.Places | Layer.Pois;
        this.sideMenu = new SideMenu();
        this.topMenu = new TopMenu(this.sideMenu);
        this.map = new Map();
        this.searchPanel = new MapSearchingPanel(this.map);
        this.map.setMapSearchingPanel(this.searchPanel);
        this.topMenu.setNavigationPath([
            { txt: "Home", href: "index.html" }
        ]);
        this.db = new Database();
        this.db.initializeDB()
            .then(function (value) {
            _this.map.database = _this.db;
            if (window.sessionStorage.getItem("lastMapCoords")) {
                var coords = JSON.parse(window.sessionStorage.getItem("lastMapCoords"));
                _this.latitude = parseFloat(coords.latitude);
                _this.longitude = parseFloat(coords.longitude);
                _this.zoomLvl = parseInt(coords.zoom);
            }
            if (window.sessionStorage.getItem("placeItemCoordinates")) {
                var placeItemCoords = JSON.parse(window.sessionStorage.getItem("placeItemCoordinates"));
                _this.latitude = parseFloat(placeItemCoords.lat);
                _this.longitude = parseFloat(placeItemCoords.lon);
                _this.zoomLvl = 15;
                _this.map.makeReturnOnItemButton();
            }
            else {
                _this.map.removeReturnOnItemButton();
            }
            if (!_this.latitude && !_this.longitude) {
                _this.latitude = 49.833683;
                _this.longitude = 18.163609;
                _this.zoomLvl = 15;
            }
            _this.map.displayPlace(_this.latitude, _this.longitude, _this.zoomLvl, _this.layers, true);
            window.addEventListener('resize', _this.adjustMapToViewport.bind(_this), false);
            _this.adjustMapToViewport();
        })
            .catch(function (err) {
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
        $(window).bind('beforeunload', function () {
            var obj = _this.map.getCoordinatesAtCenter();
            _this.zoomLvl = _this.map.currentZoom;
            var item = {
                latitude: obj.latitude,
                longitude: obj.longitude,
                zoom: _this.zoomLvl
            };
            window.sessionStorage.setItem("lastMapCoords", JSON.stringify(item));
        });
    }
    Object.defineProperty(MainPage.prototype, "zoomLvl", {
        get: function () {
            return this._zoomLvl;
        },
        set: function (zoom) {
            if (zoom > 20) {
                this._zoomLvl = 20;
            }
            else if (zoom < 2) {
                this._zoomLvl = 2;
            }
            else {
                this._zoomLvl = zoom;
            }
        },
        enumerable: true,
        configurable: true
    });
    MainPage.prototype.HandleTouchStart = function (evt) {
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
    };
    MainPage.prototype.HandleTouchMove = function (evt) {
        if (!this.touchXstart || !this.touchYstart) {
            return;
        }
        var xDiff = evt.touches[0].clientX - this.touchXstart;
        var yDiff = evt.touches[0].clientY - this.touchYstart;
        // checks if single swipe
        if ((Math.abs(xDiff) > this.swipe_threshold) || (Math.abs(yDiff) > this.swipe_threshold)) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff < 0) {
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {
                    this.sideMenu.showMenu(true);
                    this.isSwipeFired = true;
                }
            }
            else {
                if (yDiff < 0) {
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
            }
        }
    };
    MainPage.prototype.HandleTouchEnd = function (evt) {
        if (!this.isSwipeFired) {
            this.sideMenu.showMenu(false);
        }
        this.isSwipeFired = false;
    };
    MainPage.prototype.HandleCanvasTouchStart = function (evt) {
        evt.stopPropagation();
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
        if (evt.touches.length > 1) {
            this.touchXstart_second = evt.touches[1].clientX;
            this.touchYstart_second = evt.touches[1].clientY;
        }
    };
    MainPage.prototype.HandleCanvasTouchMove = function (evt) {
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
    };
    MainPage.prototype.HandleCanvasTouchEnd = function (evt) {
        evt.stopPropagation();
        this.lastTouchPositionX = 0;
        this.lastTouchPositionY = 0;
        var clientX = evt.changedTouches[0].clientX;
        var clientY = evt.changedTouches[0].clientY;
        // Detects touch on single point with certain threshold
        if (Math.pow((clientX - this.touchXstart), 2) + Math.pow((clientY - this.touchYstart), 2) < Math.pow(this.touch_threshold, 2)) {
            var canvas = document.getElementById("mapCanvas");
            var rect = canvas.getBoundingClientRect();
            var x = Math.round((evt.changedTouches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width);
            var y = Math.round((evt.changedTouches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
            this.map.markPlace(x, y);
        }
        this.isSwipeFired = false;
    };
    MainPage.prototype.HandleCanvasWheel = function (evt) {
        evt.preventDefault();
        var canvas = document.getElementById("mapCanvas");
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
    };
    MainPage.prototype.adjustMapToViewport = function () {
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
    };
    return MainPage;
})();
//# sourceMappingURL=MainPage.js.map