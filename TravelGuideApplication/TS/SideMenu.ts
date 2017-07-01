class SideMenu {
    public root: JQuery;
    public isAnimationFinished: boolean;
    public isOpen: boolean;

    constructor() {
        this.root = $("#sideMenu").attr("left", "-250px");

        if (this.root == null)
            console.log("Failure: Element with ID \"sideMenu\" not found!")  

        // Selected project
        $(this.root).append($("<div>").css({
            "padding": "1% 5% 0%",
            "color": "#f5fefa",
            "margin": "5% 2%",
            "font-size": "x-large"
        }).html("Project")
            .append($("<div>", { "id": "selectedProject" }).html("Not selected yet")));

        // List
        $(this.root)
            .append($("<ul>", { "id": "sideMenuList"}));

        // List Items
        var names = [ "Projects", "Map", "Schedules", "Collections", "Tags"];
        for (var i = 0; i < names.length; i++) {
            var ul = $("#sideMenuList");
            var li = $("<li>", { "class": "sideMenuButton" })
            var a = $("<a>").css("display", "block")
                .html("<img src=\" " + names[i].toLowerCase() + ".png\">" + names[i])
            a.children()
                .attr("src", "Resources/" + names[i].toLowerCase() + ".png")
                .css({
                    "width": "22px",
                    "height": "22px"
                });
            if (names[i] == "Projects" || names[i] == "Collections" || names[i] == "Tags") {
                a.append($("<img>", {
                    "id": names[i].toLowerCase() + "-more-icon",
                    "src": "./Resources/more.png",
                    })
                    .css({
                        "width": "22px",
                        "height": "22px",
                        "float": "right",
                        "transform": "rotate(90deg)",
                        "padding": "2px 5px"
                    })
                    .fadeIn(1).fadeOut(1)
                )
            }
            ul.append(li.append(a));
        }

        // Create SubMenus
        $(".sideMenuButton > a:contains('Projects')").parent().after($("<ul>", { "id": "projectsSubMenu" }));
        $(".sideMenuButton > a:contains('Collections')").parent().after($("<ul>", { "id": "collectionsSubMenu" }));
        $(".sideMenuButton > a:contains('Tags')").parent().after($("<ul>", { "id": "tagsSubMenu" }));

        // Add Project List Items into projectsSubMenu
        $.getJSON("./Resources/Projects/projects.json", (data) => {
            $("#projectsSubMenu").fadeOut(100);
            if (data.projects.length > 0) {
                $("#projects-more-icon").fadeIn(100);
            }
            for (var i = 0; i < data.projects.length; i++)
            {
                $("#projectsSubMenu").append($("<li>")
                    .html(data.projects[i].name)
                    .on('click', (evt) => {
                        var name = (<HTMLElement>evt.currentTarget).innerHTML;
                        for (var j = 0; j < data.projects.length; j++)
                        {
                            if (data.projects[j].name == name) {
                                this.loadProjectFromJSON(data.projects[j].id);
                                $("#projectsSubMenu").stop(true, true).slideUp(300);
                                $("#projects-more-icon").fadeIn(100);

                                let selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                                selectionObject.currentProjectID = data.projects[j].id;
                                window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                                if (!(window.location.href.indexOf("index.html") >= -1)) {
                                    window.location.reload(false);
                                }
                            }
                        }
                    }));
            } 
        })

        $(".sideMenuButton > a:contains('Map')").parent()
            .on('click', () => {
            window.location.href = "index.html";
        })
        $(".sideMenuButton > a:contains('Schedules')").parent()
            .on('click', () => {
            window.location.href = "schedules.html";
        })

        // Hide button's SubMenu + More marker on button click
        $(".sideMenuButton > a:contains('Projects')").parent()
            .on('click', () => {
            $("#projectsSubMenu").stop(true, true).slideToggle(300, () => {
                $("#projectsSubMenu").css("display") == "none" && $("#projectsSubMenu").children().length > 0 ?
                    $("#projects-more-icon").stop(true, true).fadeIn(100)
                    : $("#projects-more-icon").stop(true, true).fadeOut(100);
            });
        });
        $(".sideMenuButton > a:contains('Collections')").parent()
            .on('click', () => {
                $("#collectionsSubMenu").stop(true, true).slideToggle(300, () => {
                    $("#collectionsSubMenu").css("display") == "none" && $("#collectionsSubMenu").children().length > 0 ?
                    $("#collections-more-icon").stop(true, true).fadeIn(100) 
                    : $("#collections-more-icon").stop(true, true).fadeOut(100);
            });
        });
        $(".sideMenuButton > a:contains('Tags')").parent().on('click', () => {
            $("#tagsSubMenu").stop(true, true).slideToggle(300, () => {
                $("#tagsSubMenu").css("display") == "none" && $("#tagsSubMenu").children().length > 0?
                    $("#tags-more-icon").stop(true, true).fadeIn(100)
                    : $("#tags-more-icon").stop(true, true).fadeOut(100);
            });
        });

        if (window.sessionStorage.getItem("selections") != null) {
            let selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
            if (selectionObject.currentProjectID != null) {
                this.loadProjectFromJSON(selectionObject.currentProjectID);
            }
        }

        if (window.sessionStorage.getItem("selections") == null) {
            let selectionObject = {
                currentProjectID: null,
                currentTag: null,
                currentCollection: null,
                currentSchedule: null
            }
            window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
        }
        
        this.isAnimationFinished = true;
        this.isOpen = false;
    }

    public loadProjectFromJSON(ID: number) {
        $.getJSON("./Resources/Projects/project-" + ID + ".json", (projectData) => {
            window.sessionStorage.setItem("currentProjectID", ID.toString());

            $("#selectedProject").fadeOut(300, () => {
                $("#selectedProject").html(projectData.name).fadeIn(300);
            });

            $("#collections-more-icon").fadeOut(100);
            $("#collectionsSubMenu").stop(true, true).slideUp(300, () => {
                $("#collectionsSubMenu").empty();
                if (projectData.collections != null)
                {
                    for (var j = 0; j < projectData.collections.length; j++) {
                        $("#collectionsSubMenu").append($("<li>", { "style": "" })
                            .html(projectData.collections[j].name)
                            .on("click", (evt: JQueryEventObject) => {
                                evt.preventDefault();
                                var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                                selectionObject.currentCollection = (<HTMLElement>evt.currentTarget).innerHTML;
                                selectionObject.currentTag = null;
                                selectionObject.currentSchedule = null;
                                window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                                window.location.href = "places.html";
                            }));
                    }
                    $("#collectionsSubMenu").slideDown(300, () => {
                        $("#collectionsSubMenu").css({
                            "height": "auto",
                            "overflow": "initial"
                        });
                    });
                    $("#collections-more-icon").fadeOut(100);
                }
            });
            
            $("#tags-more-icon").fadeOut(100);
            $("#tagsSubMenu").stop(true, true).slideUp(300, () => {
                $("#tagsSubMenu").empty();
                if (projectData.labels != null) {
                    for (var j = 0; j < projectData.labels.length; j++)
                    {
                        $("#tagsSubMenu").append($("<li>")
                            .html(projectData.labels[j].name)
                            .on("click", (evt) => {
                                evt.preventDefault();
                                var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                                selectionObject.currentCollection = null;
                                selectionObject.currentSchedule = null;
                                selectionObject.currentTag = (<HTMLElement>evt.currentTarget).innerHTML;
                                window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                                window.location.href = "places.html";
                            }));
                    }
                    $("#tagsSubMenu").slideDown(300, () => {
                        $("#tagsSubMenu").css({
                            "height": "auto",
                            "overflow": "initial"
                        });
                    });
                    $("#tags-more-icon").fadeOut(100);
                }
            });
        });
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