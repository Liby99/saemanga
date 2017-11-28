const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");
const Cartoonmad = require("../api/cartoonmad");

function testGet(callback) {
    console.log("-----Testing Getting Latest Manga-----");
    Cartoonmad.getHotManga(function (ids) {
        console.log("Latest: [" + ids + "]");
        callback();
    });
}

function testGetType(callback) {
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
}

function start() {
    console.log("Connecting to MongoDB...");
    Mongo.init(config, function () {
        console.log("Success!");
        var testList = [ testGet, testGetType ];
        (function p(i) {
            i < testList.length ? testList[i](() => p(i + 1)) : Mongo.close()
        })(0);
    });
}

start();
