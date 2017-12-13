const Debug = require("keeling-js/lib/debug");
const Hot = require("../api/hot");
const Manga = require("../api/manga");

module.exports = {
    name: "refresh hot manga genres",
    schedule: "*/4 * * *",
    task: function () {
        Debug.log("Refreshing hot mangas genres");
        Hot.refreshAllGenres(function (ids) {
            Manga.updateAll(ids, function () {
                Debug.log("Successfully fetched " + ids.length + " mangas");
            }, function (err) {
                Debug.error("Error fetching manga info " + err);
            });
        }, function (err) {
            Debug.error("Error refreshing hot manga " + err);
        });
    }
};
