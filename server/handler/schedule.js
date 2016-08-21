var schedule = require('node-schedule');
var Creeper = require("./creeper.js");
var Database = require("./database.js");

var tasks = [
    {
        name: "[Update Hot Manga]",
        rule: "*/20 * * * *",
        action: function () {
            Creeper.getHotManga(function (result) {
                if (result.length != 0) {
                    Database.deleteHotManga(function () {

                        function insert(i) {
                            if (i < result.length) {
                                Database.insertHotManga(result[i].dmk_id, result[i].name, function () {
                                    insert(++i);
                                });
                            }
                        }

                        insert(0);
                    });
                }
                else {
                    console.log("No Hot Manga is inserted...");
                }
            });
        }
    },
    {
        name: "[Update Manga Episode]",
        rule: "*/10 * * * *",
        action: function () {
            Database.getAllUpdatableManga(function (result) {

                function insert(i) {
                    if (i < result.length) {
                        Creeper.getMangaInfo(result[i].dmk_id, function (info) {
                            if (info) {
                                Database.updateMangaInfo(info.dmk_id, info.latest_episode, info.ended, function () {
                                    insert(++i);
                                });
                            }
                            else {
                                insert(++i);
                            }
                        });
                    }
                }

                insert(0);
            });
        }
    }
];

function scheduleTask(task) {
    schedule.scheduleJob(task.rule, function () {
        console.log("Scheduler Executing Task " + task.name + " at " + (new Date()).toString());
        task.action();
    });
}

module.exports = {
    set: function () {
        for (var i = 0; i < tasks.length; i++) {
            scheduleTask(tasks[i]);
        }
    }
}
