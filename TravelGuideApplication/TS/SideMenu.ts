class SideMenu {
    items: HTMLElement[];
    root: HTMLElement;
    isAnimationFinished: boolean;
    isOpen: boolean;

    constructor(root: HTMLElement, items: HTMLElement[])
    {
        this.root = root;
        this.items = items;

        var list = document.createElement("ul");
        list.style.listStyleType = "none";
        list.style.color = "mintcream";
        list.style.marginLeft = "-15%";
        list.style.marginRight = "2%";

        for (var i = 0; i < items.length; i++)
        {
            list.appendChild(items[i]);
        }

        this.isAnimationFinished = true;
        this.isOpen = false;
        this.root.style.left = "-250px";

        this.root.appendChild(list);
    }

    public isOpened()
    {
        return this.isOpen;
    }

    public showMenu(openMenu: boolean) {
        if (this.isAnimationFinished)
        {
            this.isAnimationFinished = false;

            if (openMenu && !this.isOpen) {
                $("#sideMenu").animate({ left: '+=250px' }, 400, () => {
                    this.isAnimationFinished = true;
                    this.isOpen = true;
                });
            }
            else if (!openMenu && this.isOpen) {
                $("#sideMenu").animate({ left: '-=250px' }, 400, () => {
                    this.isAnimationFinished = true;
                    this.isOpen = false;
                });
            }
            else
            {
                this.isAnimationFinished = true;
            }
        }
    }
}