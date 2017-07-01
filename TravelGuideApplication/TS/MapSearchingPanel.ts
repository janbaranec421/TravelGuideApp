class MapSearchingPanel {
    public root: JQuery;
    public map: Map;
    public suggestionsList: Array<any> = [];

    constructor(map: Map) {
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
            .on("keyup", this.throttle(() => {
                var text = $("#placeInput").val();
                var coords = this.map.getCoordinatesAtCenter();
                this.fetchSuggestions(text, coords.latitude, coords.longitude)
                    .then((suggestions) => {
                        this.setSuggestions(suggestions);
                    })
            }, 250));

        // List of suggested places
        var suggestionList = $("<datalist>", { "id": "suggestionList" });
        // Submit button
        var placeSubmit = $("<button>", {
            "id": "placeSubmit", "type": "button"
        })
            .on("click", () => {
                this.handleSearchSubmit();
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
            .append($("<form>").submit((e) => {
                e.preventDefault();
                this.handleSearchSubmit();
            })
                .append(placeInput)
                .append(suggestionList)
                .append(placeSubmit));

        var detailedInfo = $("<div>", { "id": "detailedInfo" });
        // Place details
        detailedInfo.append($("<div>", { "class": "detailedInfoSegment" })
            .append($("<div>", { "id": "PlaceName" })
            )
            .append($("<div>", { "id": "PlaceDetails" })
                .append($("<div>", { "id": "PlaceRegionCountry" })
                )
                .append($("<div>", { "id": "PlaceGPS" })
                )
            )
        );
        var forecastList = $("<ul>", { "id": "list-forecast" });
        // Weather
        detailedInfo.append($("<div>", { "class": "detailedInfoSegment" })
            .append($("<button>", { "id": "weatherButton" }).text("Weather")
                .on("click", () => {
                    $("#list-forecast").css("display", "none");
                    $("#table-weather").css("display", "table");
                })
            )
            .append($("<button>", { "id": "forecastButton" }).text("Forecast")
                .on("click", () => {
                    $("#table-weather").css("display", "none");
                    $("#list-forecast").css("display", "block");
                })
            )
            .append($("<table>", { "id": "table-weather" })
                .append($("<tr>")
                    .append($("<td>", { "id": "weatherImg" }).append($("<img>")))
                    .append($("<td>", { "id": "weatherTemperature" }))
                )
                .append($("<tr>")
                    .append($("<td>", { "id": "windLabel" }))
                    .append($("<td>", { "id": "wind", "colspan": "2" }))
                )
                .append($("<tr>")
                    .append($("<td>", { "id": "humidityLabel" }))
                    .append($("<td>", { "id": "humidity", "colspan": "2" }))
                )
                .append($("<tr>")
                    .append($("<td>", { "id": "pressureLabel" }))
                    .append($("<td>", { "id": "pressure", "colspan": "2" }))
                )
            )
            .append(forecastList)
        );

        // Forecast
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

        this.root
            .append(placeDiv)
            .append(detailedInfo);

        $(".detailedInfoSegment").fadeOut(1);
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

    public searchLocationByName(place: string): Promise<any> {
        var fetchURL = "https://search.mapzen.com/v1/search?" + "api_key=mapzen-eES7bmW&text=" + place + "&size=1";;

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
        var fetchURL = "https://search.mapzen.com/v1/reverse?" + "api_key=mapzen-eES7bmW&point.lat=" + latitude + "&point.lon=" + longitude + "&size=1";

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
        var fetchURL = "https://search.mapzen.com/v1/autocomplete?api_key=mapzen-eES7bmW&layers=locality&";

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
        fetchURL += "&units=metric&appid=57cf72874229f081c28596f80a572323";

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
        fetchURL += "&units=metric&appid=57cf72874229f081c28596f80a572323";

        return new Promise((resolve, reject) => {
            $.getJSON(fetchURL, (locations) => {
                locations ? resolve(locations) : reject();
            })
        });
    }

    private setWeather(weather: any) {
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

    private setSuggestions(suggestions: any) {
        // Refreshing suggestion list
        $("#suggestionList").empty();
        for (var i = 0; i < suggestions.features.length; i++) {
            if (suggestions.features[i].properties.label != undefined) {
                $("#suggestionList").append($("<option>", { "value": suggestions.features[i].properties.label }))
            }
        }
    }

    private handleSearchSubmit() {
        var text = $("#placeInput").val();
        var coords = this.map.getCoordinatesAtCenter();
        // Search for entered place
        this.searchLocationByName(text)
            .then((locations) => {
                this.map.displayPlace(locations.features[0].geometry.coordinates[1], locations.features[0].geometry.coordinates[0], 14, 1007);
                $(".detailedInfoSegment:eq(0)").fadeIn(1000);
                $("#PlaceName").html(locations.features[0].properties.name);
                $("#PlaceRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                $("#PlaceGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(2) + ", " + locations.features[0].geometry.coordinates[0].toFixed(2) + "]");

                this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then((weather) => {
                        this.setWeather(weather);
                        $(".detailedInfoSegment:eq(1)").fadeIn(1500);
                    });
                this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then((forecast) => {
                        this.setForecast(forecast);
                        $(".detailedInfoSegment:eq(1)").fadeIn(1500);
                    })
            });
            
    }

    public displayMarkedPointInfo(lat: number, lon: number) {
        this.searchLocationByCoords(lat, lon)
            .then((locations) => {
                $(".detailedInfoSegment:eq(0)").fadeIn(400);
                $("#PlaceName").html(locations.features[0].properties.name);
                $("#PlaceRegionCountry").html(locations.features[0].properties.region + ", " + locations.features[0].properties.country);
                $("#PlaceGPS").html("GPS: [" + locations.features[0].geometry.coordinates[1].toFixed(2) + ", " + locations.features[0].geometry.coordinates[0].toFixed(2) + "]");

                this.fetchWeather(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then((weather) => {
                        this.setWeather(weather);
                        $(".detailedInfoSegment:eq(1)").fadeIn(400);
                    });
                this.fetchForecast(locations.features[0].properties.name, locations.features[0].properties.country)
                    .then((forecast) => {
                        this.setForecast(forecast);
                        $(".detailedInfoSegment:eq(1)").fadeIn(400);
                    })
            });
    }

    public hideMarkedPointInfo() {
        $("#detailedInfo > .detailedInfoSegment").fadeOut(250);
    }
}