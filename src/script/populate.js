/**
 * Populate Script
 */

const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");

function populate() {
    
    // Put all populate functions here!!!
    var list = [
        require("../api/mangaType").populate
    ];
    
    // Iterate through populate list
    var exit = Mongo.close;
    (function p(i) {
        i < list.length ? list[i](() => p(i + 1), exit) : exit()
    })(0);
}

function start() {
    console.log("Connecting to MongoDB...");
    Mongo.init(config, function () {
        console.log("Success!");
        populate();
    });
}

start();
