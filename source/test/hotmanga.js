const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");
const Cartoonmad = require("../api/cartoonmad");

function testGet() {
    Cartoonmad.getHotManga(function (ids) {
        console.log(ids);
    });
}

function start() {
    console.log("Connecting to MongoDB...");
    Mongo.init(config, function () {
        console.log("Success!");
        testGet();
    });
}
