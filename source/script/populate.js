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
    var id = 0, exit = () => process.exit(1);
    list[id](() => ++id < list.length ? list[id]() : exit(), exit);
}

function start() {
    console.log("Connecting to MongoDB...");
    Mongo.init(config, function () {
        console.log("Success!");
        populate();
    });
}

start();
