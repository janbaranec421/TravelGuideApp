class PlacesList {
    private root: JQuery

    constructor() {
        this.root = $("#placesList");

        $(this.root)
            .append($("<ul>"));
    }

    public addPlacesWithTagName(tagName: string) {
        var ID = window.sessionStorage.getItem("projectID");

        $.getJSON("../Resources/project-" + ID + ".json",(projectData) =>
        {
            var tagID = this.getTagIDbyTagName(tagName, projectData);
            var taggedPlacesCollection = this.getPlacesByTagID(tagID, projectData);

            // For each place in collection create new list item
            for (var i = 0; i < taggedPlacesCollection.length; i++) {
                var listItem = $("<li>", { "id": "placesListItem" });
                var table = $("<table>", { "cellspacing": "0" });
        
                // IMAGES
                var firstRow = $("<tr>", { "id": "placesListItemFirstRow" })
                    .append($("<td>", { "colspan": "3" })
                        .append($("<div>", {
                            "width": "500px",
                            "height": "250px",
                            "margin": "auto"
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
                    lat = taggedPlacesCollection[i].gps.lat.toFixed(4);
                    lon = taggedPlacesCollection[i].gps.lng.toFixed(4);
                }
                var time = 0;
                if (taggedPlacesCollection[i].requiredTime != null) {
                    time = taggedPlacesCollection[i].requiredTime;
                }
                var secondRow = $("<tr>", { "id": "placesListItemSecondRow" })
                    .append($("<td>").html(title))
                    .append($("<td>")
                        .append($("<tr>")
                            .append($("<div>").html("lat: " + lat))
                            .append($("<div>").html("lon: " + lon))))
                    .append($("<td>")
                        .append($("<img>", { "src": "../Resources/clock.png" }))
                        .append($("<span>").html(time + " min")));

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
                $(this.root).children()
                    .append(listItem
                        .append(table
                            .append(firstRow)
                            .append(secondRow)
                            .append(thirdRow)
                            .append(fourthRow)));
            }
        })  
    }

    public addPlacesWithCollectionName(collectionName: string) {
        var ID = window.sessionStorage.getItem("projectID");

        $.getJSON("../Resources/project-" + ID + ".json", (projectData) => {
            var collectionPlacesCollection = this.getPlacesByCollectionName(collectionName, projectData);
            console.log(collectionPlacesCollection);
            
            // For each place in collection create new list item
            for (var i = 0; i < collectionPlacesCollection.length; i++) {
                var listItem = $("<li>", { "id": "placesListItem" });
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
                    lat = collectionPlacesCollection[i].gps.lat.toFixed(4);
                    lon = collectionPlacesCollection[i].gps.lng.toFixed(4);
                }
                var time = 0;
                if (collectionPlacesCollection[i].requiredTime != null) {
                    time = collectionPlacesCollection[i].requiredTime;
                }
                var secondRow = $("<tr>", { "id": "placesListItemSecondRow" })
                    .append($("<td>").html(title))
                    .append($("<td>")
                        .append($("<tr>")
                            .append($("<div>").html("lat: " + lat))
                            .append($("<div>").html("lon: " + lon))))
                    .append($("<td>")
                        .append($("<img>", { "src": "../Resources/clock.png" }))
                        .append($("<span>").html(time + " min")));

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
                $(this.root).children()
                    .append(listItem
                        .append(table
                            .append(firstRow)
                            .append(secondRow)
                            .append(thirdRow)
                            .append(fourthRow)));
            }
        })
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

}