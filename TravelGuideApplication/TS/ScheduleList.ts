class ScheduleList {
    private root: JQuery
    public mainPage: MainPage;

    constructor(page: MainPage) {
        this.mainPage = page;
        this.root = $("#scheduleList")
            .append($("<ul>"));
    }

    public displaySchedulesByProjectID(projectID: number) {
        var ID = this.mainPage.sideMenu.currentProjectID;

        $.getJSON("./Resources/Projects/project-" + ID + ".json", (projectData) => {
            this.clearScheduleList();

            $(this.root).children().fadeOut(10, () =>
            {
                if (projectData.schedule != null)
                {
                    if (projectData.schedule.length != null)
                    {
                        for (var i = 0; i < projectData.schedule.length; i++) {
                            // Card item
                            var listItem = $("<li>", { "class": "scheduleListItem" })
                            var table = $("<table>", { "cellspacing": "0" })

                            var data;
                            // First row
                            data = projectData.schedule[i].name != null ? projectData.schedule[i].name : "Title not provided";
                            var firstRow = $("<tr>", { "id": "scheduleListItemFirstRow", "colspan": "2" })
                                .append($("<td>")
                                    .append($("<div>").css({
                                        "border-bottom": "1px solid #444141",
                                        "padding": "0px 5px 7px"
                                    }).html(data)));

                            var secondRow = $("<tr>", { "id": "scheduleListItemSecondRow" })
                                .append($("<td>").html("(" + projectData.schedule[i].items.length + " places to visit...)"));

                            // Second row
                            data = projectData.schedule[i].date.from != null ? projectData.schedule[i].date.from.replace("T", " ") : "Not provided";
                            data = Converter.date_YYYYMMDDHHMM_to_HHMMDDMMYYYY(data);

                            var thirdRow = $("<tr>", { "id": "scheduleListItemThirdRow" })
                                .append($("<td>").html("From: &nbsp" + data))

                            // Third row
                            data = projectData.schedule[i].date.to != null ? projectData.schedule[i].date.to.replace("T", " ") : "Not provided";
                            data = Converter.date_YYYYMMDDHHMM_to_HHMMDDMMYYYY(data);
                            var fourthRow = $("<tr>", { "id": "scheduleListItemFourthRow" })
                                .append($("<td>").html("To: &nbsp" + data))
                            // Fourth row
                            data = projectData.schedule[i].note != null ? projectData.schedule[i].note : "";
                            var fifthRow = $("<tr>", { "id": "scheduleListItemFifthRow" })
                                .append($("<td>").html(data));

                            var sixthRow = $("<tr>", { "id": "scheduleListItemSixthRow" })
                                .append($("<td>")
                                    .append($("<button>").text("Detailed Info")
                                        .click((evt) => {
                                            var scheduleName = $(evt.currentTarget).parent().parent().siblings("#scheduleListItemFirstRow").children("td").children("div").text();
                                            this.mainPage.showPlacesBySchedule(scheduleName);
                                        })));

                            // Put all row into Card
                            $(this.root).children()
                                .append(listItem
                                    .append(table
                                        .append(firstRow)
                                        .append(secondRow)
                                        .append(thirdRow)
                                        .append(fourthRow)
                                        .append(fifthRow)
                                        .append(sixthRow)));
                        }
                    }
                }
                else {
                    $("#scheduleListHeader > ul")
                        .append($("<li>", { "class": "emptyList" }).html("< There aren't any schedules yet >"));
                }
                $(this.root).children().fadeIn(500);
            })
        })
    }

    public clearScheduleList() {
        $(".scheduleListItem").remove();
    }
}