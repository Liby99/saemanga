const MongoUnitTest = require("../../test/lib/mongo_unit_test");

module.exports = function RunScript (obj) {
    MongoUnitTest({
        begin (next) {
            if (obj.begin) {
                obj.begin(next);
            }
            next();
        },
        tests: [
            function (next, error) {
                obj.task(next, error);
            }
        ]
    });
}
