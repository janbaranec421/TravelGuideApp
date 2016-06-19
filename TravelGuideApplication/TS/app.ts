var topMenu: TopMenu;
var sideMenu: SideMenu;
var map: Map;

var touchXstart;
var touchYstart;


window.onload = () => {

    // Sidemenu needs to be created before TopMenu, due to TopMenu usage of function sideMenu.show by buttons
    createSideMenu();
    createTopMenu();
    createMap();

    document.addEventListener('touchmove', HandleTouchMove, false);
    document.addEventListener('touchstart', HandleTouchStart, false);
    document.addEventListener('touchend', HandleTouchEnd, false);
};

function createTopMenu()
{
    var root = document.getElementById("topMenu");
    var items = new Array();

    if (root == null)
        console.log("Failure: Element with ID \"topMenu\" not found!")

    for (var i = 0; i < 5; i++) {   
        // Create item for list
        var item = document.createElement("li");
        item.setAttribute("class", "topMenuButton");
        item.innerHTML = "Button N." + i.toString();
        item.addEventListener('click', () => {
            if (sideMenu.isOpen)
                sideMenu.showMenu(false);
            else
                sideMenu.showMenu(true);
        });

        // Insert into list
        items.push(item);
    }

    topMenu = new TopMenu(root, items);
}

function createSideMenu()
{
    var root = document.getElementById("sideMenu");
    var items = new Array();

    if (root == null)
        console.log("Failure: Element with ID \"sideMenu\" not found!")

    // Avatar
    var avatarDiv = document.createElement("div");
    var avatar = document.createElement("img");
    avatar.setAttribute("id", "avatar");
    avatar.src = "Resources/avatar.jpg";
    avatarDiv.appendChild(avatar);
    root.appendChild(avatarDiv);

    // List of Buttons
    for (var i=0; i < 10; i++)
    {   
        // Create item for list
        var item = document.createElement("li");
        item.setAttribute("class", "sideMenuButton");
        item.addEventListener("click", () => {
            alert("Clicked on sideMenu button ");
        })
        
        // Icon for created item
        var icon = document.createElement("i");
        icon.className = "fa fa-map-o";
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

    sideMenu = new SideMenu(root, items);
}

function createMap()
{
    var root = document.getElementById("map");

    if (root == null)
        console.log("Failure: Element with ID \"map\" not found!")

    map = new Map(root);
}

function HandleTouchMove(evt) {
    var rectangle = document.getElementById("sideMenu").getBoundingClientRect();

    if (!touchXstart || !touchYstart) {
        return;
    }

    var touchXend = evt.touches[0].clientX;
    var touchYend = evt.touches[0].clientY;

    console.log("touch move X: " + Math.round(touchXend) + " , Y: " + Math.round(touchYend));

    var xDiff = touchXend - touchXstart;
    var yDiff = touchYend - touchYstart;

    // Swipe is touchmove more than 100 points long
    if ((Math.abs(xDiff) > 100) || (Math.abs(yDiff) > 100))
    {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff < 0) {  // Left swipe
                sideMenu.showMenu(false);
            }
            else {            // Right swipe
                sideMenu.showMenu(true);
            }
        }
        else {
            if (yDiff < 0) {  // Up swipe
                sideMenu.showMenu(false);
            }
            else {            // Down swipe
                sideMenu.showMenu(false);
            }
        }

        touchXstart = null;
        touchYstart = null;
    }
}

function HandleTouchStart(evt)
{
    touchXstart = evt.touches[0].clientX;
    touchYstart = evt.touches[0].clientY;

    console.log("touchstart X: " + Math.round(touchXstart) + ", Y: " + Math.round(touchYstart));
    
}

function HandleTouchEnd(evt)
{
    console.log("touchend");
    sideMenu.showMenu(false);
}

function getBoundingBox(data) {
    var coords, point, latitude, longitude;
    var bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };

    // We want to use the “features” key of the FeatureCollection (see above)
    data = data.features;

    // Loop through each “feature”
    for (var i = 0; i < data.length; i++) {

        // …and for each coordinate…
        for (var j = 0; j < data[i].geometry.coordinates.length; j++) {
            longitude = data[i].geometry.coordinates[j][0];
            latitude = data[i].geometry.coordinates[j][1];
            
            // Update the bounds recursively by comparing the current
            // xMin/xMax and yMin/yMax with the coordinate
            // we're currently checking
            bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
            bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
            bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
            bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
        }

    }

    // Returns an object that contains the bounds of this GeoJSON
    // data. The keys of this object describe a box formed by the
    // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
    return bounds;
}

function DrawMap(width, height, bounds, data) {
    var context, point, latitude, longitude, xScale, yScale, scale;

    var canvas = <HTMLCanvasElement>document.getElementById("mapCanvas");
    context = canvas.getContext('2d');
    context.strokeStyle = '#9C9A9A';

    // Determine how much to scale our coordinates by
    xScale = width / Math.abs(bounds.xMax - bounds.xMin);
    yScale = height / Math.abs(bounds.yMax - bounds.yMin);
    scale = xScale < yScale ? xScale : yScale;

    data = data.features;

    for (var i = 0; i < data.length; i++) {

        // for each coordinate…
        for (var j = 0; j < data[i].geometry.coordinates.length; j++) {
            longitude = data[i].geometry.coordinates[j][0];
            latitude = data[i].geometry.coordinates[j][1];

            point = MercatorProjection(longitude, latitude);
            // Scale the points of the coordinate
            // to fit inside bounding box
            point = {
                x: (longitude - bounds.xMin) * scale,
                y: (bounds.yMax - latitude) * scale
            };

            // If this is the first coordinate in a shape, start a new path
            if (j === 0) {
                context.beginPath();
                context.moveTo(point.x, point.y);

                // Otherwise just keep drawing
            } else {
                context.lineTo(point.x, point.y);
            }
        }

        // Fill the path we just finished drawing with color
        context.stroke();
    }
}

function MercatorProjection(longitude, latitude) {
    var radius = 6378137;
    var max = 85.0511287798;
    var radians = Math.PI / 180;
    var point = { x: 0, y: 0 };

    point.x = radius * longitude * radians;
    point.y = Math.max(Math.min(max, latitude), -max) * radians;
    point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

    return point;
}