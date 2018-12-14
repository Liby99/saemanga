const MongoUnitTest = require('../../test/lib/mongo_unit_test');

module.exports = (obj) => {
  MongoUnitTest({
    begin(next) {
      if (obj.begin) {
        obj.begin(next);
      }
      next();
    },
    tests: [
      (next, error) => {
        obj.task(next, error);
      },
    ],
  });
};
