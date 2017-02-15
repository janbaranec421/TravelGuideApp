window.onload = function () {
    var tagsPage = new TagsPage();
};
var TagsPage = (function () {
    function TagsPage() {
        this.swipe_threshold = 40;
        this.isSwipeFired = false;
        this.selectedTag = window.sessionStorage.getItem("selectedTag");
        console.log(this.selectedTag);
        this.sideMenu = new SideMenu();
        this.topMenu = new TopMenu(this.sideMenu);
        this.placesList = new PlacesList();
        this.placesList.addPlacesWithTagName(this.selectedTag);
        this.sideMenu.loadProjectFromJSON(1);
        var pageContent = document.getElementById("pageContent");
        pageContent.addEventListener('touchmove', this.HandleTouchMove.bind(this), false);
        pageContent.addEventListener('touchstart', this.HandleTouchStart.bind(this), false);
        pageContent.addEventListener('touchend', this.HandleTouchEnd.bind(this), false);
    }
    TagsPage.prototype.HandleTouchStart = function (evt) {
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
    };
    TagsPage.prototype.HandleTouchMove = function (evt) {
        if (!this.touchXstart || !this.touchYstart) {
            return;
        }
        var xDiff = evt.touches[0].clientX - this.touchXstart;
        var yDiff = evt.touches[0].clientY - this.touchYstart;
        // checks if single swipe
        if ((Math.abs(xDiff) > this.swipe_threshold) || (Math.abs(yDiff) > this.swipe_threshold)) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff < 0) {
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {
                    this.sideMenu.showMenu(true);
                    this.isSwipeFired = true;
                }
            }
            else {
                if (yDiff < 0) {
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
            }
        }
    };
    TagsPage.prototype.HandleTouchEnd = function (evt) {
        if (!this.isSwipeFired) {
            this.sideMenu.showMenu(false);
        }
        this.isSwipeFired = false;
    };
    return TagsPage;
})();
//# sourceMappingURL=tagsPage.js.map