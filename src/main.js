"use strict";

function ProblemList() {
    var subsPidsAPI = "https://uhunt.onlinejudge.org/api/subs-pids/";
    var user2idAPI = "https://uhunt.onlinejudge.org/api/uname2uid/";
    var problemURL = "https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=";
    var accept = 90;
    var never = 0;
    var verdictMesg = {
        0: "Never submit!",
        10: "Submission error",
        15: "Can't be judged",
        20: "In queue",
        30: "Compile error",
        35: "Restricted function",
        40: "Runtime error",
        45: "Output limit",
        50: "Time limit",
        60: "Memory limit",
        70: "Wrong answer",
        80: "PresentationE",
        90: "Accepted"
    };
    var problemList;
    var problemStatus;

    function getURL(pid) {
        return problemURL + pid;
    }

    function getStatusURL(userId) {
        return subsPidsAPI + userId + "/" + $.map(problemStatus, function(status, p) {
            return p;
        }).join(",");
    }

    function getUser() {
        var input = $("#user-id").val();
        if(input) {
            $("#task-list").text("Loading...");
            if(isNaN(input)) {
                $.get(user2idAPI + input, function(userid) {
                    createProblemList(userid);
                });
            }
            else {
                createProblemList(input);
            }
        }
    }

    function createProblemList(userId) {
        problemStatus = {};
        $.getJSON("tasks.json", function(data) {
            problemList = data.problemList;
            problemStatus = data.problems;
            $.each(problemStatus, function(pid, obj) {
                obj["verdict"] = 0;
            });
            getUserStatus(userId);
        });
    }

    function getUserStatus(userId) {
        $.getJSON(getStatusURL(userId), function(data) {
            $.each(data, function(user, details) {
                for(var i = 0; i < details.subs.length; i++) {
                    var pid = details.subs[i][1];
                    var verdict = details.subs[i][2];
                    problemStatus[pid].verdict = problemStatus[pid] == accept ? accept : verdict;
                }
                displayResult();
            });
        });
    }
    
    function displayResult() {
        $("#task-list").empty();
        $.each(problemList, function(topic, levels) {
            var table = $("<table/>");
            var thead = $("<thead/>")
                    .append($("<tr/>")
                            .addClass("topic")
                            .append($("<th/>").text(topic)));

            table.append(thead);
            $.each(levels, function(level, problems) {
                var hlevel = $("<tr/>")
                        .addClass("level")
                        .text(level);
                
                table.append(hlevel);
                for(var i = 0; i < problems.length; i++) {
                    var pid = problems[i];
                    var row = $("<tr/>").addClass(problemStatus[pid]["verdict"] == accept ? "pass" : 
                                                  problemStatus[pid]["verdict"] == never ? "never" : "fail");
                    var problemNum = $("<td/>")
                            .addClass("problem-num")
                            .append($("<a/>")
                                    .attr("href", getURL(pid))
                                    .attr("target","_blank").text(problemStatus[pid].num));
                    var problemTitle = $("<td/>")
                            .addClass("problem-title")
                            .text(problemStatus[pid]["title"]);
                    var verdict = $("<td/>")
                            .addClass("problem-verdict")
                            .text(verdictMesg[problemStatus[pid]["verdict"]]);
                    row.append(problemNum);
                    row.append(problemTitle);
                    row.append(verdict);
                    table.append(row);
                }
            });
            $("#task-list").append(table);
        });
    }

    this.start = function() {
        $("#user-id").keypress(function(e) {
            if(e.which == 13) {
                getUser();
                return false;
            }
        });
    };
}

$(function() {
    window.app = new ProblemList();
    window.app.start();
});
