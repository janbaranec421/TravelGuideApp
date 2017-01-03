window.onload = function () {
    var app = new App();
};
var App = (function () {
    function App() {
        this.swipe_threshold = 40;
        this.touch_threshold = 10;
        this.isSwipeFired = false;
        // Used to count delta of touch movement on canvas
        this.lastTouchPositionX = 0;
        this.lastTouchPositionY = 0;
        // Ostrava - Poruba
        // 49.828526
        // 18.173270
        // Bratislava - mesto
        // 48.1492400
        // 17.1070000
        this.latitude = 49.828526;
        this.longitude = 18.173270;
        this.zoomLvl = 16;
        this.layers = Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Roads | Layer.Transit | Layer.Landuse;
        this.createTopMenu();
        this.createSideMenu();
        this.createMap();
        var pageContent = document.getElementById("pageContent");
        pageContent.addEventListener('touchmove', this.HandleTouchMove.bind(this), false);
        pageContent.addEventListener('touchstart', this.HandleTouchStart.bind(this), false);
        pageContent.addEventListener('touchend', this.HandleTouchEnd.bind(this), false);
        var sideMenu = document.getElementById("sideMenu");
        sideMenu.addEventListener('touchmove', function (e) { console.log("move"); }, false);
        sideMenu.addEventListener('touchstart', function (e) { e.stopPropagation(); console.log("start"); }, false);
        sideMenu.addEventListener('touchend', function (e) { e.stopPropagation(); console.log("end"); }, false);
        window.addEventListener('resize', this.adjustCanvasToViewport, false);
        this.adjustCanvasToViewport();
        var canvas = document.getElementById("mapCanvas");
        canvas.addEventListener('wheel', this.HandleCanvasWheel.bind(this));
        canvas.addEventListener('touchmove', this.HandleCanvasTouchMove.bind(this), false);
        canvas.addEventListener('touchstart', this.HandleCanvasTouchStart.bind(this), false);
        canvas.addEventListener('touchend', this.HandleCanvasTouchEnd.bind(this), false);
        this.map.display(this.latitude, this.longitude, this.zoomLvl, this.layers);
    }
    App.prototype.createTopMenu = function () {
        var _this = this;
        var root = document.getElementById("topMenu");
        var items = new Array();
        if (root == null)
            console.log("Failure: Element with ID \"topMenu\" not found!");
        for (var i = 0; i < 5; i++) {
            // Create item for list
            var listItem = document.createElement("li");
            var item = document.createElement("button");
            item.setAttribute("class", "topMenuButton");
            item.innerHTML = "Button N." + i.toString();
            item.addEventListener('click', function () {
                if (_this.sideMenu.isOpen)
                    _this.sideMenu.showMenu(false);
                else
                    _this.sideMenu.showMenu(true);
            });
            // Insert into list
            listItem.appendChild(item);
            items.push(listItem);
        }
        this.topMenu = new TopMenu(root, items);
    };
    App.prototype.createSideMenu = function () {
        var root = document.getElementById("sideMenu");
        var items = new Array();
        if (root == null)
            console.log("Failure: Element with ID \"sideMenu\" not found!");
        // Avatar
        var avatarDiv = document.createElement("div");
        var avatar = document.createElement("img");
        avatar.setAttribute("id", "avatar");
        avatar.src = "Resources/avatar.jpg";
        avatarDiv.appendChild(avatar);
        root.appendChild(avatarDiv);
        // List of Buttons
        for (var i = 0; i < 10; i++) {
            // Create item for list
            var item = document.createElement("li");
            item.setAttribute("class", "sideMenuButton");
            item.addEventListener("click", function () {
                alert("Clicked on sideMenu button ");
            });
            // Icon for created item
            var icon = document.createElement("img");
            icon.style.padding = "5%";
            // Anchor for created item
            var anchor = document.createElement("a");
            anchor.innerHTML = "Button N." + (i + 1).toString();
            // Insert into item
            item.appendChild(icon);
            item.appendChild(anchor);
            // Insert into list
            items.push(item);
        }
        this.sideMenu = new SideMenu(root, items);
    };
    App.prototype.createMap = function () {
        var root = document.getElementById("map");
        if (root == null)
            console.log("Failure: Element with ID \"map\" not found!");
        this.map = new Map(root);
    };
    App.prototype.HandleTouchStart = function (evt) {
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
    };
    App.prototype.HandleTouchMove = function (evt) {
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
    App.prototype.HandleTouchEnd = function (evt) {
        if (!this.isSwipeFired) {
            this.sideMenu.showMenu(false);
        }
        this.isSwipeFired = false;
    };
    App.prototype.HandleCanvasTouchStart = function (evt) {
        evt.stopPropagation();
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
        if (evt.touches.length > 1) {
            this.touchXstart_second = evt.touches[1].clientX;
            this.touchYstart_second = evt.touches[1].clientY;
        }
    };
    App.prototype.HandleCanvasTouchMove = function (evt) {
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
            // Horizontal double swipe
            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff_second) > Math.abs(yDiff_second)) {
                if (xDiff > this.swipe_threshold && xDiff_second < -this.swipe_threshold && this.touchXstart < this.touchXstart_second) {
                    this.map.display(this.latitude, this.longitude, --this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
                if (xDiff < -this.swipe_threshold && xDiff_second > this.swipe_threshold && this.touchXstart > this.touchXstart_second) {
                    this.map.display(this.latitude, this.longitude, --this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
                if (xDiff < -this.swipe_threshold && xDiff_second > this.swipe_threshold && this.touchXstart < this.touchXstart_second) {
                    this.map.display(this.latitude, this.longitude, ++this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
                if (xDiff > this.swipe_threshold && xDiff_second < -this.swipe_threshold && this.touchXstart > this.touchXstart_second) {
                    this.map.display(this.latitude, this.longitude, ++this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
            }
            else if (Math.abs(yDiff) > Math.abs(xDiff) && Math.abs(yDiff_second) > Math.abs(xDiff_second)) {
                if (yDiff > this.swipe_threshold && yDiff_second < -this.swipe_threshold && this.touchYstart < this.touchYstart_second) {
                    this.map.display(this.latitude, this.longitude, --this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
                if (yDiff < -this.swipe_threshold && yDiff_second > this.swipe_threshold && this.touchYstart > this.touchYstart_second) {
                    this.map.display(this.latitude, this.longitude, --this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
                if (yDiff < -this.swipe_threshold && yDiff_second > this.swipe_threshold && this.touchYstart < this.touchYstart_second) {
                    this.map.display(this.latitude, this.longitude, ++this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
                if (yDiff > this.swipe_threshold && yDiff_second < -this.swipe_threshold && this.touchYstart > this.touchYstart_second) {
                    this.map.display(this.latitude, this.longitude, ++this.zoomLvl, this.layers);
                    this.isSwipeFired = true;
                }
            }
        }
        /*
        // checks if single swipe
        else if ((Math.abs(xDiff) > this.swipe_threshold) || (Math.abs(yDiff) > this.swipe_threshold)) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff < 0) {  // Left swipe
                    console.log("LEFT swipe on canvas");
                    this.isSwipeFired = true;
                }
                else {            // Right swipe
                    console.log("RIGHT swipe on canvas");
                    this.isSwipeFired = true;
                }
            }
            else {
                if (yDiff < 0) {  // Up swipe
                    console.log("UP swipe on canvas");
                    this.isSwipeFired = true;
                }
                else {            // Down swipe
                    console.log("DOWN swipe on canvas");
                    this.isSwipeFired = true;
                }
            }
        }
        */
    };
    App.prototype.HandleCanvasTouchEnd = function (evt) {
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
            // this.map.markMap_by_xy(x, y);
            this.map.markMapByTouch(x, y);
        }
        this.isSwipeFired = false;
    };
    App.prototype.HandleCanvasWheel = function (evt) {
        evt.preventDefault();
        if (evt.deltaY > 0)
            this.map.display(this.latitude, this.longitude, --this.zoomLvl, this.layers);
        else
            this.map.display(this.latitude, this.longitude, ++this.zoomLvl, this.layers);
    };
    App.prototype.adjustCanvasToViewport = function () {
        if ($(window).width() > $(window).height()) {
            $("#mapCanvas").css("height", "75vh")
                .css("width", "");
        }
        else {
            $("#mapCanvas").css("width", "75vw")
                .css("height", "");
        }
    };
    return App;
})();
//# sourceMappingURL=app.js.map