var PlacesListItem = (function () {
    function PlacesListItem(parentElement, object) {
        this.labels = [];
        this.id = object.id;
        this.name = object.name;
        this.desc = object.desc;
        this.gps = object.gps;
        this.photos = object.photos;
        this.labels = object.labels;
        this.requiredTime = object.requiredTime;
        this.priority = object.priority;
        $(parentElement)
            .append($("<li>"));
    }
    return PlacesListItem;
})();
//# sourceMappingURL=PlacesListItem.js.map