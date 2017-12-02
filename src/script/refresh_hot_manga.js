const MongoUnitTest = require("../test/lib/mongo_unit_test");
var Hot, Manga;

MongoUnitTest({
    begin (next) {
        Hot = require("../api/hot");
        Manga = require("../api/manga");
        next();
    },
    tests: [
        function (next, error) {
            var start = new Date();
            Hot.refresh(function (ids) {
                Manga.fetchAll(ids, function () {
                    var diff = new Date().getTime() - start.getTime();
                    console.log("Successfully fetched " + ids.length + " mangas");
                    console.log("Time elapsed: " + Math.round(diff / 1000) + "s");
                    next();
                }, error);
            }, error);
        }
    ]
});
