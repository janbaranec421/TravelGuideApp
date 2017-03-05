class MapSearchingPanel {
    public root: JQuery

    constructor() {
        this.root = $("#mapPanel");

        var place = $("<input>", {
            "id": "place",
            "type": "text",
            "placeholder": "Find on map...",
            "autocomplete": "on"
        }).css({
            "display": "block",
            "margin": "2% auto 1% auto"
            });
        var placeLabel = $("<label>", { "for": "place" }).html("Place")

        var coordinates = $("<input>", {
            "id": "longitude",
            "type": "number",
            "placeholder": "Find by coordinates..."
        }).css({
            "display": "block",
            "margin": "1% auto 1% auto"
            });
        var coordinatesLabel = $("<label>", { "for": "longitude" }).html("Longitude");

        var form = $("<form>").css({ "padding": "15px" })
            .append(placeLabel)
            .append(place)
            .append(coordinatesLabel)
            .append(coordinates);

        this.root.append(form);
    }
}