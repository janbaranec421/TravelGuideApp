class SideMenu {
    public root: JQuery;
    public isAnimationFinished: boolean;
    public isOpen: boolean;

    public projects: any[];

    constructor() {
        this.root = $("#sideMenu").attr("left", "-250px");

        if (this.root == null)
            console.log("Failure: Element with ID \"sideMenu\" not found!")  
        // Avatar
        $(this.root).append($("<div>"));
        var img =$("<img>", {
            "id": "avatar",
            "src": "Resources/avatar.jpg"
        })
        img.appendTo(this.root);

        // List
        $(this.root)
            .append($("<ul>").css({
                "listStyleType": "none",
                "color": "mintcream",
                "marginLeft": "-15%",
                "marginRight": "2%"
            }));

        // List Items
        var names = ["Map", "Schedules", "Collections", "Tags"];
        for (var i = 0; i < names.length; i++) {
            var ul = $("#sideMenu > ul");
            var li = $("<li>", { "class": "sideMenuButton" })
            var a = $("<a>").css("display", "block")
                .html("<img src=\" " + names[i].toLowerCase() + ".png\">" + names[i])

            var img = a.children()
                        .attr("src", "Resources/" + names[i].toLowerCase() + ".png")
                        .css({ "width": "24px",
                               "height": "24px"
                });

            ul.append(li.append(a));
        }

        this.isAnimationFinished = true;
        this.isOpen = false;
    }

    public loadProjectFromJSON(ID: number) {
        window.sessionStorage.setItem("projectID", ID.toString());

        $.getJSON("../Resources/project-" + ID + ".json", (projectData) => {
            // Create Collections List 
            var subList = $("<ul>", { "id": "collectionsSubMenu" });
            for (var j = 0; j < projectData.collections.length; j++) {
                $(subList).append($("<li>")
                    .html(projectData.collections[j].name)
                    .on("click", (evt: JQueryEventObject) => {
                        evt.preventDefault();
                        var html = <HTMLElement>evt.currentTarget;
                        window.sessionStorage.setItem("selectedCollection", html.innerHTML);
                        window.location.href = "collections.html";
                    }));
            }
            $("#sideMenu > ul > li > a:contains('Collections')").parent().after(subList);

            // Create Tags List 
            subList = $("<ul>", { "id": "tagsSubMenu" });
            for (var j = 0; j < projectData.labels.length; j++) {
                $(subList).append($("<li>")
                    .html(projectData.labels[j].name)
                    .on("click", (evt) => {
                        evt.preventDefault();
                        var html = <HTMLElement>evt.currentTarget;
                        window.sessionStorage.setItem("selectedTag", html.innerHTML);
                        window.location.href = "tags.html";
                    }));
            }
            $("#sideMenu > ul > li > a:contains('Tags')").parent().after(subList);
        });


        var listItem = $("#sideMenu > ul > li > ");
        // Click on listitem which dont have submenu closes all others submenu
        listItem.filter("a:contains('Map')")
            .click(() => {  window.location.href = "index.html"; })
            .parent().click(() => {
            $("#sideMenu > ul > ul").stop(true, true).slideUp(300);
        })
        listItem.filter("a:contains('Schedules')")
            .click(() => { window.location.href = "schedules.html"; })
            .parent().click(() => {
            $("#sideMenu > ul > ul").stop(true, true).slideUp(300);

        })
        // [Open/Close] submenu for Collections
        listItem.filter("a:contains('Collections')").parent().click(() => {
            $("#collectionsSubMenu").stop(true, true).slideToggle(300);
        })
        // [Open/Close] submenu for Tags
        listItem.filter("a:contains('Tags')").parent().click(() => {
            $("#tagsSubMenu").stop(true, true).slideToggle(300);
        })
    }

    public isOpened()
    {
        return this.isOpen;
    }

    public showMenu(openMenu: boolean) {
        if (this.isAnimationFinished)
        {
            this.isAnimationFinished = false;

            if (openMenu && !this.isOpen) {
                $("#sideMenu").animate({ left: '+=250px' }, 400, () => {
                    this.isAnimationFinished = true;
                    this.isOpen = true;
                });
            }
            else if (!openMenu && this.isOpen) {
                $("#sideMenu").animate({ left: '-=250px' }, 400, () => {
                    this.isAnimationFinished = true;
                    this.isOpen = false;
                });
            }
            else
            {
                this.isAnimationFinished = true;
            }
        }
    }
}