var MapSearchingPanel = (function () {
    function MapSearchingPanel(map) {
        var _this = this;
        this.suggestionsList = [];
        this.root = $("#mapPanel");
        this.map = map;
        // Input for searching places
        var placeInput = $("<input>", {
            "id": "placeInput",
            "type": "text",
            "placeholder": "Type to find places...",
            "autocomplete": "on",
            "list": "suggestionList"
        })
            .on("keyup", this.throttle(function () {
            var text = $("#placeInput").val();
            var coords = _this.map.getCoordinatesAtCenter();
            _this.fetchSuggestions(text, coords.latitude, coords.longitude)
                .then(function (suggestions) {
                _this.setSuggestions(suggestions);
            });
        }, 250));
        // List of suggested places
        var suggestionList = $("<datalist>", { "id": "suggestionList" });
        // Submit button
        var placeSubmit = $("<button>", {
            "id": "placeSubmit", "type": "button"
        })
            .on("click", function () {
            _this.handleSearchSubmit();
        })
            .append($("<img>", { "src": "./Resources/search.png" })
            .css({
            "height": "20px",
            "width": "20px",
            "vertical-align": "middle"
        }));
        var placeDiv = $("<div>").css({
            "width": "95%",
            "margin": "10px auto",
        })
            .append($("<form>").submit(function (e) {
            e.preventDefault();
            _this.handleSearchSubmit();
        })
            .append(placeInput)
            .append(suggestionList)
            .append(placeSubmit));
        var detailedInfo = $("<div>", { "id": "detailedInfo" });
        // Place details
        detailedInfo.append($("<div>", { "class": "detailedInfoSegment" })
            .append($("<div>", { "id": "PlaceName" }))
            .append($("<div>", { "id": "PlaceDetails" })
            .append($("<div>", { "id": "PlaceRegionCountry" }))
            .append($("<div>", { "id": "PlaceGPS" }))));
        var forecastList = $("<ul>", { "id": "list-forecast" });
        // Weather
        detailedInfo.append($("<div>", { "class": "detailedInfoSegment" })
            .append($("<button>", { "id": "weatherButton" }).text("Weather")
            .on("click", function () {
            $("#list-forecast").css("display", "none");
            $("#table-weather").css("display", "table");
        }))
            .append($("<button>", { "id": "forecastButton" }).text("Forecast")
            .on("click", function () {
            $("#table-weather").css("display", "none");
            $("#list-forecast").css("display", "block");
        }))
            .append($("<table>", { "id": "table-weather" })
            .append($("<tr>")
            .append($("<td>", { "id": "weatherImg" }).append($("<img>")))
            .append($("<td>", { "id": "weatherTemperature" })))
            .append($("<tr>")
            .append($("<td>", { "id": "windLabel" }))
            .append($("<td>", { "id": "wind", "colspan": "2" })))
            .append($("<tr>")
            .append($("<td>", { "id": "humidityLabel" }))
            .append($("<td>", { "id": "humidity", "colspan": "2" })))
            .append($("<tr>")
            .append($("<td>", { "id": "pressureLabel" }))
            .append($("<td>", { "id": "pressure", "colspan": "2" }))))
            .append(forecastList));
        // Forecast
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
        this.root
            .append(placeDiv)
            .append(detailedInfo);
        $(".detailedInfoSegment").fadeOut(1);
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
    MapSearchingPanel.prototype.searchLocationByName = function (place) {
        var fetchURL = "https://search.mapzen.com/v1/search?" + "api_key=mapzen-eES7bmW&text=" + place + "&size=1";
        ;
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
    MapSearchingPanel.prototype.setSuggestions = function (suggestions) {
        // Refreshing suggestion list
        $("#suggestionList").empty();
        for (var i = 0; i < suggestions.features.length; i++) {
            if (suggestions.features[i].properties.label != undefined) {
                $("#suggestionList").append($("<option>", { "value": suggestions.features[i].properties.label }));
            }
        }
    };
    MapSearchingPanel.prototype.handleSearchSubmit = function () {
        var _this = this;
        var text = $("#placeInput").val();
        var coords = this.map.getCoordinatesAtCenter();
        // Search for entered place
        this.searchLocationByName(text)
            .then(function (locations) {
            _this.map.displayPlace(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0], 14, 1007);
            $(".detailedInfoSegment:eq(0)").fadeIn(1000);
            $("#PlaceName").html(locations.features[0].properties.name);
            $("#PlaceRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
            $("#PlaceGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(2) + ", " + locations.features[0].geometry.coordinates[0].toFixed(2) + "]");
            _this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                .then(function (weather) {
                _this.setWeather(weather);
                $(".detailedInfoSegment:eq(1)").fadeIn(1500);
            });
            _this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                .then(function (forecast) {
                _this.setForecast(forecast);
                $(".detailedInfoSegment:eq(1)").fadeIn(1500);
            });
        });
    };
    return MapSearchingPanel;
})();
//# sourceMappingURL=MapSearchingPanel.js.map