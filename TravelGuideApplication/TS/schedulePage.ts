window.onload = () => {
    var tagsPage = new SchedulePage();
}

class SchedulePage {
    public topMenu: TopMenu;
    public sideMenu: SideMenu;
    public scheduleList: ScheduleList;

    public selectedTag: string;

    public touchXstart: number;
    public touchYstart: number;

    public swipe_threshold: number = 40;
    public isSwipeFired = false;

    constructor() {
        this.sideMenu = new SideMenu();
        this.topMenu = new TopMenu(this.sideMenu);
        this.scheduleList = new ScheduleList();
        this.scheduleList.addSchedules();

        //this.sideMenu.loadProjectFromJSON(1);

        var pageContent = document.getElementById("pageContent");
        pageContent.addEventListener('touchmove', this.HandleTouchMove.bind(this), false);
        pageContent.addEventListener('touchstart', this.HandleTouchStart.bind(this), false);
        pageContent.addEventListener('touchend', this.HandleTouchEnd.bind(this), false);
    }

    private HandleTouchStart(evt): void {
        this.touchXstart = evt.touches[0].clientX;
        this.touchYstart = evt.touches[0].clientY;
    }

    private HandleTouchMove(evt): void {
        if (!this.touchXstart || !this.touchYstart) {
            return;
        }
        var xDiff = evt.touches[0].clientX - this.touchXstart;
        var yDiff = evt.touches[0].clientY - this.touchYstart;

        // checks if single swipe
        if ((Math.abs(xDiff) > this.swipe_threshold) || (Math.abs(yDiff) > this.swipe_threshold)) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff < 0) {  // Left swipe
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {            // Right swipe
                    this.sideMenu.showMenu(true);
                    this.isSwipeFired = true;
                }
            }
            else {
                if (yDiff < 0) {  // Up swipe
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
                else {            // Down swipe
                    this.sideMenu.showMenu(false);
                    this.isSwipeFired = true;
                }
            }
        }
    }

    private HandleTouchEnd(evt): void {
        if (!this.isSwipeFired) {
            this.sideMenu.showMenu(false);
        }
        this.isSwipeFired = false;
    }
}