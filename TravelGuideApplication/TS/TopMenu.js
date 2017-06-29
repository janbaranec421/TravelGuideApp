var TopMenu = (function () {
    function TopMenu(sideMenu) {
        this.root = $("#topMenu");
        $(this.root)
            .append($("<ul>", { "class": "topMenuList" })
            .append($("<li>", { "class": "topMenuItem" })
            .append($("<img>", {
            "id": "TopMenuButton",
            "src": "./Resources/menu.png"
        }).click(function (evt) {
            if (sideMenu.isOpen) {
                sideMenu.showMenu(false);
                $("#TopMenuButton").removeClass("box-shadow-highlight");
            }
            else {
                sideMenu.showMenu(true);
                $("#TopMenuButton").addClass("box-shadow-highlight");
            }
        })))
            .append($("<li>", { "class": "topMenuItem" })
            .append($("<div>", { "class": "breadcrumbList" }))));
    }
    TopMenu.prototype.setNavigationPath = function (nodes) {
        var crumbList = $(this.root).find("> .topMenuList > .topMenuItem > .breadcrumbList").empty();
        for (var i = 0; i < nodes.length; i++) {
            (nodes[i].href != null) ? crumbList.append($("<a>", { "class": "breadcrumbListItem", "href": nodes[i].href }).text(nodes[i].txt))
                : crumbList.append($("<a>", { "class": "breadcrumbListItem" }).text(nodes[i].txt));
            if (i < (nodes.length - 1)) {
                crumbList.append($("<span>").text(">"));
            }
        }
    };
    return TopMenu;
})();
//# sourceMappingURL=TopMenu.js.map