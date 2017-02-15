class ScheduleList {
    private root: JQuery

    constructor() {
        this.root = $("#scheduleList");

        $(this.root)
            .append($("<ul>"));
    }

    public addSchedules() {
        var ID = window.sessionStorage.getItem("projectID");

        $.getJSON("../Resources/Projects/project-" + ID + ".json", (projectData) => {

            $(this.root).children().fadeOut(500, () =>
            {
                for (var i = 0; i < projectData.schedule.length; i++)
                {
                    var listItem = $("<li>", { "class": "scheduleListItem" })
                    var table = $("<table>", { "cellspacing": "0" })
                        .on('click', (evt) => {
                            var value = $(evt.currentTarget).find("> tbody > tr#scheduleListItemFirstRow > td:first-child").html();
                            var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                            selectionObject.selectedSchedule = true;
                            selectionObject.selectedScheduleValue = value;
                            window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                            window.location.href = "places.html";
                    });
                    var from = projectData.schedule[i].date.from.split("T");
                    var to = projectData.schedule[i].date.to.split("T");
                    var firstRow = $("<tr>", { "id": "scheduleListItemFirstRow" })
                        .append($("<td>", { "rowspan": "2" }).html(projectData.schedule[i].name))
                        .append($("<td>").html("<b>From:</b> " + from[1] + " " + from[0]))
             
                    var secondRow = $("<tr>", { "id": "scheduleListItemSecondRow" })
                        .append($("<td>").html("<b>To:</b> " + to[1] + " " + to[0]))

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
                $(this.root).children().fadeIn(500);
            })
        })
    }
}