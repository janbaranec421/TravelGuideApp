var TopMenu = (function () {
    function TopMenu(sideMenu) {
        this.root = $("#topMenu");
        $(this.root)
            .append($("<ul>").attr("id", "topMenuList"));
        $("#topMenu > ul")
            .append($("<li>")
            .append($("<a>", {
            "class": "topMenuButton",
            "href": "index.html"
        })
            .html("Map")));
        $("#topMenu > ul")
            .append($("<li>")
            .append($("<a>", {
            "class": "topMenuButton",
        })
            .html("Menu")
            .on("click", function () {
            sideMenu.isOpen ? sideMenu.showMenu(false) : sideMenu.showMenu(true);
        })));
    }
    return TopMenu;
}());
//# sourceMappingURL=TopMenu.js.map