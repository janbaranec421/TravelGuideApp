window.onload = () => {
    var placesPage = new PlacesPage();
}

class PlacesPage {
    public topMenu: TopMenu;
    public sideMenu: SideMenu;
    public placesList: PlacesList;

    public selections: any;

    public touchXstart: number;
    public touchYstart: number;

    public swipe_threshold: number = 40;
    public isSwipeFired = false;

    constructor() {
        this.sideMenu = new SideMenu();
        this.topMenu = new TopMenu(this.sideMenu);
        this.placesList = new PlacesList();

        this.selections = JSON.parse(window.sessionStorage.getItem("selections"));
        if (this.selections.currentProjectID) {
            this.sideMenu.loadProjectFromJSON(this.selections.currentProjectID);
        }
        if (this.selections.currentTag) {
            this.placesList.displayPlacesWithTagName(this.selections.currentTag);
            this.topMenu.setNavigationPath([
                { txt: "Home", href: "index.html" },
                { txt: "Tags (" + this.selections.currentTag + ")" } ]);
        }
        else if (this.selections.currentCollection) {
            this.placesList.displayPlacesWithCollectionName(this.selections.currentCollection);
            this.topMenu.setNavigationPath([
                { txt: "Home", href: "index.html" },
                { txt: "Collection ("+this.selections.currentCollection+")" } ]);
        }
        else if (this.selections.currentSchedule) {
            this.placesList.displayPlacesWithScheduleName(this.selections.currentSchedule);
            this.topMenu.setNavigationPath([
                { txt: "Home", href: "index.html" },
                { txt: "Schedules", href: "schedules.html"},
                { txt: this.selections.currentSchedule } ]);
        }
        window.sessionStorage.setItem("selections", JSON.stringify(this.selections));

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