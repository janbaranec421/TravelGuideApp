var SideMenu = (function () {
    function SideMenu(root, items) {
        this.root = root;
        this.items = items;
        var list = document.createElement("ul");
        list.style.listStyleType = "none";
        list.style.color = "mintcream";
        for (var i = 0; i < items.length; i++) {
            list.appendChild(items[i]);
        }
        root.appendChild(list);
    }
    return SideMenu;
})();
//# sourceMappingURL=SideMenu.js.map