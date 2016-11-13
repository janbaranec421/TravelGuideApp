var topMenu;
var sideMenu;
var map;
var touchXstart;
var touchYstart;
var touchXstart_second;
var touchYstart_second;
var data;
var Bbox;
var zoomLvl = 14;
window.onload = function () {
    createSideMenu();
    createTopMenu();
    createMap();
    document.addEventListener('touchmove', HandleTouchMove, false);
    document.addEventListener('touchstart', HandleTouchStart, false);
    document.addEventListener('touchend', HandleTouchEnd, false);
    var canvas = document.getElementById("mapCanvas");
    canvas.addEventListener('wheel', function (e) {
        if (e.deltaY > 0) {
            //scroll down 
            map.display(18.173270, 49.828526, --zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
        }
        else {
            //scroll up
            map.display(18.173270, 49.828526, ++zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
        }
    });
    map.display(18.173270, 49.828526, zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
};
function createTopMenu() {
    var root = document.getElementById("topMenu");
    var items = new Array();
    if (root == null)
        console.log("Failure: Element with ID \"topMenu\" not found!");
    for (var i = 0; i < 5; i++) {
        // Create item for list
        var item = document.createElement("button");
        item.setAttribute("class", "topMenuButton");
        item.innerHTML = "Button N." + i.toString();
        item.addEventListener('click', function () {
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
function createSideMenu() {
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
function createMap() {
    var root = document.getElementById("map");
    if (root == null)
        console.log("Failure: Element with ID \"map\" not found!");
    map = new Map(root);
}
function HandleTouchMove(evt) {
    if (!touchXstart || !touchYstart) {
        return;
    }
    var xDiff = evt.touches[0].clientX - touchXstart;
    var yDiff = evt.touches[0].clientY - touchYstart;
    // checks if doubleswipe 
    if (evt.touches.length > 1) {
        var xDiff_second = evt.touches[1].clientX - touchXstart_second;
        var yDiff_second = evt.touches[1].clientY - touchYstart_second;
        // Horizontal double swipe
        if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff_second) > Math.abs(yDiff_second)) {
            // Checks if swipes are more than 50px long
            if (xDiff > 25 && xDiff_second < -25 && touchXstart < touchXstart_second) {
                map.display(18.173270, 49.828526, ++zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
            if (xDiff < -25 && xDiff_second > 25 && touchXstart > touchXstart_second) {
                map.display(18.173270, 49.828526, ++zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
            if (xDiff < -25 && xDiff_second > 25 && touchXstart < touchXstart_second) {
                map.display(18.173270, 49.828526, --zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
            if (xDiff > 25 && xDiff_second < -25 && touchXstart > touchXstart_second) {
                map.display(18.173270, 49.828526, --zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
        }
        else if (Math.abs(yDiff) > Math.abs(xDiff) && Math.abs(yDiff_second) > Math.abs(xDiff_second)) {
            // Checks if swipes are more than 50px long
            if (yDiff > 25 && yDiff_second < -25 && touchYstart < touchYstart_second) {
                map.display(18.173270, 49.828526, ++zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
            if (yDiff < -25 && yDiff_second > 25 && touchYstart > touchYstart_second) {
                map.display(18.173270, 49.828526, ++zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
            if (yDiff < -25 && yDiff_second > 25 && touchYstart < touchYstart_second) {
                map.display(18.173270, 49.828526, --zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
            if (yDiff > 25 && yDiff_second < -25 && touchYstart > touchYstart_second) {
                map.display(18.173270, 49.828526, --zoomLvl, Layer.Water | Layer.Earth | Layer.Boundaries | Layer.Buildings | Layer.Landuse | Layer.Roads | Layer.Transit);
            }
        }
    }
    else if ((Math.abs(xDiff) > 50) || (Math.abs(yDiff) > 50)) {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff < 0) {
                sideMenu.showMenu(false);
            }
            else {
                sideMenu.showMenu(true);
            }
        }
        else {
            if (yDiff < 0) {
                sideMenu.showMenu(false);
            }
            else {
                sideMenu.showMenu(false);
            }
        }
    }
}
function HandleTouchStart(evt) {
    touchXstart = evt.touches[0].clientX;
    touchYstart = evt.touches[0].clientY;
    if (evt.touches.length > 1) {
        touchXstart_second = evt.touches[1].clientX;
        touchYstart_second = evt.touches[1].clientY;
    }
}
function HandleTouchEnd(evt) {
    sideMenu.showMenu(false);
}
//# sourceMappingURL=app.js.map