var SideMenu = (function () {
    function SideMenu(root, items) {
        this.root = root;
        this.items = items;
        var list = document.createElement("ul");
        list.style.listStyleType = "none";
        list.style.color = "mintcream";
        list.style.marginLeft = "-15%";
        list.style.marginRight = "2%";
        for (var i = 0; i < items.length; i++) {
            list.appendChild(items[i]);
        }
        this.isAnimationFinished = true;
        this.isOpen = false;
        this.root.style.left = "-250px";
        this.root.appendChild(list);
    }
    SideMenu.prototype.isOpened = function () {
        return this.isOpen;
    };
    SideMenu.prototype.showMenu = function (openMenu) {
        var _this = this;
        if (this.isAnimationFinished) {
            this.isAnimationFinished = false;
            if (openMenu && !this.isOpen) {
                $("#sideMenu").animate({ left: '+=250px' }, 400, function () {
                    _this.isAnimationFinished = true;
                    _this.isOpen = true;
                });
            }
            else if (!openMenu && this.isOpen) {
                $("#sideMenu").animate({ left: '-=250px' }, 400, function () {
                    _this.isAnimationFinished = true;
                    _this.isOpen = false;
                });
            }
            else {
                this.isAnimationFinished = true;
            }
        }
    };
    return SideMenu;
})();
//# sourceMappingURL=SideMenu.js.map