var TopMenu = (function () {
    function TopMenu(sideMenu) {
        this.root = $("#topMenu");
        $(this.root)
            .append($("<ul>").attr("id", "topMenuList"));
        for (var i = 0; i < 5; i++) {
            $("#topMenu > ul")
                .append($("<li>")
                .append($("<button>")
                .attr("class", "topMenuButton")
                .html("Button N." + i.toString())
                .on("click", function () {
                sideMenu.isOpen ? sideMenu.showMenu(false) : sideMenu.showMenu(true);
            })));
        }
    }
    return TopMenu;
})();
//# sourceMappingURL=TopMenu.js.map