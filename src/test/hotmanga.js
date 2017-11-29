const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");
const Type = require("../api/type");
const Cartoonmad = require("../api/cartoonmad");

var testList = [
    
    /**
     * [testGet description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function testGet (callback) {
        console.log("-----Testing Getting Latest Manga-----");
        Cartoonmad.getHotManga(function (ids) {
            console.log("Latest: [" + ids + "]");
            callback();
        });
    },
    
    /**
     * [testGetType description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function testGetType (callback) {
        console.log("-----Testing Getting Manga of Type-----");
        var types = MangaType.get();
        (function p(i) {
            if (i < types.length) {
                Cartoonmad.getHotMangaOfType(types[i].dir, function (ids) {
                    console.log(types[i].type + ": [" + ids + "]");
                    p(i + 1);
                });
            }
            else {
                callback();
            }
        })(0);
    },
    
    /**
     * [testAPIFetch description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function testAPIFetch (callback) {
        console.log("-----Test Fetching-----");
        const HotManga = require("../api/hotManga");
        HotManga.refresh(function () {
            console.log("Successfully Fetched All Hot Manga");
            callback();
        });
    },
    
    /**
     * [testGetFromDB description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function testGetFromDB (callback) {
        console.log("-----Test Getting From DB-----");
        const HotManga = require("../api/hotManga");
        HotManga.getLatestIds(function (ids) {
            console.log("Latest: [" + ids + "]");
            HotManga.getIdsOfType("comic04", function (ids) {
                console.log("Comic 04: [" + ids + "]");
                callback();
            });
        });
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
