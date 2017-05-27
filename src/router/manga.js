var mysql = require("../module/mysql.js");
var util = require("../module/util.js");
var Creeper = require("../api/creeper.js");
var Database = require("../api/database.js");
var ProcessUUID = require("../api/uuid.js");

module.exports = function (req, res, callback) {
    if (req.query.id) {
        var id = parseInt(req.query.id);
        ProcessUUID(req, res, function (req, res, UUID) {
            Database.getMangaInfo(id, function (manga) {
                if (manga) {
                    Database.getFollowInfo(UUID, id, function (follow) {
                        if (follow) {
                            if (req.query.epi && parseInt(req.query.epi) >= 0 && parseInt(req.query.epi) <= manga.latest_episode) {
                                Database.refreshFollowStatus(UUID, id, parseInt(req.query.epi), function () {
                                    callback({});
                                });
                            }
                            else {
                                res.redirect("/manga.html?id=" + id + "&epi=" + follow.current_episode);
                            }
                        }
                        else {
                            Database.followManga(UUID, id, function () {
                                res.redirect("/manga.html?id=" + id + "&epi=1");
                            });
                        }
                    });
                }
                else {
                    Creeper.getMangaInfo(id, function (info) {
                        if (info) {
                            console.log((new Date()).toString() + " Successfully Creeped Manga " + id);
                            Database.insertManga(info, function () {
                                Database.followManga(UUID, id, function () {
                                    res.redirect("/manga.html?id=" + id + "&epi=1");
                                });
                            });
                        }
                        else {
                            console.log((new Date()).toString() + " Creeping Manga " + id + " Failed");
                            res.redirect("/index.html?err=2&err_m=" + id);
                        }
                    });
                }
            });
        });
    }
    else {
        res.redirect("/index.html?err=1");
    }
}
