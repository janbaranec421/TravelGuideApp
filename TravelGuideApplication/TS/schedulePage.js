window.onload = function () {
    var tagsPage = new SchedulePage();
};
var SchedulePage = (function () {
    function SchedulePage() {
        this.swipe_threshold = 40;
        this.isSwipeFired = false;
        this.sideMenu = new SideMenu();
        this.topMenu = new TopMenu(this.sideMenu);
        this.scheduleList = new ScheduleList();
        this.scheduleList.addSchedules();
        var pageContent = document.getElementById("pageContent");
        pageContent.addEventListener('touchmove', this.HandleTouchMove.bind(this), false);
        pageContent.addEventListener('touchstart', this.HandleTouchStart.bind(this), false);
        pageContent.addEventListener('touchend', this.HandleTouchEnd.bind(this), false);
    }
    SchedulePage.prototype.HandleTouchStart = function (evt) {
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
    };
    SchedulePage.prototype.HandleTouchMove = function (evt) {
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
    SchedulePage.prototype.HandleTouchEnd = function (evt) {
        if (!this.isSwipeFired) {
            this.sideMenu.showMenu(false);
        }
        this.isSwipeFired = false;
    };
    return SchedulePage;
})();
//# sourceMappingURL=SchedulePage.js.map