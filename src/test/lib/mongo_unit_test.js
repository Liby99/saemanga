/* eslint no-console: off */

const Mongo = require('keeling-js/lib/mongo');
const config = require('../../data/mongo');
const UnitTest = require('./unit_test');

module.exports = (obj) => {
  UnitTest({
    begin(cb) {
      console.log('Connecting to MongoDB...');
      Mongo.init(config, () => {
        console.log('Success!');
        if (obj.begin) {
          obj.begin(cb);
        } else {
          cb();
        }
      });
    },
    finish() {
      if (obj.finish) {
        obj.finish(() => {
          Mongo.close();
        });
      } else {
        Mongo.close();
      }
    },
    tests: obj.tests,
  });
};
