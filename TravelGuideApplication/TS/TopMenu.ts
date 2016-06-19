class TopMenu {
    items: HTMLElement[];
    root: HTMLElement;

    constructor(root: HTMLElement, items: HTMLElement[]) {
        this.root = root;
        this.items = items;

        var list = document.createElement("ul");
        list.setAttribute("id", "topMenuList");    

        for (var i = 0; i < items.length; i++) {
            list.appendChild(items[i]);
        }

        root.appendChild(list);
    }
}