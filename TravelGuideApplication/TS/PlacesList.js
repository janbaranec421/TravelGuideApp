var PlacesList = (function () {
    function PlacesList() {
        this.root = $("#placesList")
            .append($("<ul>"));
    }
    PlacesList.prototype.displayPlacesWithTagName = function (tagName) {
        var _this = this;
        var ID = window.sessionStorage.getItem("currentProjectID");
        $.getJSON("./Resources/Projects/project-" + ID + ".json", function (projectData) {
            _this.clearList();
            var tagID = _this.getTagIDbyTagName(tagName, projectData);
            var placesCollection = _this.getPlacesByTagID(tagID, projectData);
            $(_this.root).fadeOut(10, function () {
                // For each place in collection create new list item
                for (var i = 0; i < placesCollection.length; i++) {
                    var tags = _this.getTagCollectionOfPlace(placesCollection[i].name, projectData);
                    _this.createPlacesListItem(placesCollection[i], tags);
                }
            });
            $(_this.root).fadeIn(1000, function () {
                if (window.sessionStorage.getItem("placeItemCoordinates")) {
                    var placeItemCoords = JSON.parse(window.sessionStorage.getItem("placeItemCoordinates"));
                    if (placeItemCoords.returnButton) {
                        placeItemCoords.returnButton = false;
                        window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(placeItemCoords));
                        window.sessionStorage.removeItem("placeItemCoordinates");
                        _this.findShowedPlaceByGPS(placeItemCoords.lat, placeItemCoords.lon);
                    }
                }
            });
        });
    };
    PlacesList.prototype.displayPlacesWithCollectionName = function (collectionName) {
        var _this = this;
        var ID = window.sessionStorage.getItem("currentProjectID");
        $.getJSON("./Resources/Projects/project-" + ID + ".json", function (projectData) {
            _this.clearList();
            var placesCollection = _this.getPlacesByCollectionName(collectionName, projectData);
            $(_this.root).fadeOut(10, function () {
                // For each place in collection create new list item
                for (var i = 0; i < placesCollection.length; i++) {
                    var tags = _this.getTagCollectionOfPlace(placesCollection[i].name, projectData);
                    _this.createPlacesListItem(placesCollection[i], tags);
                }
            });
            $(_this.root).fadeIn(1000, function () {
                if (window.sessionStorage.getItem("placeItemCoordinates")) {
                    var placeItemCoords = JSON.parse(window.sessionStorage.getItem("placeItemCoordinates"));
                    if (placeItemCoords.returnButton) {
                        placeItemCoords.returnButton = false;
                        window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(placeItemCoords));
                        window.sessionStorage.removeItem("placeItemCoordinates");
                        _this.findShowedPlaceByGPS(placeItemCoords.lat, placeItemCoords.lon);
                    }
                }
            });
        });
    };
    PlacesList.prototype.displayPlacesWithScheduleName = function (scheduleName) {
        var _this = this;
        var ID = window.sessionStorage.getItem("currentProjectID");
        $.getJSON("./Resources/Projects/project-" + ID + ".json", function (projectData) {
            _this.clearList();
            var placesCollection = _this.getPlacesByScheduleName(scheduleName, projectData);
            $(_this.root).fadeOut(10, function () {
                // For each place in collection create new list item
                for (var i = 0; i < placesCollection.length; i++) {
                    var tags = _this.getTagCollectionOfPlace(placesCollection[i].name, projectData);
                    _this.createPlacesListItem(placesCollection[i], tags);
                }
            });
            $(_this.root).fadeIn(1000, function () {
                if (window.sessionStorage.getItem("placeItemCoordinates")) {
                    var placeItemCoords = JSON.parse(window.sessionStorage.getItem("placeItemCoordinates"));
                    if (placeItemCoords.returnButton) {
                        placeItemCoords.returnButton = false;
                        window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(placeItemCoords));
                        window.sessionStorage.removeItem("placeItemCoordinates");
                        _this.findShowedPlaceByGPS(placeItemCoords.lat, placeItemCoords.lon);
                    }
                }
            });
        });
    };
    PlacesList.prototype.createPlacesListItem = function (place, tags) {
        var _this = this;
        var listItem = $("<li>", { "class": "placesListItem" });
        var carousel = $("<div>", { "class": "slickContainer" });
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
        }).on("touchmove", function (evt) {
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
            .click(function (evt) {
            var clickedTab = $(evt.currentTarget).parent();
            var clickedTabIndex = clickedTab.parent().children().index(clickedTab);
            var tabContents = clickedTab.parent().siblings(".tabContents").children();
            for (var i = 0; i < tabContents.length; i++) {
                i == clickedTabIndex ? $(tabContents[i]).css({ "display": "block" }) : $(tabContents[i]).css({ "display": "none" });
            }
            var indicator = clickedTab.parent().parent().find(".indicator");
            var width = clickedTab.outerWidth() < 40 ? 45 : clickedTab.outerWidth();
            $(indicator).animate({ "left": clickedTab.position().left + "px", "width": width }, 200);
        })))
            .append($("<li>", { "class": "tabOption" })
            .append($("<a>", { "html": "Weather" })
            .click(function (evt) {
            var clickedTab = $(evt.currentTarget).parent();
            var clickedTabIndex = clickedTab.parent().children().index(clickedTab);
            var tabContents = clickedTab.parent().siblings(".tabContents").children();
            for (var i = 0; i < tabContents.length; i++) {
                i == clickedTabIndex ? $(tabContents[i]).css({ "display": "block" }) : $(tabContents[i]).css({ "display": "none" });
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
            .click(function (evt) {
            var text = $(evt.currentTarget).find("~ span").text().replace("[", "").replace("]", "").replace(" ", "").split(",");
            var obj = {
                lat: text[0],
                lon: text[1],
                returnButton: false
            };
            window.sessionStorage.setItem("placeItemCoordinates", JSON.stringify(obj));
            window.location.href = "index.html";
        }))
            .append($("<span>").text("[" + place.gps.lat.toFixed(3) + ", " + place.gps.lng.toFixed(3) + "]"))))
            .append($("<div>", { "class": "InfoDescription" }).html(place.desc))
            .append($("<div>", { "class": "InfoTags" }));
        if (tags != null) {
            for (var k = 0; k < tags.length; k++) {
                $(infoTab).find(".InfoTags")
                    .append($("<a>", { "html": " #" + tags[k].name }).css({ "text-decoration": "underline", "margin": "0px 3px" })
                    .click(function (evt) {
                    var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                    selectionObject.currentCollection = null;
                    selectionObject.currentTag = $(evt.target).html().replace("#", '').trim();
                    selectionObject.currentSchedule = null;
                    window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                    window.location.href = "places.html";
                }));
            }
        }
        else {
            $(infoTab).find(".InfoTags").append($("<a>").html("No Tags Found"));
        }
        // WEATHER TAB content
        var weatherTab = $("<div>")
            .append($("<div>", { "class": "weatherListTitle" }))
            .append($("<ul>", { "class": "weatherList" })
            .on("touchmove", function (evt) { evt.stopPropagation(); }));
        var placeGPS = this.searchLocationByCoords(lat, lon)
            .then(function (locationName) {
            if (locationName != null) {
                _this.fetchForecast(locationName.features[0].properties.label)
                    .then(function (forecast) {
                    if (forecast.cod == 404) {
                        $(weatherTab).find(".weatherListTitle").text("Forecast couldn't be obtained right now.");
                    }
                    $(weatherTab).find(".weatherListTitle").text("Forecast for " + forecast.city.name + ", " + forecast.city.country);
                    for (var i = 0; i < forecast.list.length; i += 8) {
                        $(weatherTab).find("> ul")
                            .append($("<li>", { "class": "weatherListItem" })
                            .append($("<table>")
                            .append($("<tr>")
                            .append($("<td>", { "class": "forecastDate", "colspan": "2" }).text(Converter.unixToDate(forecast.list[i].dt))))
                            .append($("<tr>")
                            .append($("<td>", { "class": "forecastImg", "rowspan": "2" })
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
                    .catch(function (forecast) {
                    $(weatherTab).find(".weatherListTitle").text("Forecast couldn't be obtained.");
                });
            }
        });
        $("#placesList > ul")
            .append(listItem
            .append(carousel)
            .append(tabOptions
            .append(tabContents
            .append(infoTab)
            .append(weatherTab))));
        // Init default tabOption
        $(tabOptions).find("> ul > .tabOption:nth(0) > a").trigger("click");
    };
    PlacesList.prototype.clearList = function () {
        $(".placesListItem").remove(".placesListItem");
    };
    PlacesList.prototype.getTagIDbyTagName = function (tagName, projectData) {
        if (tagName == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.labels.length; i++) {
            if (projectData.labels[i].name == tagName) {
                return projectData.labels[i].id;
            }
        }
    };
    PlacesList.prototype.getTagNameByTagID = function (id, projectData) {
        if (id == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.labels.length; i++) {
            if (projectData.labels[i].id == id) {
                return projectData.labels[i].name;
            }
        }
    };
    PlacesList.prototype.getPlacesByTagID = function (id, projectData) {
        if (id == null) {
            console.log("Uncorrect parameter");
        }
        // Get all places with given tag ID
        var placesCollection = new Array();
        for (var i = 0; i < projectData.places.length; i++) {
            // if place does even have labels
            if (projectData.places[i].labels != null) {
                for (var j = 0; j < projectData.places[i].labels.length; j++) {
                    if (projectData.places[i].labels[j] == id) {
                        placesCollection.push(projectData.places[i]);
                    }
                }
            }
        }
        return placesCollection;
    };
    PlacesList.prototype.getPlaceByPlaceID = function (id, projectData) {
        if (id == null) {
            console.log("Uncorrect parameter");
        }
        for (var i = 0; i < projectData.places.length; i++) {
            if (projectData.places[i].id != null && projectData.places[i].id == id) {
                return projectData.places[i];
            }
        }
    };
    PlacesList.prototype.getPlacesByPlaceName = function (name, projectData) {
        if (name == null) {
            console.log("Uncorrect parameter");
        }
        var placesCollection = new Array();
        for (var i = 0; i < projectData.places.length; i++) {
            if (projectData.places[i].name != null && projectData.places[i].name == name) {
                placesCollection.push(projectData.places[i]);
            }
        }
        return placesCollection;
    };
    PlacesList.prototype.getPlacesByCollectionName = function (collectionName, projectData) {
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
    };
    PlacesList.prototype.getPlacesByScheduleName = function (scheduleName, projectData) {
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
    };
    PlacesList.prototype.getTagCollectionOfPlace = function (placeName, projectData) {
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
                            tagCollection.push({ "id": id, "name": name });
                        }
                    }
                }
            }
        }
        return tagCollection;
    };
    PlacesList.prototype.searchLocationByCoords = function (latitude, longitude) {
        var fetchURL = "https://search.mapzen.com/v1/reverse?" + "api_key=mapzen-eES7bmW&point.lat=" + latitude + "&point.lon=" + longitude + "&size=1";
        return new Promise(function (resolve, reject) {
            $.getJSON(fetchURL, function (locations) {
                if (locations) {
                    resolve(locations);
                }
                else {
                    reject();
                }
            });
        });
    };
    PlacesList.prototype.fetchForecast = function (placeName, country) {
        if (country === void 0) { country = null; }
        var fetchURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + placeName;
        if (country) {
            fetchURL += "," + country;
        }
        fetchURL += "&units=metric&appid=57cf72874229f081c28596f80a572323";
        return new Promise(function (resolve, reject) {
            $.getJSON(fetchURL, function (locations) {
                locations ?
                    resolve(locations)
                    : reject(locations);
            })
                .fail(function (locations) {
                reject(locations);
            });
        });
    };
    PlacesList.prototype.setForecast = function (forecast) {
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
    };
    PlacesList.prototype.findShowedPlaceByGPS = function (lat, lon) {
        var InfoGPS = $(".InfoGPS > span");
        for (var i = 0; i < InfoGPS.length; i++) {
            if ($(InfoGPS[i]).text().search(lat) > 0 && $(InfoGPS[i]).text().search(lon)) {
                var item = $(InfoGPS[i]).parentsUntil("ul > li.placesListItem").parent(":eq(4)");
                $(document.body).animate({ 'scrollTop': $(item).offset().top - 60 }, 1500, function () {
                    $(item).addClass("blink-item-highlight");
                });
            }
        }
    };
    return PlacesList;
})();
//# sourceMappingURL=PlacesList.js.map