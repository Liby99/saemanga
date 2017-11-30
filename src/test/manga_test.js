const assert = require("assert");
const config = require("../data/mongo.json");
const Mongo = require("keeling-js/lib/mongo");
const Cartoonmad = require("../api/cartoonmad");

var testList = [
    
    /**
     * [testGet description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function testScrapper (callback) {
        console.log("-----Testing Get Manga-----");
        Cartoonmad.getMangaInfo(5967, function (info) {
            console.log(info);
            callback();
        });
    },
    
    /**
     * [testGetType description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function testFetch (callback) {
        console.log("-----Testing Fetch-----");
        const Manga = require("../api/manga");
        Manga.fetch(5967, callback);
    },
    
    function testUpdate (callback) {
        console.log("-----Testing Update-----");
        const Manga = require("../api/manga");
        Manga.fetch(5967, callback);
    }
];

function start() {
    console.log("Connecting to MongoDB...");
    Mongo.init(config, function () {
        console.log("Success!");
        (function p(i) {
            i < testList.length ? testList[i](() => p(i + 1)) : Mongo.close()
        })(0);
    });
}

start();
