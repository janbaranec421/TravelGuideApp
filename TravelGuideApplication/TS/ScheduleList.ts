class ScheduleList {
    private root: JQuery

    constructor() {
        this.root = $("#scheduleList");

        $(this.root)
            .append($("<div>", { "id": "scheduleListHeader" }).html("Schedules")
                .append($("<div>", { "id": "scheduleListHeader-project" })
                    .css({
                        "font-size": "large",
                        "border-top": "1px solid #5b6e7d"
                    })
                    .html("Project: none"))
                .append($("<div>", { "id": "scheduleListHeader-tip" })
                    .css("font-size", "large"))
                .append($("<ul>").css({
                    "padding": "0px",
                    "list-style-type": "none"
                }))
        );
    }

    public addSchedules() {
        var ID = window.sessionStorage.getItem("currentProjectID");

        $.getJSON("../Resources/Projects/project-" + ID + ".json", (projectData) => {
            $("#scheduleListHeader-project").html("Project: " + projectData.name);

            $(this.root).children().fadeOut(700, () =>
            {
                if (projectData.schedule != null)
                {
                    if (projectData.schedule.length != null)
                    {
                        for (var i = 0; i < projectData.schedule.length; i++) {
                            // Card item
                            var listItem = $("<li>", { "class": "scheduleListItem" })
                            var table = $("<table>", { "cellspacing": "0" })
                                .on('click', (evt) => {
                                    var value = $(evt.currentTarget).find("> tbody > tr#scheduleListItemFirstRow > td").html();
                                    var selectionObject = JSON.parse(window.sessionStorage.getItem("selections"));
                                    selectionObject.currentSchedule = value;
                                    window.sessionStorage.setItem("selections", JSON.stringify(selectionObject));
                                    window.location.href = "places.html";
                                });

                            var data
                            // First row
                            data = projectData.schedule[i].name != null ? projectData.schedule[i].name : "Title not provided";
                            var firstRow = $("<tr>", { "id": "scheduleListItemFirstRow" })
                                .append($("<td>").html(data))
                            // Second row
                            data = projectData.schedule[i].date.from != null ? projectData.schedule[i].date.from.replace("T", " ") : "Not provided";
                            var secondRow = $("<tr>", { "id": "scheduleListItemSecondRow" })
                                .append($("<td>").html("From: " + data))
                            // Third row
                            data = projectData.schedule[i].date.to != null ? projectData.schedule[i].date.to.replace("T", " ") : "Not provided";
                            var thirdRow = $("<tr>", { "id": "scheduleListItemThirdRow" })
                                .append($("<td>").html("To: " + data))
                            // Fourth row
                            data = projectData.schedule[i].note != null ? projectData.schedule[i].note : "Description not provided";
                            var fourthRow = $("<tr>", { "id": "scheduleListItemFourthRow" })
                                .append($("<td>").html(data));

                            // Put all row into Card
                            $(this.root).children()
                                .append(listItem
                                    .append(table
                                        .append(firstRow)
                                        .append(secondRow)
                                        .append(thirdRow)
                                        .append(fourthRow)));
                        }
                        if (projectData.schedule.length > 0){
                            $("#scheduleListHeader-tip").html("(Click on schedule to show more)")
                        }
                    }
                }
                else {
                    $("#scheduleListHeader > ul")
                        .append($("<li>", { "class": "emptyList" }).html("< There aren't any schedules yet >"));
                }
                $(this.root).children().fadeIn(1000);
            })
        })
    }
}