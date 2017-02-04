class ScheduleList {
    private root: JQuery

    constructor() {
        this.root = $("#scheduleList");

        $(this.root)
            .append($("<ul>"));
    }

    public addSchedules() {
        var ID = window.sessionStorage.getItem("projectID");

        $.getJSON("../Resources/project-" + ID + ".json", (projectData) => {
            for (var i = 0; i < projectData.schedule.length; i++)
            {
                var listItem = $("<li>", { "class": "scheduleListItem" })
                var table = $("<table>", { "cellspacing": "0" });

                var firstRow = $("<tr>", { "id": "scheduleListItemFirstRow" })
                    .append($("<td>", { "rowspan": "2" }).html(projectData.schedule[i].name))
                    .append($("<td>").html("<b>From:</b> " + projectData.schedule[i].date.from))
             
                var secondRow = $("<tr>", { "id": "scheduleListItemSecondRow" })
                    .append($("<td>").html("<b>To:</b> " + projectData.schedule[i].date.to))

                var thirdRow = $("<tr>", { "id": "scheduleListItemThirdRow" })
                    .append($("<td>", { "colspan": "3" }).html(projectData.schedule[i].note));

                listItem.on('click', (evt) => {

                });

                $(this.root).children()
                    .append(listItem
                        .append(table
                            .append(firstRow)
                            .append(secondRow)
                            .append(thirdRow)));
            }
        })
    }
}