var mysql = require("../module/mysql.js");
var chinese = require("../module/chinese.js");
var Creeper = require("./api/creeper.js");
var Database = require("./api/database.js");

module.exports = {
    search: function (context) {
        Creeper.search(chinese.traditionalize(context.request.body.search), function (matches) {
            if (matches.length == 0) {
                context.response.error(1, "结果未找到");
            }
            else {
                context.response.success(matches);
            }
        });
    },
    get_hot_manga: function (context) {
        Database.getHotManga(function (result) {
            context.response.success(result);
        });
    },
    get_random_manga: function (context) {
        Database.getRandomManga(function (result) {
            context.response.redirect("/manga.html?id=" + result[dmk_id]);
        });
    },
    get_following_manga: function (context) {
        if (context.request.cookies.UUID) {
            Database.getFollowingManga(context.request.cookies.UUID, function (result) {
                context.response.success(result);
            })
        }
        else {
            context.response.redirect("/index.html");
        }
    },
    unfollow_manga: function (context) {
        if (context.request.cookies.UUID) {
            if (context.request.body.id) {
                Database.unfollowManga(context.request.cookies.UUID, parseInt(context.request.body.id), function () {
                    context.response.success({});
                });
            }
            else {
                context.response.error(2, "漫画ID未找到");
            }
        }
        else {
            context.response.error(1, "用户名未知");
        }
    },
    get_manga_info: function (context) {
        if (context.request.body.id) {
            var id = parseInt(context.request.body.id);
            Database.getMangaInfo(id, function (info) {
                context.response.success(info);
            });
        }
        else {
            context.response.error(1, "需要请求漫画id");
        }
    }
}
