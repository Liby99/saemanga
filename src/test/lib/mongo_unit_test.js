const Mongo = require("keeling-js/lib/mongo");
const config = require("../../data/mongo");
const UnitTest = require("./unit_test");

module.exports = function (obj) {
    UnitTest({
        begin (cb) {
            console.log("Connecting to MongoDB...");
            Mongo.init(config, function () {
                console.log("Success!");
                if (obj.begin) {
                    obj.begin(cb);
                }
                else {
                    cb();
                }
            });
        },
        finish () {
            if (obj.finish) {
                obj.finish(function () {
                    Mongo.close();
                });
            }
            else {
                Mongo.close();
            }
        },
        tests: obj.tests
    });
}
