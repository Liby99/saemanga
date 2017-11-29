const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");

function testFind(callback) {
    const MangaTypes = Mongo.db.collection("manga_type");
    MangaTypes.find({}).toArray(function (err, types) {
        console.log(types);
    });
}

function start() {
    console.log("Connecting to MongoDB...");
    Mongo.init(config, function () {
        console.log("Success!");
        testFind();
    });
}

start();
