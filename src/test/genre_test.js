const Genre = require("../api/genre");

function testGet() {
    console.log("-----Test Genre Get-----");
    var gs = Genre.get();
    console.log(gs);
}

function start() {
    testGet();
}

start();
