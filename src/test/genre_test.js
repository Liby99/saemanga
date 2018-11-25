/* eslint no-console: off */

const assert = require('assert');
const Genre = require('../api/genre');
const UnitTest = require('./lib/unit_test');

UnitTest({
  tests: [
    function testGet(next) {
      console.log('-----Test Genre Get-----');
      const gs = Genre.get();
      console.log(gs);
      assert(gs.length !== 0);
      next();
    },
  ],
});
