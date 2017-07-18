class TopMenu {
    private root: JQuery;
    private mainPage: MainPage;

    constructor(page: MainPage, sideMenu: SideMenu) {
        this.root = $("#topMenu");
        this.mainPage = page;

        $(this.root)
            .append($("<ul>", { "class": "topMenuList" })
                .append($("<li>", { "class": "topMenuItem" })
                    .append($("<img>", {
                        "id": "TopMenuButton",
                        "src": "./Resources/menu.png"
                    }).click((evt) => {
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
                    .append($("<div>", { "class": "breadcrumbList" })
                )));
    }

    public setNavigationPath(nodes: Array<any>) {
        var crumbList = $(this.root).find("> .topMenuList > .topMenuItem > .breadcrumbList").empty();

        for (var i = 0; i < nodes.length; i++)
        {
            var item = $("<a>", { "class": "breadcrumbListItem" }).text(nodes[i]);
            // If node isnt last in trail and it also isnt single one
            // then add click event to go back in crumb trail
            if (!(i == (nodes.length - 1)) || nodes.length == 1) {
                item.click((evt) => {
                    if ($(evt.currentTarget).text().search("Home") >= 0) {
                        this.mainPage.showMap();
                    }
                    else if ($(evt.currentTarget).text().search("Collections") >= 0) {
                        this.mainPage.showPlaces();
                    }
                    else if ($(evt.currentTarget).text().search("Tags") >= 0) {
                        this.mainPage.showPlaces();
                    }
                    else if ($(evt.currentTarget).text().search("Schedules") >= 0) {
                        this.mainPage.showSchedules();
                    }
                }).css({ "text-decoration": "underline" });
            }
            crumbList.append(item);

            if (i < (nodes.length - 1)) {
                crumbList.append($("<span>").text(">"))
            }
        }
    }
}