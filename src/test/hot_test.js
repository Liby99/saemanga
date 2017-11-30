const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo");
const Genre = require("../api/genre");
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
        var gs = Genre.get();
        (function p(i) {
            if (i < gs.length) {
                Cartoonmad.getHotMangaOfGenre(gs[i].dir, function (ids) {
                    console.log(gs[i].type + ": [" + ids + "]");
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
        const Hot = require("../api/hot");
        Hot.refresh(function () {
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
        const Hot = require("../api/hot");
        Hot.getLatestIds(function (ids) {
            console.log("Latest: [" + ids + "]");
            Hot.getIdsOfGenre("comic04", function (ids) {
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
