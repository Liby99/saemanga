const assert = require("assert");
const Genre = require("../api/genre");
const UnitTest = require("./lib/unit_test");

UnitTest({
    tests: [
        function testGet(next, error) {
            console.log("-----Test Genre Get-----");
            var gs = Genre.get();
            console.log(gs);
            assert(gs.length != 0);
            next();
        }
    ]
});
