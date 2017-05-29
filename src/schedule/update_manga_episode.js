var Creeper = require("../api/creeper");
var Database = require("../api/database");

module.exports = {
    name: "update manga episode",
    schedule: "*/30 * * * *",
    task: function () {
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
};
