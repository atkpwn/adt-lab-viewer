"use strict";

function ProblemList() {
    var subsPidsAPI = "http://uhunt.felix-halim.net/api/subs-pids/";
    var numAPI = "http://uhunt.felix-halim.net/api/p/num/";
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
    var problemType;
    var problemStatus;
    var idToNum;

    function getURL(pid) {
        return problemURL + pid;
    }

    function createProblemList() {
        idToNum = {};
        problemStatus = {};
        $.getJSON("tasks.json", function(data) {
            var calls = [];
            problemType = data;
            $.each(data, function(topic, levels) {
                $.each(levels, function(level, problems) {
                    for(var i = 0; i < problems.length; i++) {
                        calls.push($.getJSON(numAPI + problems[i], function(data) {
                            idToNum[data["pid"]] = data["num"];
                            problemStatus[data["num"]] = {
                                "id": data["pid"],
                                "title": data["title"],
                                "verdict": 0
                            };
                        }));
                    }
                });
            });
            $.when.apply($, calls).then(function() {
                // console.log(problemStatus);
                getUser();
            });
        });     
    }

    function getStatusURL(userID) {
        return subsPidsAPI + userID + "/" + $.map(problemStatus, function(status, p) {
            return status.id;
        }).join(",");
    }

    function getUser() {
        var userID = $("#user-id").val();
        if(userID) {
            $("#task-list").empty();
            getUserStatus(userID);
        }
    };

    function getUserStatus(userID) {
        $.getJSON(getStatusURL(userID), function(data) {
            $.each(data, function(user, details) {
                for(var i = 0; i < details["subs"].length; i++) {
                    var pid = details["subs"][i][1];
                    var verdict = details["subs"][i][2];
                    problemStatus[idToNum[pid]]["verdict"] = problemStatus[idToNum[pid]] == accept ? accept : verdict;
                }
                displayResult();
            });
        });
    }
    
    function displayResult() {
        $.each(problemType, function(topic, levels) {
            var table = $("<table/>");
            var thead = $("<thead/>").append($("<tr/>").addClass("topic").append($("<th/>").text(topic)));
            table.append(thead);
            $.each(levels, function(level, problems) {
                var hlevel = $("<tr/>").addClass("level").text(level);
                table.append(hlevel);
                for(var i = 0; i < problems.length; i++) {
                    var pnum = problems[i];
                    var row = $("<tr/>").addClass(problemStatus[pnum]["verdict"] == accept ? "pass" : 
                                                  problemStatus[pnum]["verdict"] == never ? "never" : "fail");
                    var problemNum = $("<td/>").addClass("problem-num").append(
                        $("<a/>").attr("href", getURL(problemStatus[pnum]["id"])).attr("target","_blank").text(pnum));
                    var problemTitle = $("<td/>").addClass("problem-title").text(problemStatus[pnum]["title"]);
                    var verdict = $("<td/>").addClass("problem-verdict").text(verdictMesg[problemStatus[pnum]["verdict"]]);
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
                createProblemList();
                $("#task-list").text("Loading...");
                // return false;
            }
        });

        // createProblemList();
    };
}

$(function() {
    window.app = new ProblemList();
    window.app.start();
});
