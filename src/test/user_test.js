/* eslint no-console: off, global-require: off */

const assert = require('assert');
const MongoUnitTest = require('./lib/mongo_unit_test');

const USERNAME_1 = 'scripttest_1';
const USERNAME_2 = 'scripttest_2';
const PASSWORD = '12345678';
const WRONG_PASSWORD = '123456789';

let User;

MongoUnitTest({
  begin(n) {
    User = require('../api/user');
    n();
  },
  tests: [

    (n, e) => {
      console.log('Testing Add User... ');
      User.addUser(USERNAME_1, PASSWORD, (id) => {
        try {
          assert.notEqual(id, null);
          console.log('Passed');
          n();
        } catch (err) {
          e(err);
        }
      }, e);
    },

    (n, e) => {
      console.log('Testing Has User 1... ');
      User.hasUser(USERNAME_1, (has1) => {
        try {
          assert.equal(has1, true);
          console.log('Passed');
          n();
        } catch (err) {
          e(err);
        }
      }, e);
    },

    (n, e) => {
      console.log('Testing Not Existing User 2... ');
      User.hasUser(USERNAME_2, (has2) => {
        try {
          assert.equal(has2, false);
          console.log('Passed');
          n();
        } catch (err) {
          e(err);
        }
      }, e);
    },

    (n, e) => {
      console.log('Testing Successful Login... ');
      User.login(USERNAME_1, PASSWORD, (success) => {
        try {
          assert.equal(success, true);
          console.log('Passed');
          n();
        } catch (err) {
          e(err);
        }
      }, e);
    },

    (n, e) => {
      console.log('Testing User Not Existed Login... ');
      User.login(USERNAME_2, PASSWORD, (success) => {
        try {
          assert.equal(success, false);
          console.log('Passed');
          n();
        } catch (err) {
          e(err);
        }
      }, e);
    },

    (n, e) => {
      console.log('Testing Wrong Password Login... ');
      User.login(USERNAME_1, WRONG_PASSWORD, (s) => {
        try {
          assert.equal(s, false);
          console.log('Passed');
          n();
        } catch (err) {
          e(err);
        }
      }, e);
    },
  ],
  finish(cb) {
    User.removeUser(USERNAME_1, cb);
  },
});
