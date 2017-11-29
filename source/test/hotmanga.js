const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");
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
        const MangaType = require("../api/mangaType");
        MangaType.get(function (types) {
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
        });
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
            HotManga.getIdsOfType("5a1df0ec880bd215441c6dd0", function (ids) {
                console.log("Zhan Guo: [" + ids + "]");
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
