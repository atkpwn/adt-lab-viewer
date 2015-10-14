var fs = require('fs');
var http = require('http');
var async = require('async');

var problemList = {};
var problems = {};
var num2pid = {};

function createProblemList(problemFile, jsonFile) {
    var num2pidAPI = "http://uhunt.felix-halim.net/api/p/num/";
    var lines = fs.readFileSync(problemFile).toString().split('\n');

    var currentTopic;
    var currentLevel;
    var calls = [];
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
            calls.push((function(p) {
                return function(callback) {
                    http.get(num2pidAPI + p, function(res) {
                        res.setEncoding('ascii');
                        res.on("data", function(str) {
                            var problem = JSON.parse(str);
                            problems[problem.pid] = {"num": problem.num,
                                                     "title": problem.title};
                            num2pid[problem.num] = problem.pid;
                            callback(null, problem.pid);
                        });
                    });
                };
            })(num));
        }
    }
    async.parallel(calls, function(err, res) {
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

        fs.writeFile(jsonFile, JSON.stringify(data));
    });
}

createProblemList('tasks.md', 'tasks.json');
