const assert = require("assert");
const MongoUnitTest = require("./lib/mongo_unit_test");
const Cartoonmad = require("../api/cartoonmad");

var Manga;

MongoUnitTest({
    
    begin (next) {
        
        Manga = require("../api/manga");
        next();
    },
    tests: [
        
        function (next, error) {
            console.log("-----Testing Scrapper Get Non Existing Manga-----");
            Cartoonmad.getMangaInfo(11, error, function (err) {
                console.log("Error thrown. Passed");
                next();
            });
        },
        
        function (next, error) {
            console.log("-----Testing Scrapper Get Manga 5967-----");
            Cartoonmad.getMangaInfo(5967, function (info) {
                console.log(info);
                next();
            }, error);
        },
            
        function (next, error) {
            console.log("-----Testing Scrapper Get Manga 1152-----");
            Cartoonmad.getMangaInfo(1152, function (info) {
                console.log(info);
                next();
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing Fetch-----");
            const Manga = require("../api/manga");
            Manga.fetch(5967, function (id) {
                console.log(id);
                next();
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing Update-----");
            const Manga = require("../api/manga");
            Manga.fetch(5967, function (id) {
                console.log(id);
                next();
            }, error);
        }
    ]
});
