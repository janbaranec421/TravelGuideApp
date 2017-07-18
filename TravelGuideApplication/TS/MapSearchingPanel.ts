class MapSearchingPanel {
    public root: JQuery;
    public map: Map;
    public suggestionsList: Array<any> = [];

    private pathPointsGPS: Array<any>;

    private pedestrianType: boolean;
    private carType: boolean;
    private bicycleType: boolean;


    constructor(map: Map) {
        this.root = $("#mapPanel");
        this.map = map;

        // First part - search input
        var searchInputPart = $("<li>", { "class": "mapPanelContentItem" })
            .append($("<form>", { "id": "placeSearchForm" }).submit((e) => {
                e.preventDefault();
                this.handleSearchSubmit();
            })
                .append($("<input>", { "id": "placeInput", "type": "text", "placeholder": "Type to find places...", "autocomplete": "on", "list": "suggestionList" })
                    .on("keyup", this.throttle(() => {
                        var text = $("#placeInput").val();
                        var coords = this.map.getCoordinatesAtCenter();
                        this.fetchSuggestions(text, coords.latitude, coords.longitude)
                            .then((suggestions) => {
                                this.setSuggestions(suggestions, $("#suggestionList"));
                            });
                    }, 250)))
                .append($("<datalist>", { "id": "suggestionList" }))
                .append($("<button>", { "id": "placeSubmit", "type": "button" })
                    .on("click", () => { this.handleSearchSubmit(); })
                    .append($("<img>", { "src": "./Resources/search.png" })
                        .css({
                            "height": "20px",
                            "width": "20px",
                            "vertical-align": "middle"
                        }))
                ))

        var forecastList = ($("<ul>", { "id": "forecastList" }));
        var detailedInfoPart = $("<li>", { "class": "mapPanelContentItem" }).css({ "height": "calc(100% - 46px)" })
            .append($("<button>", { "id": "InfoCardButton" }).text("Info")
                .click(() => {
                    $("#InfoCardButton").removeClass("notSelectedCardButton").addClass("SelectedCardButton");
                    $("#WeatherCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
                    $("#RouteCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
                    $("#detailedInfoCard").css({ "display": "block" });
                    $("#weatherCard").css({ "display": "none" });
                    $("#routeCard").css({ "display": "none" });
                }))
            .append($("<button>", { "id": "WeatherCardButton" }).text("Weather")
                .click(() => {
                    $("#WeatherCardButton").removeClass("notSelectedCardButton").addClass("SelectedCardButton");
                    $("#InfoCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
                    $("#RouteCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
                    $("#weatherCard").css({ "display": "block" });
                    $("#detailedInfoCard").css({ "display": "none" });
                    $("#routeCard").css({ "display": "none" });
                }))
            .append($("<button>", { "id": "RouteCardButton" }).text("Route")
                .click(() => {
                    $("#RouteCardButton").removeClass("notSelectedCardButton").addClass("SelectedCardButton");
                    $("#WeatherCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
                    $("#InfoCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
                    $("#routeCard").css({ "display": "block" });
                    $("#weatherCard").css({ "display": "none" });
                    $("#detailedInfoCard").css({ "display": "none" });
                }))
            .append($("<ul>", { "id": "detailedInfoCard" })
                .append($("<li>").css({ "min-height": "75px", "height": "calc(100% - 30px)", "padding": "15px 5px" })
                    .append($("<div>", { "id": "placeName" }))
                    .append($("<div>", { "id": "placeDetails" })
                        .append($("<div>", { "id": "placeRegionCountry" }))
                        .append($("<div>", { "id": "placeGPS" })))
                    .append($("<button>", { "id": "navigateMeButton" }).text("How do i get there")
                        .click(() => {
                            this.handleNavigateMeButtonEvent();
                        }))))
            .append($("<ul>", { "id": "weatherCard" })
                .append($("<li>").css({ "height": "calc(100% - 30px)", "margin": "0% 2%", "padding": "15px 5px" })
                    .append($("<span>", { "id": "weatherLocalityTitle" }))
                    .append($("<button>", { "id": "weatherButton" }).text("Weather")
                        .on("click", () => {
                            $("#forecastList").css("display", "none");
                            $("#weatherTable").css("display", "table");
                        }))
                    .append($("<button>", { "id": "forecastButton" }).text("Forecast")
                        .on("click", () => {
                            $("#weatherTable").css("display", "none");
                            $("#forecastList").css("display", "block");
                        }))
                    .append($("<table>", { "id": "weatherTable" })
                        .append($("<tr>")
                            .append($("<td>", { "id": "weatherImg" }).append($("<img>")))
                            .append($("<td>", { "id": "weatherTemperature" }))
                        )
                        .append($("<tr>")
                            .append($("<td>", { "id": "windLabel" }))
                            .append($("<td>", { "id": "wind" }))
                        )
                        .append($("<tr>")
                            .append($("<td>", { "id": "humidityLabel" }))
                            .append($("<td>", { "id": "humidity" }))
                        )
                        .append($("<tr>")
                            .append($("<td>", { "id": "pressureLabel" }))
                            .append($("<td>", { "id": "pressure" }))
                        )
                    )
                    .append(forecastList)))
            .append($("<ul>", { "id": "routeCard" })
                .append($("<li>").css({ "min-height": "75px", "height": "calc(100% - 30px)", "padding": "15px 5px" })
                    .append($("<img>", { "class": "routeTravelTypeIcon", "src": "./Resources/car.png" })
                        .click((evt) => {
                            this.bicycleType = false; this.carType = true; this.pedestrianType = false;
                            $(".routeTravelTypeIcon").css({ "box-shadow": "none", "background": "#e8e8e8 " });
                            $(evt.currentTarget).css({ "box-shadow": "0px 0px 4px 1px rgb(150, 147, 141) ", "background": "rgb(232, 232, 232)" })
                            if (this.pathPointsGPS) {
                                this.map.clearPathPoints();
                                this.map.shiftMap(0, 0);
                                // If any route point input is empty, highlight it to user
                                var inputs = $(".routePointInput");
                                var notEmptyCount = 0;
                                for (var i = 0; i < inputs.length; i++) {
                                    if ($(inputs).eq(i).val() == '') {
                                        $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                                            .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", (evt) => {
                                                $(evt.currentTarget).css("animation", "none");
                                            })
                                    }
                                    else {
                                        notEmptyCount++;
                                    }
                                }
                                if (notEmptyCount == inputs.length) {
                                    this.handleFindRouteEvent();
                                }
                            }
                        }))
                    .append($("<img>", { "class": "routeTravelTypeIcon", "src": "./Resources/bicycle.png" })
                        .click((evt) => {
                            this.bicycleType = true; this.carType = false; this.pedestrianType = false;
                            $(".routeTravelTypeIcon").css({ "box-shadow": "none", "background": "#e8e8e8 " });
                            $(evt.currentTarget).css({ "box-shadow": "0px 0px 4px 1px rgb(150, 147, 141) ", "background": "rgb(232, 232, 232)" })
                            if (this.pathPointsGPS) {
                                this.map.clearPathPoints();
                                this.map.shiftMap(0, 0);
                                // If any route point input is empty, highlight it to user
                                var inputs = $(".routePointInput");
                                var notEmptyCount = 0;
                                for (var i = 0; i < inputs.length; i++) {
                                    if ($(inputs).eq(i).val() == '') {
                                        $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                                            .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", (evt) => {
                                                $(evt.currentTarget).css("animation", "none");
                                            })
                                    }
                                    else {
                                        notEmptyCount++;
                                    }
                                }
                                if (notEmptyCount == inputs.length) {
                                    this.handleFindRouteEvent();
                                }
                            }
                        }))
                    .append($("<img>", { "class": "routeTravelTypeIcon", "src": "./Resources/pedestrian.png" })
                        .click((evt) => {
                            this.bicycleType = false; this.carType = false; this.pedestrianType = true;
                            $(".routeTravelTypeIcon").css({ "box-shadow": "none", "background": "#e8e8e8 " });
                            $(evt.currentTarget).css({ "box-shadow": "0px 0px 4px 1px rgb(150, 147, 141) ", "background": "rgb(232, 232, 232)" })
                            if (this.pathPointsGPS) {
                                this.map.clearPathPoints();
                                this.map.shiftMap(0, 0);
                                // If any route point input is empty, highlight it to user
                                var inputs = $(".routePointInput");
                                var notEmptyCount = 0;
                                for (var i = 0; i < inputs.length; i++) {
                                    if ($(inputs).eq(i).val() == '') {
                                        $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                                            .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", (evt) => {
                                                $(evt.currentTarget).css("animation", "none");
                                            })
                                    }
                                    else {
                                        notEmptyCount++;
                                    }
                                }
                                if (notEmptyCount == inputs.length) {
                                    this.handleFindRouteEvent();
                                }
                            }
                        }))
                    .append($("<ul>", { "id": "routePointsList" })
                        .append($("<datalist>", { "id": "routePointDatalist" })))
                    .append($("<div>", { "class": "routeDetailInfo" }))
                    .append($("<button>", { "class": "routeButton" }).text("Add Point")
                        .click(() => {
                            this.addPathPoint();
                        }))
                    .append($("<button>", { "class": "routeButton" }).text("Find route")
                        .click(() => {
                            this.map.clearPathPoints();
                            this.map.shiftMap(0, 0);
                            // If any route point input is empty, highlight it to user
                            var inputs = $(".routePointInput");
                            var notEmptyCount = 0;
                            for (var i = 0; i < inputs.length; i++) {
                                if ($(inputs).eq(i).val() == '') {
                                    $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                                        .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", (evt) => {
                                            $(evt.currentTarget).css("animation", "none");
                                        })
                                }
                                else {
                                    notEmptyCount++;
                                }
                            }
                            if (notEmptyCount == inputs.length) {
                                this.handleFindRouteEvent();
                            }
                        }))));

        // Fill forecast data
        for (var i = 0; i < 4; i++) {
            $(forecastList).append($("<table>")
                .append($("<tr>")
                    .append($("<td>", { "class": "forecastDate", "colspan": "2" }))
                )
                .append($("<tr>")
                    .append($("<td>", { "class": "forecastImg" })
                        .append($("<img>")))
                    .append($("<td>", { "class": "forecastTempExtremes" })
                        .append($("<div>"))
                        .append($("<div>")))
                    .append($("<td>", { "class": "forecastDescription" }))
                )
                .append($("<tr>")
                    .append($("<td>", { "class": "forecastWind" }))
                    .append($("<td>", { "class": "forecastHumidity" }))
                    .append($("<td>", { "class": "forecastPressure" }))
                ));
        }
     
        // Initial route point for route tab
        // FIRST ROUTE POINT
        var pathPointItemFirst =
            $("<li>", { "class": "routePoint" })
                .append($("<img>", { "class": "routePointIcon", "src": "./Resources/point.png" }))
                .append($("<input>", { "class": "routePointInput", "autocomplete": "on", "list": "routePointDatalist" })
                    .on("keyup", (evt) => {
                        var text = $(evt.currentTarget).val();
                        var coords = this.map.getCoordinatesAtCenter();
                        this.fetchSuggestions(text, coords.latitude, coords.longitude)
                            .then((suggestions) => {
                                this.setSuggestions(suggestions, $("#routePointDatalist"));
                            });
                    })
                    .focusin((evt) => {
                        if ($(".routePoint").length <= 2) {
                            return;
                        }
                        $(evt.currentTarget).siblings(".deletePointIcon").fadeIn(100);
                    })
                    .focusout((evt) => {
                        $(evt.currentTarget).siblings(".deletePointIcon").fadeOut(100);
                    })
                    .focus())
                .append($("<img>", { "class": "deletePointIcon", "src": "./Resources/delete.png" })
                    .click((evt) => {
                        var selectedPoint = $(evt.currentTarget).parents(".routePoint");
                        if ($(".routePoint").length == $(selectedPoint).index()) {
                            $("#routePointsList > .routePoint").eq($(selectedPoint).index() - 2).children(".routePointDots").remove();
                        }
                        $(evt.currentTarget).parents(".routePoint").remove();
                    }))
                .append($("<img>", { "class": "routePointDots", "src": "./Resources/point_dots.png" }));

        // SECOND ROUTE POINT
        var pathPointItemSecond =
            $("<li>", { "class": "routePoint" })
                .append($("<img>", { "class": "routePointIcon", "src": "./Resources/point.png" }))
                .append($("<input>", { "class": "routePointInput", "autocomplete": "on", "list": "routePointDatalist" })
                    .on("keyup", (evt) => {
                        var text = $(evt.currentTarget).val();
                        var coords = this.map.getCoordinatesAtCenter();
                        this.fetchSuggestions(text, coords.latitude, coords.longitude)
                            .then((suggestions) => {
                                this.setSuggestions(suggestions, $("#routePointDatalist"));
                            });
                    })
                    .focusin((evt) => {
                        if ($(".routePoint").length <= 2) {
                            return;
                        }
                        $(evt.currentTarget).siblings(".deletePointIcon").fadeIn(100);
                    })
                    .focusout((evt) => {
                        $(evt.currentTarget).siblings(".deletePointIcon").fadeOut(100);
                    })
                    .focus())
                .append($("<img>", { "class": "deletePointIcon", "src": "./Resources/delete.png" })
                    .click((evt) => {
                        var selectedPoint = $(evt.currentTarget).parents(".routePoint");
                        if ($(".routePoint").length == $(selectedPoint).index()) {
                            $("#routePointsList > .routePoint").eq($(selectedPoint).index() - 2).children(".routePointDots").remove();
                        }
                        $(evt.currentTarget).parents(".routePoint").remove();
                    }));

        // After creating routepoints, remove delete marks by focusout event
        $(pathPointItemFirst).children(".routePointInput").focusout();
        $(pathPointItemSecond).children(".routePointInput").focusout();
        $(detailedInfoPart).find("#routeCard > li > #routePointsList")
            .append(pathPointItemFirst)
            .append(pathPointItemSecond);


        $(this.root)
            .append($("<ul>", { "class": "mapPanelContent" })
                .append(searchInputPart)
                .append(detailedInfoPart)
        );
        $("#InfoCardButton").click();
        $("#weatherButton").click();
        $(".routeTravelTypeIcon").eq(0).click();
    }

    public throttle(fn: Function, delay: number) {
        var wait = false;
        return () => {
            if (!wait) {
                fn();
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, delay);
            }
        }
    }

    public searchLocationByName(place: string, focusLat: number = null, focusLon: number = null): Promise<any> {
        var fetchURL = "https://search.mapzen.com/v1/search?" + "api_key=" + MainPage.mapzen_API_key + "&text=" + place + "&size=1";
        if (focusLat & focusLon) {
            fetchURL += "&focus.point.lat=" + focusLat + "&focus.point.lon=" + focusLon;
        }

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

    public searchLocationByCoords(latitude: number, longitude: number): Promise<any> {
        var fetchURL = "https://search.mapzen.com/v1/reverse?" + "api_key=" + MainPage.mapzen_API_key + "&point.lat=" + latitude + "&point.lon=" + longitude + "&size=1";

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

    private fetchSuggestions(place: string, focusLat: number = 0, focusLon: number = 0): Promise<any> {
        var fetchURL = "https://search.mapzen.com/v1/autocomplete?api_key=" + MainPage.mapzen_API_key + "&layers=locality&";

        if (focusLat > 0 && focusLon > 0) {
            fetchURL += "focus.point.lat=" + focusLat.toFixed(3) + "&focus.point.lon=" + focusLon.toFixed(3);
        }
        fetchURL += "&text=" + place;

        return new Promise((resolve, reject) => {
            $.getJSON(fetchURL, (suggestions) => {
                if (suggestions) {
                    resolve(suggestions);
                }
                else {
                    reject("Error fetching suggestions")
                }
            })
        });
    }

    public fetchWeather(placeName: string, country: string = null): Promise<any> {
        var fetchURL = "http://api.openweathermap.org/data/2.5/weather?q=" + placeName;
        if (country) {
            fetchURL += "," + country;
        }
        fetchURL += "&units=metric&appid=" + MainPage.openweather_API_key;
        fetchURL = './proxy.php?' + "url=" + encodeURIComponent(fetchURL);

        return new Promise((resolve, reject) => {
            $.getJSON(fetchURL, (locations) => {
                locations ? resolve(locations) : reject();
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
                locations ? resolve(locations) : reject();
            })
        });
    }

    private setWeather(weather: any) {
        $("#weatherLocalityTitle").text(weather.name);
        $("#weatherImg > img").attr("src", "./Resources/forecast/" + weather.weather[0].icon + ".png");
        $("#weatherTemperature").text(weather.main.temp.toFixed(0) + "°C");
        $("#windLabel").text("Wind: ");
        $("#wind").text(weather.wind.speed + " m/s  ");
        $("#humidityLabel").text("Humidity: ");
        $("#humidity").text(weather.main.humidity + " %");
        $("#pressureLabel").text("Pressure: ");
        $("#pressure").text(weather.main.pressure + " hpa");
    }

    private setForecast(forecast: any) {
        for (var i = 0; i < forecast.list.length; i += 8) {
            var table = $("#forecastList").find("table:eq(" + i / 8 + ")");
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

    private setSuggestions(suggestions: any, list: any) {
        // Refreshing suggestion list
        $(list).empty();
        for (var i = 0; i < suggestions.features.length; i++) {
            if (suggestions.features[i].properties.label != undefined) {
                $(list).append($("<option>", { "value": suggestions.features[i].properties.label }))
            }
        }
    }

    private handleSearchSubmit() {
        var text = $("#placeInput").val();
        // Search for entered place
        this.searchLocationByName(text, this.map.getCoordinatesAtCenter().latitude, this.map.getCoordinatesAtCenter().longitude)
            .then((locations) => {
                if (locations.features.length > 0) {
                    this.map.displayPlace(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0], 14, 1007);
                    this.map.clearPlaceMark();
                    this.map.markPlaceByGPS(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0]);
                    $("#detailedInfoCard > li:eq(0)").fadeIn(1000);
                    $("#placeName").html(locations.features[0].properties.name);
                    $("#placeRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                    $("#placeGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(4) + ", " + locations.features[0].geometry.coordinates[0].toFixed(4) + "]");

                    this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                        .then((weather) => {
                            this.setWeather(weather);
                            $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                        });
                    this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                        .then((forecast) => {
                            this.setForecast(forecast);
                            $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                        })
                }
            });
            
    }

    private handlePathPointSearch(evt: any) {
        var text = $("#placeInput").val();
        // Search for entered place
        this.searchLocationByName(text)
            .then((locations) => {
                if (locations.features.length > 0) {
                    this.map.displayPlace(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0], 14, 1007);
                    $("#detailedInfoCard > li:eq(0)").fadeIn(1000);
                    $("#placeName").html(locations.features[0].properties.name);
                    $("#placeRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                    $("#placeGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(4) + ", " + locations.features[0].geometry.coordinates[0].toFixed(4) + "]");

                    this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                        .then((weather) => {
                            this.setWeather(weather);
                            $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                        });
                    this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                        .then((forecast) => {
                            this.setForecast(forecast);
                            $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                        })
                }
            });

    }

    public displayMarkedPointInfo(lat: number, lon: number) {
        this.searchLocationByCoords(lat, lon)
            .then((locations) => {
                if (locations.features.length > 0) {
                    $("#InfoCardButton").click();
                    $("#detailedInfoCard > li:eq(0)").fadeIn(400);
                    $("#placeName").html(locations.features[0].properties.name);
                    $("#placeRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                    $("#placeGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(4) + ", " + locations.features[0].geometry.coordinates[0].toFixed(4) + "]");

                    this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                        .then((weather) => {
                            this.setWeather(weather);
                            $("#detailedInfoCard > li:eq(1)").fadeIn(400);
                        });
                    this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                        .then((forecast) => {
                            this.setForecast(forecast);
                            $("#detailedInfoCard > li:eq(1)").fadeIn(400);
                        })
                }
            });
    }

    public hideMarkedPointInfo() {
        $("#detailedInfoCard > li").fadeOut(250);
    }

    public addPathPoint() {
        var routePointCount = $("#routePointsList").children(".routePoint").length;
        if (routePointCount > 0) {
            $("#routePointsList").children(".routePoint").eq(routePointCount - 1)
                    .append($("<img>", { "class": "routePointDots", "src": "./Resources/point_dots.png" }))
        }
        var pathPointItem =
            $("<li>", { "class": "routePoint" })
                .append($("<img>", { "class": "routePointIcon", "src": "./Resources/point.png" }))
                .append($("<input>", { "class": "routePointInput", "autocomplete": "on", "list": "routePointDatalist" })
                    .on("keyup", (evt) => {
                        var text = $(evt.currentTarget).val();
                        var coords = this.map.getCoordinatesAtCenter();
                        this.fetchSuggestions(text, coords.latitude, coords.longitude)
                            .then((suggestions) => {
                                this.setSuggestions(suggestions, $("#routePointDatalist"));
                            });
                    })
                    .focusin((evt) => {
                        if ($(".routePoint").length <= 2) {
                            return;
                        }
                        $(evt.currentTarget).siblings(".deletePointIcon").fadeIn(100);
                    })
                    .focusout((evt) => { $(evt.currentTarget).siblings(".deletePointIcon").fadeOut(100); })
                    .focus())
                .append($("<img>", { "class": "deletePointIcon", "src": "./Resources/delete.png" })
                    .click((evt) => {
                        var selectedPoint = $(evt.currentTarget).parents(".routePoint");
                        if ($(".routePoint").length == $(selectedPoint).index()) {
                            $("#routePointsList > .routePoint").eq($(selectedPoint).index() - 2).children(".routePointDots").remove();  
                        }
                        $(evt.currentTarget).parents(".routePoint").remove();
                    }));

        $(pathPointItem).children(".routePointInput").focusout();
        $("#routePointsList")
            .append(pathPointItem);
            
    }

    private handleFindRouteEvent() {
        this.map.clearPathPoints();
        var searchedPointsCount = 0;

        // Fill with empty data, so we can put value returned from async search into right index (to keep items in right order).
        var pathPoints = $(".routePointInput");
        this.pathPointsGPS = new Array();
        for (var i = 0; i < pathPoints.length; i++) {
            this.pathPointsGPS.push({ lat: null, lon: null });
        }
        var focus = this.map.getCoordinatesAtCenter();
        // Labels are initialy put into array so we can check order of route points in async function bellow
        for (var i = 0; i < pathPoints.length; i++) {
            this.searchLocationByName(pathPoints.eq(i).val(), focus.latitude, focus.longitude)
                .then((locations) => {
                    searchedPointsCount++;
                    for (var j = 0; j < pathPoints.length; j++) {
                        if (locations.geocoding.query.text == $(pathPoints[j]).val()) {
                            this.pathPointsGPS.splice(j,1,({
                                lat: locations.features[0].geometry.coordinates[1],
                                lon: locations.features[0].geometry.coordinates[0]
                            }));
                        }
                    }

                    // Checks if route will be visible on map, if not, zooms out
                    var currentMapGPS = this.map.getCoordinatesAtCenter();
                    for (var j = this.map.currentZoom; j > 1; j--)
                    {
                        if (this.map.areGPSonScreen(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0])) {
                            break;
                        }
                        else { this.map.displayPlace(currentMapGPS.latitude, currentMapGPS.longitude, j, this.map.currentLayers); }
                    }

                    if (pathPoints.length == searchedPointsCount)
                    {
                        for (var j = 0; j < this.pathPointsGPS.length; j++) {
                            this.map.markPathPointByGPS(this.pathPointsGPS[j].lat, this.pathPointsGPS[j].lon);
                        }
                        if (this.carType) { this.map.fetchRoute(this.pathPointsGPS, "auto"); }
                        else if (this.bicycleType) { this.map.fetchRoute(this.pathPointsGPS, "bicycle"); }
                        else { this.map.fetchRoute(this.pathPointsGPS, "pedestrian"); }
                        $("#RouteCardButton").click();
                    }
                })
        }
    }

    private handleNavigateMeButtonEvent() {
        navigator.geolocation.getCurrentPosition((userLocation) => {
            var currentMapGPS = this.map.getCoordinatesAtCenter();
            // Zoom out if route isnt visible on map as whole
            for (var i = this.map.currentZoom; i > 1; i--) {
                if (this.map.areGPSonScreen(userLocation.coords.latitude, userLocation.coords.longitude)) {
                    break;
                }
                else { this.map.displayPlace(currentMapGPS.latitude, currentMapGPS.longitude, i, this.map.currentLayers); }
            }

            var placeMarkLocation = this.map.getPlaceMarkGPS();
            this.pathPointsGPS = new Array();
            this.pathPointsGPS.push({ lat: userLocation.coords.latitude, lon: userLocation.coords.longitude });
            this.pathPointsGPS.push({ lat: placeMarkLocation.lat, lon: placeMarkLocation.lon });

            // Fetch location name to fill routePoints inputs
            this.searchLocationByCoords(userLocation.coords.latitude, userLocation.coords.longitude)
                .then((locationName) => {
                    if (locationName.features[0]) {
                        $(".routePoint").eq(0).children(".routePointInput").val(locationName.features[0].properties.label);
                    }
                });
            this.searchLocationByCoords(placeMarkLocation.lat, placeMarkLocation.lon)
                .then((locationName) => {
                    if (locationName.features[0]) {
                        $(".routePoint").eq(1).children(".routePointInput").val(locationName.features[0].properties.label);
                    }
                });

            this.map.clearPathPoints();
            this.map.clearPlaceMark();
            this.map.shiftMap(0, 0);
            this.map.markPathPointByGPS(userLocation.coords.latitude, userLocation.coords.longitude);
            this.map.markPathPointByGPS(placeMarkLocation.lat, placeMarkLocation.lon);

            if (this.carType) { this.map.fetchRoute(this.pathPointsGPS, "auto"); }
            else if (this.bicycleType) { this.map.fetchRoute(this.pathPointsGPS, "bicycle"); }
            else { this.map.fetchRoute(this.pathPointsGPS, "pedestrian"); }

            $("#RouteCardButton").click();
        })
    }
}