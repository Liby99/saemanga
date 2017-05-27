var Creeper = require("../api/creeper");
var Database = require("../api/database");

module.exports = {
    schedule: "*/30 * * * *",
    task: function () {
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
};
