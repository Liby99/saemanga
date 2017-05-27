
// Require Keeling-JS Modules
var mysql = require("keeling-js/lib/mysql");

// Require APIs
var chinese = require("../api/chinese.js");
var Creeper = require("../api/creeper.js");
var Database = require("../api/database.js");

module.exports = {
    search: function (req, res) {
        Creeper.search(chinese.traditionalize(req.body.search), function (matches) {
            if (matches.length == 0) {
                res.error(1, "结果未找到");
            }
            else {
                res.success(matches);
            }
        });
    },
    get_hot_manga: function (req, res) {
        Database.getHotManga(function (result) {
            res.success(result);
        });
    },
    get_random_manga: function (req, res) {
        Database.getRandomManga(function (result) {
            res.redirect("/manga.html?id=" + result[dmk_id]);
        });
    },
    get_following_manga: function (req, res) {
        if (req.cookies.UUID) {
            Database.getFollowingManga(req.cookies.UUID, function (result) {
                res.success(result);
            });
        }
        else {
            res.redirect("/index.html");
        }
    },
    unfollow_manga: function (req, res) {
        if (req.cookies.UUID) {
            if (req.body.id) {
                Database.unfollowManga(req.cookies.UUID, parseInt(req.body.id), function () {
                    res.success({});
                });
            }
            else {
                res.error(2, "漫画ID未找到");
            }
        }
        else {
            res.error(1, "用户名未知");
        }
    },
    get_manga_info: function (req, res) {
        if (req.body.id) {
            var id = parseInt(req.body.id);
            Database.getMangaInfo(id, function (info) {
                res.success(info);
            });
        }
        else {
            res.error(1, "需要请求漫画id");
        }
    }
}
