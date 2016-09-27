var topMenu: TopMenu;
var sideMenu: SideMenu;
var map: Map;

var touchXstart;
var touchYstart;

var data;
var Bbox;

var zoomLvl = 2;

window.onload = () => {

    // Sidemenu needs to be created before TopMenu, due to TopMenu usage of function sideMenu.show by buttons
    createSideMenu();
    createTopMenu();
    createMap();

    document.addEventListener('touchmove', HandleTouchMove, false);
    document.addEventListener('touchstart', HandleTouchStart, false);
    document.addEventListener('touchend', HandleTouchEnd, false);

    var canvas = document.getElementById("mapCanvas");
    canvas.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) {
            //scroll down
            map.clear();
            map.display(18.314466, 49.866538, --zoomLvl, Layer.Earth);
        }else {
            //scroll up
            map.clear();
            map.display(18.314466, 49.866538, ++zoomLvl, Layer.Earth);
        }

        //prevent page fom scrolling
        return false;
    });

    //console.log(map.long2tileX(17.838396, 18));
    //console.log(map.lat2tileY(48.552492, 18));

    map.display(18.314466, 49.866538, zoomLvl, Layer.Earth);
};

function createTopMenu()
{
    var root = document.getElementById("topMenu");
    var items = new Array();

    if (root == null)
        console.log("Failure: Element with ID \"topMenu\" not found!")

    for (var i = 0; i < 5; i++) {   
        // Create item for list
        var item = document.createElement("button");
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

    //console.log("touchstart X: " + Math.round(touchXstart) + ", Y: " + Math.round(touchYstart));
    
}

function HandleTouchEnd(evt)
{
    //console.log("touchend");
    sideMenu.showMenu(false);
}
