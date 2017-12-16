const fs = require("fs");
const path = require("path");
const User = require("../api/user");
const Follow = require("../api/follow");
const MangaAPI = require("../api/manga");
const Manga = require("../api/app/manga");

function getFirstEpisode(manga) {
    return manga.books ? manga.books[0] : manga.episodes[0];
}

function isValidEpisode(manga, epi) {
    if ((epi = parseInt(epi)) != NaN) {
        if (manga.books)
            if (manga.books.indexOf(epi) >= 0) return true;
        return manga.episodes.indexOf(epi) >= 0;
    }
    else {
        return false;
    }
}

function getMangaInfo(req, res, callback) {
    if (req.query.id) {
        MangaAPI.get(req.query.id, function (manga) {
            if (manga) {
                callback(manga);
            }
            else {
                res.error(404, "未找到漫画" + req.query.id + "的信息");
            }
        }, function (err) {
            res.error(500, err);
        });
    }
    else {
        res.error(403, "未指定漫画ID");
    }
}

function getUser(req, res, hasUser, noUser) {
    if (req.cookies.username) {
        User.getUser(req.cookies.username, function (user) {
            if (user) {
                hasUser(user);
            }
            else {
                res.clearCookie("username");
                res.error(403, "用户未找到");
            }
        }, function (err) {
            res.error(500, err);
        });
    }
    else {
        noUser();
    }
}

function isFollowing(req, res, user, manga, isFollowing, notFollowing) {
    Follow.isFollowing(user["_id"], manga["_id"], function (is) {
        if (is) {
            isFollowing();
        }
        else {
            notFollowing();
        }
    }, function (err) {
        res.error(500, err);
    });
}

function checkEpisode(req, res, user, manga, hasEpisode, noEpisode) {
    if (req.query.epi) {
        if (isValidEpisode(manga, req.query.epi)) {
            hasEpisode();
        }
        else {
            res.error(404, "该章节不存在");
        }
    }
    else {
        noEpisode();
    }
}

function read(req, res, user, manga, callback) {
    Follow.read(user["_id"], manga["_id"], req.query.epi, function () {
        callback();
    }, function (err) {
        res.error(500, err);
    });
}

function redirectToLatest(req, res, user, manga) {
    Follow.getFollow(user["_id"], manga["_id"], function (follow) {
        if (follow) {
            res.redirect("manga.html?id=" + req.query.id + "&epi=" + follow["max_episode"]);
        }
        else {
            res.error(500, err);
        }
    }, function (err) {
        res.error(500, err);
    });
}

function follow(req, res, user, manga, success) {
    Follow.follow(user["_id"], manga["_id"], function (followId) {
        success();
    }, function (err) {
        res.error(500, err);
    });
}

function redirectToFirst(req, res, manga) {
    res.redirect("manga.html?id=" + req.query.id + "&epi=" + getFirstEpisode(manga));
}

function renderPageWithUser(req, res, user, manga, callback) {
    renderPage(true, user, manga, req.query.epi, callback);
}

function renderPageNoUser(req, res, manga, callback) {
    renderPage(false, {}, manga, req.query.epi, callback);
}

function renderPage(loggedIn, user, manga, episode, callback) {
    manga["_id"] = manga["_id"].toString();
    callback({
        loggedIn: loggedIn,
        user: user,
        manga: new Manga(manga),
        episode: parseInt(episode)
    });
}

module.exports = function (req, res, callback) {
    getMangaInfo(req, res, function (manga) {
        getUser(req, res, function hasUser (user) {
            isFollowing(req, res, user, manga, function is () {
                checkEpisode(req, res, user, manga, function has () {
                    read(req, res, user, manga, function () {
                        renderPageWithUser(req, res, user, manga, callback);
                    });
                }, function no () {
                    redirectToLatest(req, res, user, manga);
                });
            }, function notFollowing () {
                follow(req, res, user, manga, function () {
                    checkEpisode(req, res, user, manga, function () {
                        read(req, res, user, manga, function () {
                            renderPageWithUser(req, res, user, manga, callback);
                        });
                    }, function () {
                        redirectToFirst(req, res, manga);
                    });
                });
            });
        }, function noUser () {
            checkEpisode(req, res, undefined, manga, function () {
                renderPageNoUser(req, res, manga, callback);
            }, function () {
                redirectToFirst(req, res, manga);
            });
        });
    });
}
