const Debug = require("keeling-js/lib/debug");
const Manga = require("../api/manga");

module.exports = {
    name: "refresh oldest 50 manga",
    schedule: "25 * * * *",
    task: function () {
        Debug.log("Refreshing oldest 50 mangas");
        Manga.updateOldest50(function () {
            Debug.log("Successfully refreshed oldest 50 mangas");
        }, function (err) {
            Debug.error("Error fetching manga info " + err);
        });
    }
};
