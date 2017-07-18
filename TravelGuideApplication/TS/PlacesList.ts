class PlacesList {
    private root: JQuery;
    public mainPage: MainPage;

    constructor(page: MainPage) {
        this.root = $("#placesList")
            .append($("<ul>"));
        this.mainPage = page;
    }

    public displayPlacesWithTagName(tagName: string) {
        var ID = this.mainPage.sideMenu.currentProjectID;
        
        $.getJSON("./Resources/Projects/project-" + ID + ".json",(projectData) => {
            this.clearList();
            var tagID = this.getTagIDbyTagName(tagName, projectData);
            var placesCollection = this.getPlacesByTagID(tagID, projectData);

            $(this.root).fadeOut(10, () => {
                // For each place in collection create new list item
                for (var i = 0; i < placesCollection.length; i++) {
                    var tags = this.getTagCollectionOfPlace(placesCollection[i].name, projectData);
                    this.createPlacesListItem(placesCollection[i], tags);
                }
            }).fadeIn(750);
         });  
    }

    public displayPlacesWithCollectionName(collectionName: string) {
        var ID = this.mainPage.sideMenu.currentProjectID;

        $.getJSON("./Resources/Projects/project-" + ID + ".json", (projectData) => {
            this.clearList();
            var placesCollection = this.getPlacesByCollectionName(collectionName, projectData);
            
            $(this.root).fadeOut(10, () => {
                // For each place in collection create new list item
                for (var i = 0; i < placesCollection.length; i++) {
                    var tags = this.getTagCollectionOfPlace(placesCollection[i].name, projectData);
                    this.createPlacesListItem(placesCollection[i], tags);
                }
            }).fadeIn(750);
        });
    }

    public displayPlacesWithScheduleName(scheduleName: string) {
        var ID = this.mainPage.sideMenu.currentProjectID;

        $.getJSON("./Resources/Projects/project-" + ID + ".json", (projectData) => {
            this.clearList();
            var placesCollection = this.getPlacesByScheduleName(scheduleName, projectData);

            $(this.root).fadeOut(10, () => {
                // For each place in collection create new list item
                for (var i = 0; i < placesCollection.length; i++) {
                    var tags = this.getTagCollectionOfPlace(placesCollection[i].name, projectData);
                    this.createPlacesListItem(placesCollection[i], tags);
                }
            }).fadeIn(750);
        });
    }

    private createPlacesListItem(place: any, hashTags: Array<any>) {
        var listItem = $("<li>", { "class": "placesListItem" });
        var carousel = $("<div>", { "class": "slickContainer" })
        // Insert images to carousel
        if (place.photos != null) {
            for (var j = 0; j < place.photos.length; j++) {
                carousel.append($("<div>", { "class": "slickImage" })
                    .append($("<img>", { "src": place.photos[j] })));
            }
        }
        else {
            carousel.append($("<div>", { "class": "slickImage" })
                .append($("<img>", { "src": "./Resources/image-not-found.png" })));
        }
        // Init carousel
        carousel.slick({
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
        carousel.slick('slickNext').slick("slickPrev");

        $(window).on('resize', function () {
            $(carousel).slick('resize');
        });

        // Create tabulator
        var tabOptions = $("<div>", { "class": "tabulator" })
            .append($("<ul>", { "class": "tabOptions" })
                .append($("<li>", { "class": "tabOption" })
                    .append($("<a>", { "html": "Info" })
                        .click((evt) => {
                            var clickedTab = $(evt.currentTarget).parent();
                            var clickedTabIndex = clickedTab.parent().children().index(clickedTab);
                            var tabContents = clickedTab.parent().siblings(".tabContents").children();
                            for (var i = 0; i < tabContents.length; i++) {
                                i == clickedTabIndex ? $(tabContents[i]).css({ "display": "block" }) : $(tabContents[i]).css({ "display": "none" })
                            }
                            var indicator = clickedTab.parent().parent().find(".indicator");
                            var width = clickedTab.outerWidth() < 40 ? 45 : clickedTab.outerWidth();
                            $(indicator).animate({ "left": clickedTab.position().left + "px", "width": width }, 200);
                        })))
                .append($("<li>", { "class": "tabOption" })
                    .append($("<a>", { "html": "Weather" })
                        .click((evt) => {
                            var clickedTab = $(evt.currentTarget).parent();
                            var clickedTabIndex = clickedTab.parent().children().index(clickedTab);
                            var tabContents = clickedTab.parent().siblings(".tabContents").children();
                            for (var i = 0; i < tabContents.length; i++) {
                                i == clickedTabIndex ? $(tabContents[i]).css({ "display": "block" }) : $(tabContents[i]).css({ "display": "none" })
                            }
                            var indicator = clickedTab.parent().parent().find(".indicator");
                            var width = clickedTab.outerWidth() < 40 ? 45 : clickedTab.outerWidth();
                            $(indicator).animate({ "left": clickedTab.position().left + "px", "width": width }, 200);
                        })))
                .append($("<div>", { "class": "indicator" })));

        // Content for each tabulator option
        // INFO TAB content
        var placeName = place.name != null ? place.name : "Title not added yet";
        var requiredTime = place.requiredTime != null ? place.requiredTime : "Required time not added yet";
        var lat = 0;
        var lon = 0;
        if (place.gps != undefined) {
            lat = place.gps.lat != null ? place.gps.lat.toFixed(2) : "0";
            lon = place.gps.lng != null ? place.gps.lng.toFixed(2) : "0";
        }

        var tabContents = $("<div>", { "class": "tabContents" });
        var infoTab = $("<div>")
            .append($("<div>", { "class": "InfoMain" })
                .append($("<div>", { "class": "InfoTitle" }).html(placeName))
                .append($("<div>", { "class": "InfoTime" })
                    .append($("<img>", { "src": "./Resources/clock.png", "height": "20px" }).css({ "padding": "0% 3% 0% 0%", "vertical-align": "bottom" }))
                    .append($("<span>", { "html": requiredTime + " min" })))
                .append($("<div>", { "class": "InfoGPS" })
                    .append($("<div>", { "class": "ShowOnMapButton" }).text("Show on Map")
                        .click((evt) => {
                            var text = $(evt.currentTarget).find("~ span").text().replace("[", "").replace("]", "").replace(" ", "").split(",");
                            window.sessionStorage.removeItem("lastVisitedList");
                            this.mainPage.showMap(parseFloat(text[0]), parseFloat(text[1]));
                            this.mainPage.map.makeReturnOnItemButton(text[0], text[1]);
                        }))
                    .append($("<span>").text("[" + place.gps.lat.toFixed(3) + ", " + place.gps.lng.toFixed(3) + "]"))))
                .append($("<div>", { "class": "InfoDescription" }).html(place.desc))
                .append($("<div>", { "class": "InfoTags" }));

        if (hashTags != null) {
            for (var k = 0; k < hashTags.length; k++) {
                $(infoTab).find(".InfoTags")
                    .append($("<a>", { "html": " #" + hashTags[k].name }).css({ "text-decoration": "underline", "margin": "0px 3px" })
                        .click((evt) => {
                            var hash = $(evt.target).html().replace("#", '').trim();
                            this.mainPage.showPlacesByTag(hash);
                        }));
            }
        }
        else {
            $(infoTab).find(".InfoTags").append($("<a>").html("No Tags Found"));
        }
        // WEATHER TAB content
        var weatherTab = $("<div>")
            .append($("<div>", { "class": "weatherListTitle"}))
            .append($("<ul>", { "class": "weatherList" })
                .on("touchmove", (evt) => { evt.stopPropagation(); }));

        var placeGPS = this.searchLocationByCoords(lat, lon)
            .then((locationName) => {
                if (locationName != null) {
                    this.fetchForecast(locationName.features[0].properties.label)
                        .then((forecast) => {
                            if (forecast.cod == 404) {
                                $(weatherTab).find(".weatherListTitle").text("Forecast couldn't be obtained right now.");
                            }
                            $(weatherTab).find(".weatherListTitle").text("Forecast for " + forecast.city.name + ", " + forecast.city.country);
                            for (var i = 0; i < forecast.list.length; i += 8) {
                                $(weatherTab).find("> ul")
                                    .append($("<li>", { "class": "weatherListItem"})
                                        .append($("<table>")
                                            .append($("<tr>")
                                                .append($("<td>", { "class": "forecastDate", "colspan": "2" }).text(Converter.unixToDate(forecast.list[i].dt))))
                                            .append($("<tr>")
                                                .append($("<td>", { "class": "forecastImg", "rowspan":"2" })
                                                    .append($("<img>", { "src": "./Resources/forecast/" + forecast.list[i].weather[0].icon + ".png" })))
                                                .append($("<td>", { "class": "forecastTempMax" }).text(forecast.list[i].main.temp_max.toFixed(1) + "°C"))
                                                .append($("<td>", { "class": "forecastDescription", "rowspan": "2" }).text(forecast.list[i].weather[0].main)))
                                            .append($("<tr>")
                                                .append($("<td>", { "class": "forecastTempMin" }).text(forecast.list[i].main.temp_min.toFixed(1) + "°C")))
                                            .append($("<tr>")
                                                .append($("<td>", { "class": "forecastWind" }).text(forecast.list[i].wind.speed + " m/s"))
                                                .append($("<td>", { "class": "forecastHumidity" }).text(forecast.list[i].main.humidity + " %"))
                                                .append($("<td>", { "class": "forecastPressure" }).text(forecast.list[i].main.pressure + " hpa")))));
                            }
                        })
                        .catch((forecast) => {
                            $(weatherTab).find(".weatherListTitle").text("Forecast couldn't be obtained.");
                        })
                    
                }
            })

        $("#placesList > ul")
            .append(listItem
                .append(carousel)
                .append(tabOptions
                    .append(tabContents
                        .append(infoTab)
                        .append(weatherTab))
                    ));
        // Init default tabOption
        $(tabOptions).find("> ul > .tabOption:nth(0) > a").trigger("click");
    }

    public clearList() {
        $(".placesListItem").remove(".placesListItem");
    }

    public getTagIDbyTagName(tagName: string, projectData: any): number
    {
        if (tagName == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.labels.length; i++) {
            if (projectData.labels[i].name == tagName) {
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

    public getTagCollectionOfPlace(placeName: string, projectData: any): Array<any> {
        if (placeName == null) {
            console.log("Uncorrect parameter");
        }

        var tagCollection = new Array();
        if (projectData.places != null) {
            for (var i = 0; i < projectData.places.length; i++) {
                if (projectData.places[i].name != null && projectData.places[i].name == placeName) {
                    if (projectData.places[i].labels != null) {
                        for (var j = 0; j < projectData.places[i].labels.length; j++) {
                            var id = projectData.places[i].labels[j];
                            var name = this.getTagNameByTagID(id, projectData);
                            tagCollection.push({ "id": id, "name": name}); }
                    }
                }
            }
        }
        return tagCollection;
    }

    public searchLocationByCoords(latitude: number, longitude: number): Promise<any> {
        var fetchURL = "https://search.mapzen.com/v1/reverse?" + "api_key=" + MainPage.mapzen_API_key +"&point.lat=" + latitude + "&point.lon=" + longitude + "&size=1";

        return new Promise((resolve, reject) => {
            $.getJSON(fetchURL, (locations) => {
                if (locations) {
                    resolve(locations);
                }
                else {
                    reject();
                }
            })
        });
    }

    public fetchForecast(placeName: string, country: string = null): Promise<any> {
        var fetchURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + placeName;
        if (country) {
            fetchURL += "," + country;
        }
        fetchURL += "&units=metric&appid=" + MainPage.openweather_API_key;
        fetchURL = './proxy.php?' + "url=" + encodeURIComponent(fetchURL);

        return new Promise((resolve, reject) => {
            $.getJSON(fetchURL, (locations) => {
                locations ?
                    resolve(locations)
                    : reject(locations);
                })
                .fail((locations) => {
                    reject(locations);
                })
        });
    }

    private setForecast(forecast: any) {
        for (var i = 0; i < forecast.list.length; i += 8) {
            var table = $("#list-forecast").find("table:eq(" + i / 8 + ")");
            table.find(".forecastImg > img").attr("src", "./Resources/forecast/" + forecast.list[i].weather[0].icon + ".png");
            table.find(".forecastTempExtremes> div:eq(0)").text(forecast.list[i].main.temp_max.toFixed(1) + "°C");
            table.find(".forecastTempExtremes > div:eq(1)").text(forecast.list[i].main.temp_min.toFixed(1) + "°C");
            table.find(".forecastDescription").text(forecast.list[i].weather[0].main);
            table.find(".forecastDate").text(Converter.unixToDate(forecast.list[i].dt));
            table.find(".forecastWind").text(forecast.list[i].wind.speed + " m/s");
            table.find(".forecastHumidity").text(forecast.list[i].main.humidity + " %");
            table.find(".forecastPressure").text(forecast.list[i].main.pressure + " hpa");
        }
    }

    public findShowedPlaceByGPS(lat: string, lon: string) {
        var InfoGPS = $(".InfoGPS > span");
        for (var i = 0; i < InfoGPS.length; i++) {
            if ($(InfoGPS[i]).text().search(lat) > 0 && $(InfoGPS[i]).text().search(lon)) {
                var item = $(InfoGPS[i]).parentsUntil("ul > li.placesListItem").parent(":eq(4)");
                $(document.body).animate({ 'scrollTop': $(item).offset().top - 60 }, 1250, () => {
                    $(item).css("animation", "box-highlight 1.5s")
                        .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", (evt) => {
                            $(evt.currentTarget).css("animation", "none");
                        });
                });
            }
        }
    }
}