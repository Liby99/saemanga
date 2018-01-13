const Debug = require("keeling-js/lib/debug");
const Genre = require("../api/genre");
const Follow = require("../api/follow");
const Hot = require("../api/hot");
const Manga = require("../api/manga");
const User = require("../api/user");

function getGenre(req, res, callback) {
    var gs = Genre.get();
    callback(gs);
}

function getLatestMangas(req, res, callback) {
    Hot.getLatest(function (mangas) {
        callback(mangas);
    }, function (err) {
        Debug.error(err);
        res.error(500, err);
    });
}

function getUser(req, res, hasUser, noUser) {
    var username = req.cookies.username;
    var loggedIn = username != undefined;
    if (loggedIn) {
        User.getAndTouchUser(username, function (user) {
            if (user) {
                hasUser(user);
            }
            else {
                res.clearCookie("username");
                res.error(403, "用户 " + username + " 不存在");
            }
        }, function (err) {
            res.error(500, err);
        });
    }
    else {
        noUser();
    }
}

function getFollows(req, res, user, callback) {
    Follow.getAllFollow(user["_id"], function (follows) {
        callback(follows.map((f) => {
            f.manga.lastEpisode = f.manga.episodes[f.manga.episodes.length - 1];
            f.hasUpdate = f.max_episode < f.manga.lastEpisode;
            f.showBadge = f.up_to_date && f.hasUpdate;
            return f;
        }));
    }, function (err) {
        res.error(500, err);
    });
}

module.exports = function (req, res, callback) {
    getGenre(req, res, function (genres) {
        getLatestMangas(req, res, function (mangas) {
            getUser(req, res, function hasUser (user) {
                getFollows(req, res, user, function (follows) {
                    callback({
                        genres: genres,
                        latests: mangas,
                        loggedIn: true,
                        user: user,
                        follows: follows
                    });
                });
            }, function noUser () {
                callback({
                    loggedIn: false,
                    user: {},
                    genres: genres,
                    latests: mangas
                });
            });
        });
    });
};
