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
    }
}
