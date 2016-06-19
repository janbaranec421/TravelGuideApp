var Map = (function () {
    function Map(parent) {
        this.root = parent;
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "mapCanvas");
        this.canvas.style.width = "600px";
        this.canvas.style.height = "550px";
        this.canvas.style.top = "250px";
        this.canvas.style.left = "250px";
        this.canvas.style.border = "solid black 2px";
        this.canvas.style.position = "absolute";
        this.root.appendChild(this.canvas);
    }
    return Map;
})();
//# sourceMappingURL=Map.js.map