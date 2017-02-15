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
        $(this.root).append($("<div>")
            .append($("<img>", {
                "id": "avatar",
                "src": "Resources/avatar.jpg"
            })));

        // Selected project
        $(this.root).append($("<div>").css({
            "border-bottom": "2px solid #2f2f2f",
            "padding": "2%",
            "color": "#e0e0c6"
        }).html("Current project:")
            .append($("<div>", { "id": "selectedProject" }).html("Project not selected yet")));

        // List
        $(this.root)
            .append($("<ul>", { "id": "sideMenuList"}).css({
                "listStyleType": "none",
                "color": "mintcream",
                "marginLeft": "-15%",
                "marginRight": "2%"
            }));

        // List Items
        var names = [ "Projects", "Map", "Schedules", "Collections", "Tags"];
        for (var i = 0; i < names.length; i++) {
            var ul = $("#sideMenuList");
            var li = $("<li>", { "class": "sideMenuButton" })
            var a = $("<a>").css("display", "block")
                .html("<img src=\" " + names[i].toLowerCase() + ".png\">" + names[i])

            var img = a.children()
                .attr("src", "Resources/" + names[i].toLowerCase() + ".png")
                .css({
                    "width": "24px",
                    "height": "24px"
                });
            ul.append(li.append(a));
        }

        $(".sideMenuButton > a:contains('Projects')").parent().after($("<ul>", { "id": "projectsSubMenu" }));

        // Add Project List Items into projectsSubMenu
        $.getJSON("./Resources/Projects/projects.json", (data) => {
            for (var i = 0; i < data.projects.length; i++) {
                $("#projectsSubMenu").append($("<li>")
                    .html(data.projects[i].name)
                    .on('click', (evt) => {
                        var name = (<HTMLElement>evt.currentTarget).innerHTML;
                        for (var j = 0; j < data.projects.length; j++)
                        {
                            if (data.projects[j].name == name)
                            {
                                this.loadProjectFromJSON(data.projects[j].id);
                                $("#projectsSubMenu").stop(true, true).slideUp(300);
                            }
                        }
                    }));
            }            
        })
        // Create SubMenus
        $(".sideMenuButton > a:contains('Collections')").parent().after($("<ul>", { "id": "collectionsSubMenu" }));
        $(".sideMenuButton > a:contains('Tags')").parent().after($("<ul>", { "id": "tagsSubMenu" }));

        // Hide Submenus on clicking Map and Schedule buttons
        $(".sideMenuButton > a:contains('Map')").parent().on('click', () => {
            $("#sideMenuList > ul").stop(true, true).slideUp(300);
            window.location.href = "index.html";
        })
        $(".sideMenuButton > a:contains('Schedules')").parent().on('click', () => {
            $("#sideMenuList > ul").stop(true, true).slideUp(300);
            window.location.href = "schedules.html";
        })

        // Hide button's SubMenu on button click
        $(".sideMenuButton > a:contains('Projects')").parent().on('click', () => { $("#projectsSubMenu").stop(true, true).slideToggle(300); })
        $(".sideMenuButton > a:contains('Collections')").parent().on('click', () => { $("#collectionsSubMenu").stop(true, true).slideToggle(300); })
        $(".sideMenuButton > a:contains('Tags')").parent().on('click', () => { $("#tagsSubMenu").stop(true, true).slideToggle(300); })

        if (window.sessionStorage.getItem("projectID") != null) {
            this.loadProjectFromJSON(window.sessionStorage.getItem("projectID"));
        }

        if (window.sessionStorage.getItem("selections") == null) {
            var selectionObject = {
                selectedTag: false,
                selectedCollection: false,
                selectedSchedule: false,
                selectedTagValue: null,
                selectedCollectionValue: null,
                selectedScheduleValue: null
            }
            window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
        }
        
        this.isAnimationFinished = true;
        this.isOpen = false;
    }

    public loadProjectFromJSON(ID: number) {
        $.getJSON("../Resources/Projects/project-" + ID + ".json", (projectData) => {
            window.sessionStorage.setItem("projectID", ID.toString());

            $("#selectedProject").fadeOut(300, () => {
                $("#selectedProject").html(projectData.name).fadeIn(300);
            });

            $("#collectionsSubMenu").stop(true, true).slideUp(300, () => {
                $("#collectionsSubMenu").empty();
                if (projectData.collections != null) {
                    for (var j = 0; j < projectData.collections.length; j++) {
                        $("#collectionsSubMenu").append($("<li>")
                            .html(projectData.collections[j].name)
                            .on("click", (evt: JQueryEventObject) => {
                                evt.preventDefault();
                                var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                                selectionObject.selectedCollection = true;
                                selectionObject.selectedCollectionValue = (<HTMLElement>evt.currentTarget).innerHTML;
                                window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                                window.location.href = "places.html";
                            }));
                    }
                    $("#collectionsSubMenu").slideDown(300);
                }
            });
            
            $("#tagsSubMenu").stop(true, true).slideUp(300, () => {
                $("#tagsSubMenu").empty();
                if (projectData.labels != null) {
                    for (var j = 0; j < projectData.labels.length; j++) {
                        $("#tagsSubMenu").append($("<li>")
                            .html(projectData.labels[j].name)
                            .on("click", (evt) => {
                                evt.preventDefault();
                                var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                                selectionObject.selectedTag = true;
                                selectionObject.selectedTagValue = (<HTMLElement>evt.currentTarget).innerHTML;
                                window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                                window.location.href = "places.html";
                            }));
                    }
                    $("#tagsSubMenu").slideDown(300);
                }
            });
        });
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