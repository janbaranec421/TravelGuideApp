var sideMenu;
window.onload = function () {
    createSideMenu();
};
function createSideMenu() {
    var root = document.getElementById("sideMenu");
    var items = new Array();
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
//# sourceMappingURL=app.js.map