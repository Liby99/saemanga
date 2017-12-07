const Cartoonmad = require("../api/cartoonmad");
const User = require("../api/user");
const Follow = require("../api/follow");
const Manga = require("../api/manga");

module.exports = {
    "search": function (req, res) {
        Cartoonmad.search(req.body.query, function (ids) {
            res.success(ids);
        }, function (err) {
            res.error(1, err);
        });
    },
    "get_following_manga": function (req, res) {
        User.getUser(req.cookies.username, function (user) {
            if (user) {
                Follow.getAllFollow(user["_id"], function (follows) {
                    Manga.getAllByObjId(follows.map((f) => {
                        return f["manga_id"];
                    }), function (mangas) {
                        res.success(follows.map((f) => {
                            f.manga = mangas.filter((m) => {
                                return m["_id"].toString() == f["manga_id"].toString();
                            })[0];
                            return f;
                        }));
                    }, function (err) {
                        res.error(3, err);
                    });
                }, function (err) {
                    res.error(2, err);
                });
            }
            else {
                res.error(2, "User " + req.cookies.username + " not found");
            }
        }, function (err) {
            res.error(1, err);
        });
    },
    "unfollow": function (req, res) {
        if (req.body.id) {
            if (req.cookies.username) {
                User.getUser(req.cookies.username, function (user) {
                    Follow.unfollow(user["_id"], req.body.id, function () {
                        res.success();
                    }, function (err) {
                        res.error(4, err);
                    });
                }, function (err) {
                    res.error(3, err);
                });
            }
            else {
                res.error(2, "You have not logged in yet");
            }
        }
        else {
            res.error(1, "Please specify the id of the manga");
        }
    }
}
