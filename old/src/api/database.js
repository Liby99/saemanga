var chinese = require("./chinese");
var mysql = require("keeling-js/lib/mysql");

module.exports = {
    getAllUpdatableManga: function (callback) {
        mysql.query("SELECT * FROM `manga` WHERE `ended` = 0", {}, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error getting all updatable mangas: ");
                throw err;
            }
            else {
                callback(result);
            }
        });
    },
    insertHotManga: function (id, name, callback) {
        mysql.query("INSERT INTO `hot` SET ?", {
            dmk_id: id,
            name: name
        }, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error inserting hot manga " + id + " " + name + ": ");
            }
            callback();
        });
    },
    getHotManga: function (callback) {
        mysql.query("SELECT * FROM `hot`", {}, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error getting hot manga: ");
                throw err;
            }
            else {
                callback(result);
            }
        });
    },
    deleteHotManga: function (callback) {
        mysql.query("DELETE FROM `hot` WHERE `id` >= 0", {}, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error deleting hot manga: ");
            }
            else {
                callback();
            }
        });
    },
    insertManga: function (info, callback) {
        mysql.query("INSERT INTO `manga` SET `MUID` = UUID(), `log_date_time` = NOW(), ?", info, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error inserting manga with information ");
                console.error(info);
            }
            else {
                console.log("Successfully Inserted Manga " + info.dmk_id + " with info " + JSON.stringify(info));
                callback();
            }
        });
    },
    getMangaInfo: function (id, callback) {
        mysql.query("SELECT `dmk_id`, `dmk_id_gen`, `dmk_id_web`, `name`, `ended`, `latest_episode` FROM `manga` WHERE ?", {
            dmk_id: id
        }, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error getting info of manga " + id + ": ");
                throw err;
            }
            else {
                if (result.length == 0) {
                    callback(undefined);
                }
                else {
                    callback(result[0]);
                }
            }
        });
    },
    updateMangaInfo: function (id, episode, ended, callback) {
        mysql.query("UPDATE `manga` SET `latest_episode` = ?, `ended` = ? WHERE `dmk_id` = ?", [
            episode,
            ended,
            id
        ], function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error updating info of manga " + id + " with episode " + episode + ": ");
            }
            callback();
        });
    },
    getFollowingManga: function (UUID, callback) {
        mysql.query("SELECT `follow`.`dmk_id`, `manga`.`name`, `manga`.`latest_episode`, `manga`.`ended`, `follow`.`current_episode`, `follow`.`up_to_date` FROM `follow` INNER JOIN `manga` ON `manga`.`dmk_id` = `follow`.`dmk_id` WHERE `follow`.`UUID` = ? ORDER BY (`follow`.`up_to_date` * (`manga`.`latest_episode` - `follow`.`current_episode`)) DESC, `follow`.`latest_date_time` DESC", [
            UUID
        ], function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error getting the following manga of user " + UUID + ": ");
                throw err;
            }
            else {
                callback(result);
            }
        });
    },
    getFollowInfo: function (UUID, id, callback) {
        mysql.query("SELECT * FROM `follow` WHERE `UUID` = ? AND `dmk_id` = ?", [
            UUID,
            id
        ], function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error getting the follow info of user " + UUID + " and manga " + id + ": ");
                throw err;
            }
            else {
                if (result.length == 0) {
                    callback(undefined);
                }
                else {
                    callback(result[0]);
                }
            }
        });
    },
    followManga: function (UUID, id, callback) {
        mysql.query("INSERT INTO `follow` SET `latest_date_time` = NOW(), ?", {
            UUID: UUID,
            dmk_id: id,
            current_episode: 1
        }, function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error following manga " + id + " for user " + UUID + ": ");
                throw err;
            }
            else {
                console.log("User " + UUID + " Successfully Followed Manga " + id);
                callback();
            }
        });
    },
    unfollowManga: function (UUID, id, callback) {
        mysql.query("DELETE FROM `follow` WHERE `UUID` = ? AND `dmk_id` = ?", [
            UUID,
            id
        ], function (err, result) {
            if (err) {
                console.error((new Date()).toString() + " Error unfollowing manga " + id + " for user " + UUID + ":");
                throw err;
            }
            else {
                console.log("User " + UUID + " unfollowed Manga " + id);
                callback();
            }
        });
    },
    refreshFollowStatus: function (UUID, id, episode, callback) {
        this.getMangaInfo(id, function (info) {
            if (info) {
                mysql.query("UPDATE `follow` SET `latest_date_time` = NOW(), `current_episode` = ?, `up_to_date` = ? WHERE `UUID` = ? AND `dmk_id` = ?", [
                    episode,
                    episode == info.latest_episode ? 1 : 0,
                    UUID,
                    id
                ], function (err, result) {
                    if (err) {
                        console.error((new Date()).toString() + " Error updating following status of manga " + id + " for user " + UUID + ": ");
                        throw err;
                    }
                    else {
                        callback();
                    }
                });
            }
            else {
                callback();
            }
        });
    }
}
