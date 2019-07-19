/* eslint-disable global-require, no-console */

/**
 * Script Usage:
 *   $ node change_password.js [username] [password]
 * for change a user's password with given password
 */

// Include
const MongoUnitTest = require('../test/lib/mongo_unit_test');

// Initiate user api
let User;

// Get username and password from command line
const username = process.argv[2];
const password = process.argv[3];

// Check if username and password exists
if (username && password) {
  MongoUnitTest({
    begin(next) {
      User = require('../api/user');
      next();
    },
    tests: [
      (next, error) => {
        // Start add user using username and password
        User.forceChangePassword(username, password, (success) => {
          if (success) {
            console.log(`User ${username} password changed`);
          } else {
            console.log(`User ${username} password has not changed successfully`);
          }
          next();
        }, error);
      },
    ],
  });
} else {
  // If not, then send error message
  console.error('Please specify username and password: ');
  console.error('\tUsage: node change_password.js [username] [password]');
}
