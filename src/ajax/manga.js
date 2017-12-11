const Cartoonmad = require("../api/cartoonmad");
const User = require("../api/user");
const Follow = require("../api/follow");
const Manga = require("../api/manga");

module.exports = {
    "search": function (req, res) {
        Cartoonmad.search(req.body.query, function (ids) {
            res.success(ids);
        }, function (err) {
            Debug.error(err);
            res.error(1, err);
        });
    },
    "get_following_manga": function (req, res) {
        User.getUser(req.cookies.username, function (user) {
            if (user) {
                Follow.getAllFollow(user["_id"], function (follows) {
                    res.success(follows);
                }, function (err) {
                    Debug.error(err);
                    res.error(2, err);
                });
            }
            else {
                res.error(2, "User " + req.cookies.username + " not found");
            }
        }, function (err) {
            Debug.error(err);
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
                        Debug.error(err);
                        res.error(4, err);
                    });
                }, function (err) {
                    Debug.error(err);
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
    },
    "get_info": function (req, res) {
        if (req.body.id) {
            Manga.get(req.body.id, function (manga) {
                if (manga) {
                    res.success(manga);
                }
                else {
                    res.error(3, "Manga with id " + req.body.id + " not found");
                }
            }, function (err) {
                Debug.error(err);
                res.error(2, err);
            });
        }
        else {
            res.error(1, "Please specify manga id");
        }
    },
    "refresh_manga_info": function (req, res) {
        if (req.body.id) {
            Manga.update(req.body.id, function (om) {
                if (om) {
                    res.success(om);
                }
                else {
                    res.error(3, "Manga with id " + req.body.id + " not found");
                }
            }, function (err) {
                Debug.error(err);
                res.error(2, err);
            });
        }
        else {
            res.error(1, "Please specify manga id");
        }
    }
}
