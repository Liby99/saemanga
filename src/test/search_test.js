/* eslint no-console: off */

const assert = require('assert');
const Cartoonmad = require('../api/cartoonmad');
const UnitTest = require('./lib/unit_test');

UnitTest({
  tests: [

    (next, error) => {
      console.log('-----Testing Search Empty-----');
      Cartoonmad.search('', (ids) => {
        error(new Error('Should throw error'));
      }, (err) => {
        console.log('passed');
        next();
      });
    },

    (next, error) => {
      console.log('-----Testing Search Trimmed Empty-----');
      Cartoonmad.search('    ', (ids) => {
        error(new Error('Should throw error'));
      }, (err) => {
        console.log('passed');
        next();
      });
    },

    (next, error) => {
      console.log('-----Testing search with no result-----');
      Cartoonmad.search('哈哈哈', (ids) => {
        try {
          assert(ids.length == 0);
          console.log('passed');
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },

    (next, error) => {
      console.log('-----Testing 刀剑-----');
      Cartoonmad.search('刀剑', (ids) => {
        try {
          assert(ids.length != 0);
          console.log(ids);
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },

    (next, error) => {
      console.log('-----Testing 抱歉-----');
      Cartoonmad.search('抱歉', (ids) => {
        try {
          assert(ids.length != 0);
          console.log(ids);
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },

    (next, error) => {
      console.log('-----Testing 小埋-----');
      Cartoonmad.search('小埋', (ids) => {
        try {
          assert(ids.length != 0);
          console.log(ids);
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },
  ],
});
