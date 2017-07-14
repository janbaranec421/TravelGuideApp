var MapSearchingPanel = (function () {
    function MapSearchingPanel(map) {
        var _this = this;
        this.suggestionsList = [];
        this.root = $("#mapPanel");
        this.map = map;
        // First part - search input
        var searchInputPart = $("<li>", { "class": "mapPanelContentItem" })
            .append($("<form>", { "id": "placeSearchForm" }).submit(function (e) {
            e.preventDefault();
            _this.handleSearchSubmit();
        })
            .append($("<input>", { "id": "placeInput", "type": "text", "placeholder": "Type to find places...", "autocomplete": "on", "list": "suggestionList" })
            .on("keyup", this.throttle(function () {
            var text = $("#placeInput").val();
            var coords = _this.map.getCoordinatesAtCenter();
            _this.fetchSuggestions(text, coords.latitude, coords.longitude)
                .then(function (suggestions) {
                _this.setSuggestions(suggestions, $("#suggestionList"));
            });
        }, 250)))
            .append($("<datalist>", { "id": "suggestionList" }))
            .append($("<button>", { "id": "placeSubmit", "type": "button" })
            .on("click", function () { _this.handleSearchSubmit(); })
            .append($("<img>", { "src": "./Resources/search.png" })
            .css({
            "height": "20px",
            "width": "20px",
            "vertical-align": "middle"
        }))));
        var forecastList = ($("<ul>", { "id": "forecastList" }));
        var detailedInfoPart = $("<li>", { "class": "mapPanelContentItem" }).css({ "height": "calc(100% - 46px)" })
            .append($("<button>", { "id": "InfoCardButton" }).text("Info")
            .click(function () {
            $("#InfoCardButton").removeClass("notSelectedCardButton").addClass("SelectedCardButton");
            $("#WeatherCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
            $("#RouteCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
            $("#detailedInfoCard").css({ "display": "block" });
            $("#weatherCard").css({ "display": "none" });
            $("#routeCard").css({ "display": "none" });
        }))
            .append($("<button>", { "id": "WeatherCardButton" }).text("Weather")
            .click(function () {
            $("#WeatherCardButton").removeClass("notSelectedCardButton").addClass("SelectedCardButton");
            $("#InfoCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
            $("#RouteCardButton").removeClass("SelectedCardButton").addClass("notSelectedCardButton");
            $("#weatherCard").css({ "display": "block" });
            $("#detailedInfoCard").css({ "display": "none" });
            $("#routeCard").css({ "display": "none" });
        }))
            .append($("<button>", { "id": "RouteCardButton" }).text("Route")
            .click(function () {
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
            .click(function () {
            _this.handleNavigateMeButtonEvent();
        }))))
            .append($("<ul>", { "id": "weatherCard" })
            .append($("<li>").css({ "height": "calc(100% - 30px)", "margin": "0% 2%", "padding": "15px 5px" })
            .append($("<button>", { "id": "weatherButton" }).text("Weather")
            .on("click", function () {
            $("#forecastList").css("display", "none");
            $("#weatherTable").css("display", "table");
        }))
            .append($("<button>", { "id": "forecastButton" }).text("Forecast")
            .on("click", function () {
            $("#weatherTable").css("display", "none");
            $("#forecastList").css("display", "block");
        }))
            .append($("<table>", { "id": "weatherTable" })
            .append($("<tr>")
            .append($("<td>", { "id": "weatherImg" }).append($("<img>")))
            .append($("<td>", { "id": "weatherTemperature" })))
            .append($("<tr>")
            .append($("<td>", { "id": "windLabel" }))
            .append($("<td>", { "id": "wind" })))
            .append($("<tr>")
            .append($("<td>", { "id": "humidityLabel" }))
            .append($("<td>", { "id": "humidity" })))
            .append($("<tr>")
            .append($("<td>", { "id": "pressureLabel" }))
            .append($("<td>", { "id": "pressure" }))))
            .append(forecastList)))
            .append($("<ul>", { "id": "routeCard" })
            .append($("<li>").css({ "min-height": "75px", "height": "calc(100% - 30px)", "padding": "15px 5px" })
            .append($("<img>", { "class": "routeTravelTypeIcon", "src": "./Resources/car.png" })
            .click(function (evt) {
            _this.bicycleType = false;
            _this.carType = true;
            _this.pedestrianType = false;
            $(".routeTravelTypeIcon").css({ "box-shadow": "none", "background": "#e8e8e8 " });
            $(evt.currentTarget).css({ "box-shadow": "0px 0px 4px 1px rgb(150, 147, 141) ", "background": "rgb(232, 232, 232)" });
            if (_this.pathPointsGPS) {
                _this.map.clearPathPoints();
                _this.map.shiftMap(0, 0);
                // If any route point input is empty, highlight it to user
                var inputs = $(".routePointInput");
                var notEmptyCount = 0;
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs).eq(i).val() == '') {
                        $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                            .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function (evt) {
                            $(evt.currentTarget).css("animation", "none");
                        });
                    }
                    else {
                        notEmptyCount++;
                    }
                }
                if (notEmptyCount == inputs.length) {
                    _this.handleFindRouteEvent();
                }
            }
        }))
            .append($("<img>", { "class": "routeTravelTypeIcon", "src": "./Resources/bicycle.png" })
            .click(function (evt) {
            _this.bicycleType = true;
            _this.carType = false;
            _this.pedestrianType = false;
            $(".routeTravelTypeIcon").css({ "box-shadow": "none", "background": "#e8e8e8 " });
            $(evt.currentTarget).css({ "box-shadow": "0px 0px 4px 1px rgb(150, 147, 141) ", "background": "rgb(232, 232, 232)" });
            if (_this.pathPointsGPS) {
                _this.map.clearPathPoints();
                _this.map.shiftMap(0, 0);
                // If any route point input is empty, highlight it to user
                var inputs = $(".routePointInput");
                var notEmptyCount = 0;
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs).eq(i).val() == '') {
                        $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                            .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function (evt) {
                            $(evt.currentTarget).css("animation", "none");
                        });
                    }
                    else {
                        notEmptyCount++;
                    }
                }
                if (notEmptyCount == inputs.length) {
                    _this.handleFindRouteEvent();
                }
            }
        }))
            .append($("<img>", { "class": "routeTravelTypeIcon", "src": "./Resources/pedestrian.png" })
            .click(function (evt) {
            _this.bicycleType = false;
            _this.carType = false;
            _this.pedestrianType = true;
            $(".routeTravelTypeIcon").css({ "box-shadow": "none", "background": "#e8e8e8 " });
            $(evt.currentTarget).css({ "box-shadow": "0px 0px 4px 1px rgb(150, 147, 141) ", "background": "rgb(232, 232, 232)" });
            if (_this.pathPointsGPS) {
                _this.map.clearPathPoints();
                _this.map.shiftMap(0, 0);
                // If any route point input is empty, highlight it to user
                var inputs = $(".routePointInput");
                var notEmptyCount = 0;
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs).eq(i).val() == '') {
                        $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                            .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function (evt) {
                            $(evt.currentTarget).css("animation", "none");
                        });
                    }
                    else {
                        notEmptyCount++;
                    }
                }
                if (notEmptyCount == inputs.length) {
                    _this.handleFindRouteEvent();
                }
            }
        }))
            .append($("<ul>", { "id": "routePointsList" })
            .append($("<datalist>", { "id": "routePointDatalist" })))
            .append($("<div>", { "class": "routeDetailInfo" }))
            .append($("<button>", { "class": "routeButton" }).text("Add Point")
            .click(function () {
            _this.addPathPoint();
        }))
            .append($("<button>", { "class": "routeButton" }).text("Find route")
            .click(function () {
            _this.map.clearPathPoints();
            _this.map.shiftMap(0, 0);
            // If any route point input is empty, highlight it to user
            var inputs = $(".routePointInput");
            var notEmptyCount = 0;
            for (var i = 0; i < inputs.length; i++) {
                if ($(inputs).eq(i).val() == '') {
                    $(inputs).eq(i).css("animation", "routePoint-highlight 2s")
                        .on("webkitAnimationEnd oanimationend msAnimationEnd animationend", function (evt) {
                        $(evt.currentTarget).css("animation", "none");
                    });
                }
                else {
                    notEmptyCount++;
                }
            }
            if (notEmptyCount == inputs.length) {
                _this.handleFindRouteEvent();
            }
        }))));
        // Fill forecast data
        for (var i = 0; i < 4; i++) {
            $(forecastList).append($("<table>")
                .append($("<tr>")
                .append($("<td>", { "class": "forecastDate", "colspan": "2" })))
                .append($("<tr>")
                .append($("<td>", { "class": "forecastImg" })
                .append($("<img>")))
                .append($("<td>", { "class": "forecastTempExtremes" })
                .append($("<div>"))
                .append($("<div>")))
                .append($("<td>", { "class": "forecastDescription" })))
                .append($("<tr>")
                .append($("<td>", { "class": "forecastWind" }))
                .append($("<td>", { "class": "forecastHumidity" }))
                .append($("<td>", { "class": "forecastPressure" }))));
        }
        // Initial route point for route tab
        // FIRST ROUTE POINT
        var pathPointItemFirst = $("<li>", { "class": "routePoint" })
            .append($("<img>", { "class": "routePointIcon", "src": "./Resources/point.png" }))
            .append($("<input>", { "class": "routePointInput", "autocomplete": "on", "list": "routePointDatalist" })
            .on("keyup", function (evt) {
            var text = $(evt.currentTarget).val();
            var coords = _this.map.getCoordinatesAtCenter();
            _this.fetchSuggestions(text, coords.latitude, coords.longitude)
                .then(function (suggestions) {
                _this.setSuggestions(suggestions, $("#routePointDatalist"));
            });
        })
            .focusin(function (evt) {
            if ($(".routePoint").length <= 2) {
                return;
            }
            $(evt.currentTarget).siblings(".deletePointIcon").fadeIn(100);
        })
            .focusout(function (evt) {
            $(evt.currentTarget).siblings(".deletePointIcon").fadeOut(100);
        })
            .focus())
            .append($("<img>", { "class": "deletePointIcon", "src": "./Resources/delete.png" })
            .click(function (evt) {
            var selectedPoint = $(evt.currentTarget).parents(".routePoint");
            if ($(".routePoint").length == $(selectedPoint).index()) {
                $("#routePointsList > .routePoint").eq($(selectedPoint).index() - 2).children(".routePointDots").remove();
            }
            $(evt.currentTarget).parents(".routePoint").remove();
        }))
            .append($("<img>", { "class": "routePointDots", "src": "./Resources/point_dots.png" }));
        // SECOND ROUTE POINT
        var pathPointItemSecond = $("<li>", { "class": "routePoint" })
            .append($("<img>", { "class": "routePointIcon", "src": "./Resources/point.png" }))
            .append($("<input>", { "class": "routePointInput", "autocomplete": "on", "list": "routePointDatalist" })
            .on("keyup", function (evt) {
            var text = $(evt.currentTarget).val();
            var coords = _this.map.getCoordinatesAtCenter();
            _this.fetchSuggestions(text, coords.latitude, coords.longitude)
                .then(function (suggestions) {
                _this.setSuggestions(suggestions, $("#routePointDatalist"));
            });
        })
            .focusin(function (evt) {
            if ($(".routePoint").length <= 2) {
                return;
            }
            $(evt.currentTarget).siblings(".deletePointIcon").fadeIn(100);
        })
            .focusout(function (evt) {
            $(evt.currentTarget).siblings(".deletePointIcon").fadeOut(100);
        })
            .focus())
            .append($("<img>", { "class": "deletePointIcon", "src": "./Resources/delete.png" })
            .click(function (evt) {
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
            .append(detailedInfoPart));
        $("#InfoCardButton").click();
        $("#weatherButton").click();
        $(".routeTravelTypeIcon").eq(0).click();
    }
    MapSearchingPanel.prototype.throttle = function (fn, delay) {
        var wait = false;
        return function () {
            if (!wait) {
                fn();
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, delay);
            }
        };
    };
    MapSearchingPanel.prototype.searchLocationByName = function (place, focusLat, focusLon) {
        if (focusLat === void 0) { focusLat = null; }
        if (focusLon === void 0) { focusLon = null; }
        var fetchURL = "https://search.mapzen.com/v1/search?" + "api_key=mapzen-eES7bmW&text=" + place + "&size=1";
        if (focusLat & focusLon) {
            fetchURL += "&focus.point.lat=" + focusLat + "&focus.point.lon=" + focusLon;
        }
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
    MapSearchingPanel.prototype.searchLocationByCoords = function (latitude, longitude) {
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
    MapSearchingPanel.prototype.fetchSuggestions = function (place, focusLat, focusLon) {
        if (focusLat === void 0) { focusLat = 0; }
        if (focusLon === void 0) { focusLon = 0; }
        var fetchURL = "https://search.mapzen.com/v1/autocomplete?api_key=mapzen-eES7bmW&layers=locality&";
        if (focusLat > 0 && focusLon > 0) {
            fetchURL += "focus.point.lat=" + focusLat.toFixed(3) + "&focus.point.lon=" + focusLon.toFixed(3);
        }
        fetchURL += "&text=" + place;
        return new Promise(function (resolve, reject) {
            $.getJSON(fetchURL, function (suggestions) {
                if (suggestions) {
                    resolve(suggestions);
                }
                else {
                    reject("Error fetching suggestions");
                }
            });
        });
    };
    MapSearchingPanel.prototype.fetchWeather = function (placeName, country) {
        if (country === void 0) { country = null; }
        var fetchURL = "http://api.openweathermap.org/data/2.5/weather?q=" + placeName;
        if (country) {
            fetchURL += "," + country;
        }
        fetchURL += "&units=metric&appid=57cf72874229f081c28596f80a572323";
        return new Promise(function (resolve, reject) {
            $.getJSON(fetchURL, function (locations) {
                locations ? resolve(locations) : reject();
            });
        });
    };
    MapSearchingPanel.prototype.fetchForecast = function (placeName, country) {
        if (country === void 0) { country = null; }
        var fetchURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + placeName;
        if (country) {
            fetchURL += "," + country;
        }
        fetchURL += "&units=metric&appid=57cf72874229f081c28596f80a572323";
        return new Promise(function (resolve, reject) {
            $.getJSON(fetchURL, function (locations) {
                locations ? resolve(locations) : reject();
            });
        });
    };
    MapSearchingPanel.prototype.setWeather = function (weather) {
        $("#weatherImg > img").attr("src", "./Resources/forecast/" + weather.weather[0].icon + ".png");
        $("#weatherTemperature").text(weather.main.temp.toFixed(0) + "°C");
        $("#windLabel").text("Wind: ");
        $("#wind").text(weather.wind.speed + " m/s  ");
        $("#humidityLabel").text("Humidity: ");
        $("#humidity").text(weather.main.humidity + " %");
        $("#pressureLabel").text("Pressure: ");
        $("#pressure").text(weather.main.pressure + " hpa");
    };
    MapSearchingPanel.prototype.setForecast = function (forecast) {
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
    };
    MapSearchingPanel.prototype.setSuggestions = function (suggestions, list) {
        // Refreshing suggestion list
        $(list).empty();
        for (var i = 0; i < suggestions.features.length; i++) {
            if (suggestions.features[i].properties.label != undefined) {
                $(list).append($("<option>", { "value": suggestions.features[i].properties.label }));
            }
        }
    };
    MapSearchingPanel.prototype.handleSearchSubmit = function () {
        var _this = this;
        var text = $("#placeInput").val();
        // Search for entered place
        this.searchLocationByName(text, this.map.getCoordinatesAtCenter().latitude, this.map.getCoordinatesAtCenter().longitude)
            .then(function (locations) {
            if (locations.features.length > 0) {
                _this.map.displayPlace(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0], 14, 1007);
                _this.map.clearPlaceMark();
                _this.map.markPlaceByGPS(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0]);
                $("#detailedInfoCard > li:eq(0)").fadeIn(1000);
                $("#placeName").html(locations.features[0].properties.name);
                $("#placeRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                $("#placeGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(4) + ", " + locations.features[0].geometry.coordinates[0].toFixed(4) + "]");
                _this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then(function (weather) {
                    _this.setWeather(weather);
                    $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                });
                _this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then(function (forecast) {
                    _this.setForecast(forecast);
                    $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                });
            }
        });
    };
    MapSearchingPanel.prototype.handlePathPointSearch = function (evt) {
        var _this = this;
        var text = $("#placeInput").val();
        // Search for entered place
        this.searchLocationByName(text)
            .then(function (locations) {
            if (locations.features.length > 0) {
                _this.map.displayPlace(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0], 14, 1007);
                $("#detailedInfoCard > li:eq(0)").fadeIn(1000);
                $("#placeName").html(locations.features[0].properties.name);
                $("#placeRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                $("#placeGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(4) + ", " + locations.features[0].geometry.coordinates[0].toFixed(4) + "]");
                _this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then(function (weather) {
                    _this.setWeather(weather);
                    $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                });
                _this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then(function (forecast) {
                    _this.setForecast(forecast);
                    $("#detailedInfoCard > li:eq(1)").fadeIn(1500);
                });
            }
        });
    };
    MapSearchingPanel.prototype.displayMarkedPointInfo = function (lat, lon) {
        var _this = this;
        this.searchLocationByCoords(lat, lon)
            .then(function (locations) {
            if (locations.features.length > 0) {
                $("#InfoCardButton").click();
                $("#detailedInfoCard > li:eq(0)").fadeIn(400);
                $("#placeName").html(locations.features[0].properties.name);
                $("#placeRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                $("#placeGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(4) + ", " + locations.features[0].geometry.coordinates[0].toFixed(4) + "]");
                _this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then(function (weather) {
                    _this.setWeather(weather);
                    $("#detailedInfoCard > li:eq(1)").fadeIn(400);
                });
                _this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then(function (forecast) {
                    _this.setForecast(forecast);
                    $("#detailedInfoCard > li:eq(1)").fadeIn(400);
                });
            }
        });
    };
    MapSearchingPanel.prototype.hideMarkedPointInfo = function () {
        $("#detailedInfoCard > li").fadeOut(250);
    };
    MapSearchingPanel.prototype.addPathPoint = function () {
        var _this = this;
        var routePointCount = $("#routePointsList").children(".routePoint").length;
        if (routePointCount > 0) {
            $("#routePointsList").children(".routePoint").eq(routePointCount - 1)
                .append($("<img>", { "class": "routePointDots", "src": "./Resources/point_dots.png" }));
        }
        var pathPointItem = $("<li>", { "class": "routePoint" })
            .append($("<img>", { "class": "routePointIcon", "src": "./Resources/point.png" }))
            .append($("<input>", { "class": "routePointInput", "autocomplete": "on", "list": "routePointDatalist" })
            .on("keyup", function (evt) {
            var text = $(evt.currentTarget).val();
            var coords = _this.map.getCoordinatesAtCenter();
            _this.fetchSuggestions(text, coords.latitude, coords.longitude)
                .then(function (suggestions) {
                _this.setSuggestions(suggestions, $("#routePointDatalist"));
            });
        })
            .focusin(function (evt) {
            if ($(".routePoint").length <= 2) {
                return;
            }
            $(evt.currentTarget).siblings(".deletePointIcon").fadeIn(100);
        })
            .focusout(function (evt) { $(evt.currentTarget).siblings(".deletePointIcon").fadeOut(100); })
            .focus())
            .append($("<img>", { "class": "deletePointIcon", "src": "./Resources/delete.png" })
            .click(function (evt) {
            var selectedPoint = $(evt.currentTarget).parents(".routePoint");
            if ($(".routePoint").length == $(selectedPoint).index()) {
                $("#routePointsList > .routePoint").eq($(selectedPoint).index() - 2).children(".routePointDots").remove();
            }
            $(evt.currentTarget).parents(".routePoint").remove();
        }));
        $(pathPointItem).children(".routePointInput").focusout();
        $("#routePointsList")
            .append(pathPointItem);
    };
    MapSearchingPanel.prototype.handleFindRouteEvent = function () {
        var _this = this;
        this.map.clearPathPoints();
        var searchedPointsCount = 0;
        // Fill with empty data, so we can put value returned from async search into right index (to keep items in right order).
        var pathPoints = $(".routePointInput");
        this.pathPointsGPS = new Array();
        for (var i = 0; i < pathPoints.length; i++) {
            this.pathPointsGPS.push({ lat: null, lon: null });
        }
        // Labels are initialy put into array so we can check order of route points in async function bellow
        for (var i = 0; i < pathPoints.length; i++) {
            this.searchLocationByName(pathPoints.eq(i).val())
                .then(function (locations) {
                searchedPointsCount++;
                for (var j = 0; j < pathPoints.length; j++) {
                    if (locations.geocoding.query.text == $(pathPoints[j]).val()) {
                        _this.pathPointsGPS.splice(j, 1, ({
                            lat: locations.features[0].geometry.coordinates[1],
                            lon: locations.features[0].geometry.coordinates[0]
                        }));
                    }
                }
                // Checks if route will be visible on map, if not, zooms out
                var currentMapGPS = _this.map.getCoordinatesAtCenter();
                for (var j = _this.map.currentZoom; j > 1; j--) {
                    if (_this.map.areGPSonScreen(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0])) {
                        break;
                    }
                    else {
                        _this.map.displayPlace(currentMapGPS.latitude, currentMapGPS.longitude, j, _this.map.currentLayers);
                    }
                }
                if (pathPoints.length == searchedPointsCount) {
                    for (var j = 0; j < _this.pathPointsGPS.length; j++) {
                        _this.map.markPathPointByGPS(_this.pathPointsGPS[j].lat, _this.pathPointsGPS[j].lon);
                    }
                    if (_this.carType) {
                        _this.map.fetchRoute(_this.pathPointsGPS, "auto");
                    }
                    else if (_this.bicycleType) {
                        _this.map.fetchRoute(_this.pathPointsGPS, "bicycle");
                    }
                    else {
                        _this.map.fetchRoute(_this.pathPointsGPS, "pedestrian");
                    }
                    $("#RouteCardButton").click();
                }
            });
        }
    };
    MapSearchingPanel.prototype.handleNavigateMeButtonEvent = function () {
        var _this = this;
        navigator.geolocation.getCurrentPosition(function (userLocation) {
            var currentMapGPS = _this.map.getCoordinatesAtCenter();
            // Zoom out if route isnt visible on map as whole
            for (var i = _this.map.currentZoom; i > 1; i--) {
                if (_this.map.areGPSonScreen(userLocation.coords.latitude, userLocation.coords.longitude)) {
                    break;
                }
                else {
                    _this.map.displayPlace(currentMapGPS.latitude, currentMapGPS.longitude, i, _this.map.currentLayers);
                }
            }
            var placeMarkLocation = _this.map.getPlaceMarkGPS();
            _this.pathPointsGPS = new Array();
            _this.pathPointsGPS.push({ lat: userLocation.coords.latitude, lon: userLocation.coords.longitude });
            _this.pathPointsGPS.push({ lat: placeMarkLocation.lat, lon: placeMarkLocation.lon });
            // Fetch location name to fill routePoints inputs
            _this.searchLocationByCoords(userLocation.coords.latitude, userLocation.coords.longitude)
                .then(function (locationName) {
                if (locationName.features[0]) {
                    $(".routePoint").eq(0).children(".routePointInput").val(locationName.features[0].properties.label);
                }
            });
            _this.searchLocationByCoords(placeMarkLocation.lat, placeMarkLocation.lon)
                .then(function (locationName) {
                if (locationName.features[0]) {
                    $(".routePoint").eq(1).children(".routePointInput").val(locationName.features[0].properties.label);
                }
            });
            _this.map.clearPathPoints();
            _this.map.clearPlaceMark();
            _this.map.shiftMap(0, 0);
            _this.map.markPathPointByGPS(userLocation.coords.latitude, userLocation.coords.longitude);
            _this.map.markPathPointByGPS(placeMarkLocation.lat, placeMarkLocation.lon);
            if (_this.carType) {
                _this.map.fetchRoute(_this.pathPointsGPS, "auto");
            }
            else if (_this.bicycleType) {
                _this.map.fetchRoute(_this.pathPointsGPS, "bicycle");
            }
            else {
                _this.map.fetchRoute(_this.pathPointsGPS, "pedestrian");
            }
            $("#RouteCardButton").click();
        });
    };
    return MapSearchingPanel;
})();
//# sourceMappingURL=MapSearchingPanel.js.map