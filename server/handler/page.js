var mysql = require("../module/mysql.js");
var util = require("../module/util.js");
var Creeper = require("./creeper.js");
var Database = require("./database.js");

module.exports = {
    set: function (server) {
        
        server.get("/index.html", function (req, res) {
            processIndex(req, res);
        });
        
        server.get("/manga.html", function (req, res) {
            processManga(req, res);
        });
    }
}

function processIndex(req, res) {
    processUUID(req, res, function (UUID) {
        res.sendFile(require("path").resolve("./public/index.html"));
    });
}

function processManga(req, res) {
    if (req.query.id) {
        var id = parseInt(req.query.id);
        processUUID(req, res, function (UUID) {
            Database.getMangaInfo(id, function (manga) {
                if (manga) {
                    Database.getFollowInfo(UUID, id, function (follow) {
                        if (follow) {
                            if (req.query.epi && parseInt(req.query.epi) >= 0 && parseInt(req.query.epi) <= manga.latest_episode) {
                                Database.refreshFollowStatus(UUID, id, parseInt(req.query.epi), function () {
                                    res.sendFile(require("path").resolve("./public/manga.html"));
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

function processUUID(req, res, callback) {
    if (req.cookies.UUID) {
        res.touchUUID();
        callback(req.cookies.UUID);
    }
    else {
        if (req.headers["user-agent"]) {
            var UUID = util.UUID();
            mysql.query("INSERT INTO `user` SET `register_date_time` = NOW(), `last_login` = NOW(), ?", {
                UUID: UUID,
                agent: req.headers["user-agent"]
            }, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                }
                else {
                    res.updateUUID(UUID);
                    callback(UUID);
                }
            });
        }
        else {
            res.sendStatus(403);
        }
    }
}
