class PlacesList {
    private root: JQuery

    constructor() {
        this.root = $("#placesList");

        $(this.root)
            .append($("<div>", { "id": "placesListHeader" }).html("List of places")
                .append($("<div>", { "id": "placesListHeader-project" })
                    .css({
                        "font-size": "large",
                        "border-top": "1px solid #5b6e7d"
                    })
                    .html("Project: none"))
                .append($("<div>", { "id": "placesListHeader-selector" })
                    .css("font-size", "large")
                    .html("Collection: none"))
                .append($("<ul>").css({
                    "padding": "0px",
                    "list-style-type": "none"
                }))
                   );
    }

    public addPlacesWithTagName(tagName: string) {
        var ID = window.sessionStorage.getItem("currentProjectID");

        $.getJSON("../Resources/Projects/project-" + ID + ".json",(projectData) =>
        {
            var tagID = this.getTagIDbyTagName(tagName, projectData);
            var taggedPlacesCollection = this.getPlacesByTagID(tagID, projectData);

            $("#placesListHeader-project").html("Project: " + projectData.name);
            $("#placesListHeader-selector").html("Tag: " + tagName);

            if (taggedPlacesCollection.length <= 0) {
                $("#placesListHeader > ul")
                    .append($("<li>", { "class": "emptyList" }).html("<List doesn't contain anything yet>"));
            }

            $(this.root).fadeOut(10, () => {
                // For each place in collection create new list item
                for (var i = 0; i < taggedPlacesCollection.length; i++)
                {
                    var listItem = $("<li>", { "class": "placesListItem" });
                    var table = $("<table>", { "cellspacing": "0", "cellpadding": "0"});
        
                    // IMAGES
                    var firstRow = $("<tr>", { "id": "placesListItemFirstRow" })
                        .append($("<td>", { "colspan": "3" })
                            .append($("<div>", {
                                "width": "500px",
                                "height": "250px",
                                "margin": "0px"
                            })));
                    if (taggedPlacesCollection[i].photos != null) {
                        for (var j = 0; j < taggedPlacesCollection[i].photos.length; j++) {
                            firstRow.children().children()
                                .append($("<div>", { "class": "slickImage" }).append($("<img>", { "src": taggedPlacesCollection[i].photos[j] })));
                        }
                    }
                    else {
                        firstRow.children().children()
                            .append($("<div>", { "class": "slickImage" }).append($("<img>", { "src": "../Resources/image-not-found.png" })));
                    }
                    firstRow.children().children().slick({
                        dots: false,
                        infinite: true,
                        arrows: false,
                        touchMove: true,
                        autoplay: true,
                        fade: true,
                        autoplaySpeed: 10000,
                        speed: 750,
                    }).on("touchmove", (evt) => {
                        evt.stopImmediatePropagation();
                    });

                    // TITLE, COORDINATES, TIME
                    var title = "Title not found";
                    if (taggedPlacesCollection[i].name != null) {
                        title = taggedPlacesCollection[i].name;
                    }
                    var lat = 0;
                    var lon = 0;
                    if (taggedPlacesCollection[i].gps != undefined) {
                        lat = taggedPlacesCollection[i].gps.lat.toFixed(2);
                        lon = taggedPlacesCollection[i].gps.lng.toFixed(2);
                    }
                    var time = 0;
                    if (taggedPlacesCollection[i].requiredTime != null) {
                        time = taggedPlacesCollection[i].requiredTime;
                    }
                    var secondRow = $("<tr>", { "id": "placesListItemSecondRow" })
                        .append($("<td>").html(title))
                        .append($("<td>")
                            .append($("<img>", { "src": "../Resources/clock.png" }))
                            .append($("<span>").html(time + " min").css("vertical-align", "super")))
                        .append($("<td>")
                            .append($("<div>", { "class": "showOnMapButton" }).html("Show on map")
                                .on('click', (evt) => {
                                    var text = $(evt.currentTarget).parent().find(".itemCoordinates").text().substr(5).replace("[", "").replace("]", "").split(",");
                                    var coords = {
                                        lat: text[0],
                                        lon: text[1]
                                    }
                                    window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(coords));
                                    window.location.href = "index.html";
                                }))
                            .append($("<div>", { "class": "itemCoordinates" }).html("GPS: [" + lat + "," + lon + "]"))
                    );

                    // DESCRIPTION
                    var description = "Description not found";
                    if (taggedPlacesCollection[i].desc != null) {
                        description = taggedPlacesCollection[i].desc;
                    }
                    var thirdRow = $("<tr>", { "id": "placesListItemThirdRow" })
                        .append($("<td>", { "colspan": "3" }).html(description));

                    // TAGS
                    var fourthRow = $("<tr>", { "id": "placesListItemFourthRow" })
                        .append($("<td>", { "colspan": "3" }));
                    // If does have tags
                    if (taggedPlacesCollection[i].labels != null) {
                        for (var k = 0; k < taggedPlacesCollection[i].labels.length; k++) {
                            fourthRow.children().append($("<span>").html(" #" + this.getTagNameByTagID(taggedPlacesCollection[i].labels[k], projectData)));
                        }
                    }
                    else {
                        fourthRow.children().append($("<span>").html("No Tags Found"));
                    }
                    // PUT ALL ROWS IN LIST ITEM
                    $("#placesListHeader > ul")
                        .append(listItem
                            .append(table
                                .append(firstRow)
                                .append(secondRow)
                                .append(thirdRow)
                                .append(fourthRow)));
                }
                $(this.root).fadeIn(1000);
            });
        })  
    }

    public addPlacesWithCollectionName(collectionName: string) {
        var ID = window.sessionStorage.getItem("currentProjectID");

        $.getJSON("../Resources/Projects/project-" + ID + ".json", (projectData) => {
            var collectionPlacesCollection = this.getPlacesByCollectionName(collectionName, projectData);

            $("#placesListHeader-project").html("Project: " + projectData.name);
            $("#placesListHeader-selector").html("Collection: " + collectionName);

            $(this.root).fadeOut(10, () => {
                if (collectionPlacesCollection.length <= 0) {
                    $("#placesListHeader > ul")
                        .append($("<li>", { "class": "emptyList" }).html("<List doesn't contain anything yet>"));
                }

                // For each place in collection create new list item
                for (var i = 0; i < collectionPlacesCollection.length; i++) {
                    var listItem = $("<li>", { "class": "placesListItem" });
                    var table = $("<table>", { "cellspacing": "0" });
        
                    // IMAGES
                    var firstRow = $("<tr>", { "id": "placesListItemFirstRow" })
                        .append($("<td>", { "colspan": "3" })
                            .append($("<div>", {
                                "width": "500px",
                                "height": "250px",
                                "margin": "auto"
                            })));
                    if (collectionPlacesCollection[i].photos != null) {
                        for (var j = 0; j < collectionPlacesCollection[i].photos.length; j++) {
                            firstRow.children().children()
                                .append($("<div>", { "class": "slickImage" }).append($("<img>", { "src": collectionPlacesCollection[i].photos[j] })));
                        }
                    }
                    else {
                        firstRow.children().children()
                            .append($("<div>", { "class": "slickImage" }).append($("<img>", { "src": "../Resources/image-not-found.png" })));
                    }
                    firstRow.children().children().slick({
                        dots: false,
                        infinite: true,
                        arrows: false,
                        touchMove: true,
                        autoplay: true,
                        fade: true,
                        autoplaySpeed: 10000,
                        speed: 750,
                    }).on("touchmove", (evt) => {
                        evt.stopImmediatePropagation();
                    });

                    // TITLE, COORDINATES, TIME
                    var title = "Title not found";
                    if (collectionPlacesCollection[i].name != null) {
                        title = collectionPlacesCollection[i].name;
                    }
                    var lat = 0;
                    var lon = 0;
                    if (collectionPlacesCollection[i].gps != undefined) {
                        lat = collectionPlacesCollection[i].gps.lat.toFixed(2);
                        lon = collectionPlacesCollection[i].gps.lng.toFixed(2);
                    }
                    var time = 0;
                    if (collectionPlacesCollection[i].requiredTime != null) {
                        time = collectionPlacesCollection[i].requiredTime;
                    }
                    var secondRow = $("<tr>", { "id": "placesListItemSecondRow" })
                        .append($("<td>").html(title))
                        .append($("<td>")
                            .append($("<img>", { "src": "../Resources/clock.png" }))
                            .append($("<span>").html(time + " min").css("vertical-align", "super")))
                        .append($("<td>")
                            .append($("<div>", {"class" : "showOnMapButton"}).html("Show on map")
                                .on('click', (evt) => {
                                    var text = $(evt.currentTarget).parent().find(".itemCoordinates").text().substr(5).replace("[", "").replace("]", "").split(",");
                                    var coords = {
                                        lat: text[0],
                                        lon: text[1]
                                    }
                                    window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(coords));
                                    window.location.href = "index.html";
                                }))
                            .append($("<div>", { "class": "itemCoordinates"}).html("GPS: [" + lat + "," + lon +"]"))
                        );

                    // DESCRIPTION
                    var description = "Description not found";
                    if (collectionPlacesCollection[i].desc != null) {
                        description = collectionPlacesCollection[i].desc;
                    }
                    var thirdRow = $("<tr>", { "id": "placesListItemThirdRow" })
                        .append($("<td>", { "colspan": "3" }).html(description));

                    // TAGS
                    var fourthRow = $("<tr>", { "id": "placesListItemFourthRow" })
                        .append($("<td>", { "colspan": "3" }));
                    // If does have tags
                    if (collectionPlacesCollection[i].labels != null) {
                        for (var k = 0; k < collectionPlacesCollection[i].labels.length; k++) {
                            fourthRow.children().append($("<span>").html(" #" + this.getTagNameByTagID(collectionPlacesCollection[i].labels[k], projectData)));
                        }
                    }
                    else {
                        fourthRow.children().append($("<span>").html("No Tags Found"));
                    }

                    // PUT ALL ROWS IN LIST ITEM
                    $("#placesListHeader > ul")
                        .append(listItem
                            .append(table
                                .append(firstRow)
                                .append(secondRow)
                                .append(thirdRow)
                                .append(fourthRow)));
                }
                $(this.root).fadeIn(1000);
            });
        });
    }

    public addPlacesWithScheduleName(scheduleName: string) {
        var ID = window.sessionStorage.getItem("currentProjectID");

        $.getJSON("../Resources/Projects/project-" + ID + ".json", (projectData) => {
            var schedulePlacesCollection = this.getPlacesByScheduleName(scheduleName, projectData);

            if (schedulePlacesCollection.length <= 0) {
                $("#placesListHeader > ul")
                    .append($("<li>", { "class": "emptyList" }).html("<List doesn't contain anything yet>"));
            }

            $(this.root).children().fadeOut(700, () => {
                // For each place in collection create new list item
                for (var i = 0; i < schedulePlacesCollection.length; i++) {
                    var listItem = $("<li>", { "class": "placesListItem" });
                    var table = $("<table>", { "cellspacing": "0" });
        
                    // IMAGES
                    var firstRow = $("<tr>", { "id": "placesListItemFirstRow" })
                        .append($("<td>", { "colspan": "3" })
                            .append($("<div>", {
                                "width": "500px",
                                "height": "250px",
                                "margin": "auto"
                            })));
                    if (schedulePlacesCollection[i].photos != null) {
                        for (var j = 0; j < schedulePlacesCollection[i].photos.length; j++) {
                            firstRow.children().children()
                                .append($("<div>", { "class": "slickImage" }).append($("<img>", { "src": schedulePlacesCollection[i].photos[j] })));
                        }
                    }
                    else {
                        firstRow.children().children()
                            .append($("<div>", { "class": "slickImage" }).append($("<img>", { "src": "../Resources/image-not-found.png" })));
                    }
                    firstRow.children().children().slick({
                        dots: false,
                        infinite: true,
                        arrows: false,
                        touchMove: true,
                        autoplay: true,
                        fade: true,
                        autoplaySpeed: 10000,
                        speed: 750,
                    }).on("touchmove", (evt) => {
                        evt.stopImmediatePropagation();
                    });

                    // TITLE, COORDINATES, TIME
                    var title = "Title not found";
                    if (schedulePlacesCollection[i].name != null) {
                        title = schedulePlacesCollection[i].name;
                    }
                    var lat = 0;
                    var lon = 0;
                    if (schedulePlacesCollection[i].gps != undefined) {
                        lat = schedulePlacesCollection[i].gps.lat.toFixed(2);
                        lon = schedulePlacesCollection[i].gps.lng.toFixed(2);
                    }
                    var time = 0;
                    if (schedulePlacesCollection[i].requiredTime != null) {
                        time = schedulePlacesCollection[i].requiredTime;
                    }
                    var secondRow = $("<tr>", { "id": "placesListItemSecondRow" })
                        .append($("<td>").html(title))
                        .append($("<td>")
                            .append($("<img>", { "src": "../Resources/clock.png" }))
                            .append($("<span>").html(time + " min").css("vertical-align", "super")))
                        .append($("<td>")
                            .append($("<div>", { "class": "showOnMapButton" }).html("Show on map")
                                .on('click', (evt) => {
                                    var text = $(evt.currentTarget).parent().find(".itemCoordinates").text().substr(5).replace("[", "").replace("]", "").split(",");
                                    var coords = {
                                        lat: text[0],
                                        lon: text[1]
                                    }
                                    window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(coords));
                                    window.location.href = "index.html";
                                }))
                            .append($("<div>", { "class": "itemCoordinates" }).html("GPS: [" + lat + "," + lon + "]"))
                        );

                    // DESCRIPTION
                    var description = "Description not found";
                    if (schedulePlacesCollection[i].desc != null) {
                        description = schedulePlacesCollection[i].desc;
                    }
                    var thirdRow = $("<tr>", { "id": "placesListItemThirdRow" })
                        .append($("<td>", { "colspan": "3" }).html(description));

                    // TAGS
                    var fourthRow = $("<tr>", { "id": "placesListItemFourthRow" })
                        .append($("<td>", { "colspan": "3" }));
                    // If does have tags
                    if (schedulePlacesCollection[i].labels != null) {
                        for (var k = 0; k < schedulePlacesCollection[i].labels.length; k++) {
                            fourthRow.children().append($("<span>").html(" #" + this.getTagNameByTagID(schedulePlacesCollection[i].labels[k], projectData)));
                        }
                    }
                    else {
                        fourthRow.children().append($("<span>").html("No Tags Found"));
                    }
                    // PUT ALL ROWS IN LIST ITEM
                    $("#placesListHeader > ul")
                        .append(listItem
                            .append(table
                                .append(firstRow)
                                .append(secondRow)
                                .append(thirdRow)
                                .append(fourthRow)));
                }
                $(this.root).children().fadeIn(1000);
            });
        });
    }

    public getTagIDbyTagName(tag: string, projectData: any): number
    {
        if (tag == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.labels.length; i++) {
            if (projectData.labels[i].name == tag) {
                return projectData.labels[i].id;
            }
        }
    }

    public getTagNameByTagID(id: number, projectData: any): string
    {
        if (id == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.labels.length; i++) {
            if (projectData.labels[i].id == id) {
                return projectData.labels[i].name;
            }
        }
    }

    public getPlacesByTagID(id: number, projectData: any): Array<any>
    {
        if (id == null) {
            console.log("Uncorrect parameter");
        }
        // Get all places with given tag ID
        var placesCollection = new Array();
        for (var i = 0; i < projectData.places.length; i++)
        {
            // if place does even have labels
            if (projectData.places[i].labels != null)
            {
                for (var j = 0; j < projectData.places[i].labels.length; j++)
                {
                    if (projectData.places[i].labels[j] == id) {
                        placesCollection.push(projectData.places[i])
                    }
                }
            }
        }
        return placesCollection;
    }

    public getPlaceByPlaceID(id: number, projectData: any): any {
        if (id == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.places.length; i++) {
            if (projectData.places[i].id != null && projectData.places[i].id == id) {
                return projectData.places[i];
            }
        }
    }

    public getPlacesByPlaceName(name: string, projectData: any): Array<any> {
        if (name == null) {
            console.log("Uncorrect parameter");
        }
        var placesCollection = new Array();
        for (var i = 0; i < projectData.places.length; i++) {
            if (projectData.places[i].name != null && projectData.places[i].name == name) {
                    placesCollection.push(projectData.places[i])
            }
        }
        return placesCollection;
    }

    public getPlacesByCollectionName(collectionName: string, projectData: any): Array<any> {
        if (collectionName == null) {
            console.log("Uncorrect parameter");
        }

        var placesCollection = new Array();
        if (projectData.collections != null) {
            for (var i = 0; i < projectData.collections.length; i++) {
                if (projectData.collections[i].name != null && projectData.collections[i].name == collectionName) {
                    if (projectData.collections[i].places != null) {
                        for (var j = 0; j < projectData.collections[i].places.length; j++) {
                            placesCollection.push(this.getPlaceByPlaceID(projectData.collections[i].places[j], projectData));
                        }
                    }
                }
            }
        }
        return placesCollection;
    }

    public getPlacesByScheduleName(scheduleName: string, projectData: any): Array<any>
    {
        if (scheduleName == null) {
            console.log("Uncorrect parameter");
        }
        var placesCollection = new Array();
        for (var i = 0; i < projectData.schedule.length; i++) {
            if (projectData.schedule[i].name == scheduleName && projectData.schedule[i].items != null) {
                for (var j = 0; j < projectData.schedule[i].items.length; j++) {
                    placesCollection.push(this.getPlaceByPlaceID(projectData.schedule[i].items[j].place, projectData));
                }
            }
        }
        return placesCollection;
    }
}