const Debug = require("keeling-js/lib/debug");
const Genre = require("../api/genre");
const Hot = require("../api/hot");
const Manga = require("../api/manga");
const User = require("../api/user");

function getGenre(req, res, callback) {
    var gs = Genre.get();
    callback(gs);
}

function getLatestMangas(req, res, callback) {
    Hot.getLatestIds(function (ids) {
        Manga.getAll(ids, function (mangas) {
            callback(mangas);
        }, function (err) {
            Debug.error(err);
            res.error(500, "Error getting mangas");
        });
    }, function (err) {
        Debug.error(err);
        res.error(500, "Error getting hot manga ids");
    });
}

function getUser(req, res, hasUser, noUser) {
    var username = req.cookies.username;
    var loggedIn = username != undefined;
    if (loggedIn) {
        User.getUser(username, function (user) {
            hasUser(user);
        }, function () {
            res.error(403, "User " + username + " not exists");
        });
    }
    else {
        noUser();
    }
}

module.exports = function (req, res, callback) {
    getGenre(req, res, function (genres) {
        getLatestMangas(req, res, function (mangas) {
            getUser(req, res, function hasUser (user) {
                callback({
                    genres: genres,
                    latests: mangas,
                    user: user
                });
            }, function noUser () {
                callabck({
                    genres: genres,
                    latests: mangas
                });
            });
        });
    });
};
