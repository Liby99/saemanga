const Debug = require("keeling-js/lib/debug");
const Hot = require("../api/hot");
const Manga = require("../api/manga");

module.exports = {
    "get_latest": function (req, res) {
        Hot.getLatest(function (mangas) {
            res.success(mangas);
        }, function (err) {
            Debug.error(err);
            res.error(1, "Error getting hot manga ids");
        });
    },
    "get_genre": function (req, res) {
        Hot.getGenre(req.query["genre_dir"], function (mangas) {
            res.success(mangas);
        }, function (err) {
            Debug.error(err);
            res.error(1, "Error getting hot manga of genre " + req.query["genre_dir"]);
        });
    }
}
