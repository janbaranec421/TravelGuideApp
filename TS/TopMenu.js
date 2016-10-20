var TopMenu = (function () {
    function TopMenu(root, items) {
        this.root = root;
        this.items = items;
        var list = document.createElement("ul");
        list.setAttribute("id", "topMenuList");
        for (var i = 0; i < items.length; i++) {
            list.appendChild(items[i]);
        }
        root.appendChild(list);
    }
    return TopMenu;
})();
//# sourceMappingURL=TopMenu.js.map