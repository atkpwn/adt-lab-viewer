"use strict";

function makeProblemList() {
    var num2pidAPI = "http://uhunt.felix-halim.net/api/p/num/";

    var problemList = {};
    var problems = {};
    var num2pid = {};

    function getProblems(file) {
        var currentTopic;
        var currentLevel;
        var calls = [];
        var lines = file.split('\n');
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.slice(0, 2) == "# ") {
                currentTopic = line.slice(2);
                problemList[currentTopic] = {};
            }
            else if(line.slice(0, 3) == "## ") {
                currentLevel = line.slice(3);
                problemList[currentTopic][currentLevel] = [];
            }
            else if(line.slice(0, 2) == "* ") {
                var num = parseInt(line.slice(2));
                problemList[currentTopic][currentLevel].push(num);
                calls.push($.getJSON(num2pidAPI + num, function(problem) {
                    problems[problem.pid] =  {"num": problem.num,
                                              "title": problem.title};
                    num2pid[problem.num] = problem.pid;
                }));
            }
        }
        $.when.apply($, calls).then(function() {
            for(var topic in problemList) {
                for(var level in problemList[topic]) {
                    var pids = [];
                    for(var i = 0; i < problemList[topic][level].length; i++)
                        pids.push(num2pid[problemList[topic][level][i]]);
                    problemList[topic][level] = pids;
                }
            }
            var data = {"problemList": problemList,
                        "problems": problems};
            
            $("#problems-json").text(JSON.stringify(data));
        });
    }

    this.start = function() {
        $.get('../tasks.md', function(data) {
            getProblems(data);
        });
    };
}

$(function() {
    window.app = new makeProblemList();
    window.app.start();
});
