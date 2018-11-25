const Crypto = require('keeling-js/lib/crypto');
const Mongo = require('keeling-js/lib/mongo');

const Users = Mongo.db.collection('user');

const usernameReg = /^[A-Za-z0-9@-_.#*]{4,16}$/;
const passwordReg = /^[A-Za-z0-9@-_.#*]{8,32}$/;

// const defaultLightMode = 'day';
// const defaultHandMode = 'right';
// const defaultScale = 100;

function validateUsername(username) {
  if (!username) {
    throw new Error('Username not specified');
  }

  const um = username.match(usernameReg);
  if (!um) {
    throw new Error('Username not meeting criteria');
  }
}

function validatePassword(password) {
  if (!password) {
    throw new Error('Password not specified');
  }

  const pm = password.match(passwordReg);
  if (!pm) {
    throw new Error('Password not meeting criteria');
  }
}

function encrypt(password) {
  return Crypto.genEncrypted(password);
}

function generateUser(username, password) {
  return {
    username,
    password: encrypt(password),
    register_date_time: new Date(),
    last_login: new Date(),
    last_visit: new Date(),
    login_amount: 1,
    visit_amount: 1,
    // "love": [],
    // "setting": {
    //     "light_mode": defaultLightMode,
    //     "hand_mode": defaultHandMode,
    //     "scale": defaultScale
    // }
  };
}

module.exports = {

  /**
     * Check if the user with the username already existed in the database.
     * @param {string} username
     * @param {Function} callback Callback that takes a boolean of whether the
     * user existed
     */
  hasUser(username, callback, error) {
    Users.findOne({
      username,
    }, (err, user) => {
      if (err) {
        error(new Error(`Error checking user ${username} existence: ${err}`));
      } else if (user) {
        callback(true);
      } else {
        callback(false);
      }
    });
  },

  getUser(username, callback, error) {
    Users.findOne({
      username,
    }, (err, user) => {
      if (err) {
        error(new Error(`Error checking user ${username} existence: ${err}`));
      } else {
        callback(user);
      }
    });
  },

  getAndTouchUser(username, callback, error) {
    const self = this;
    this.getUser(username, (user) => {
      if (user) {
        self.touchUser(username, () => {
          callback(user);
        }, error);
      } else {
        callback(undefined);
      }
    }, error);
  },

  /**
     * Add a new user to the database specified by username and password. Will
     * abort if the username is already existed.
     * @param {string} username
     * @param {string} password
     * @param {Function} callback Callback function takes a boolean indicating
     * whether the add is successful
     */
  addUser(username, password, callback, error) {
    try {
      validateUsername(username);
      validatePassword(password);
    } catch (err) {
      error(err);
      return;
    }

    Users.findOne({
      username,
    }, (err, user) => {
      if (err) {
        error(new Error(`Error fetching user info: ${err}`));
      } else if (user) {
        error(new Error(`Username ${username} has already existed`));
      } else {
        // Then encrypt the password and save the entry to database
        const genUser = generateUser(username, password);
        Users.insertOne(genUser, (err2, res) => {
          if (err2) {
            error(new Error(`Error inserting new user ${username}: ${err2}`));
          } else {
            callback(res.insertedId);
          }
        });
      }
    });
  },

  /**
     * Remove the user specified by the username
     * @param {string} username
     * @param {Function} callback Callback function takes a boolean of whether
     * the remove is successful
     */
  removeUser(username, callback, error) {
    Users.removeOne({
      username,
    }, (err, ret) => {
      if (err) {
        error(new Error(`Error when removing user ${username}: ${err}`));
      } else {
        callback(ret.result.n !== 0);
      }
    });
  },

  /**
     * Change the user password. The user has to specify his old password
     * correctly before setting up new password.
     * @param {string} username
     * @param {string} oldPassword
     * @param {string} newPassword
     * @param {Function} callback takes a boolean indicates whether the change
     * password is success or not.
     */
  changePassword(username, oldPassword, newPassword, callback, error) {
    try {
      validatePassword(oldPassword);
      validatePassword(newPassword);
    } catch (err) {
      error(err);
      return;
    }

    Users.findOne({
      username,
    }, (err, user) => {
      if (err) {
        error(new Error(`Error when fetching user ${username} info: ${err}`));
      } else if (Crypto.match(oldPassword, user.password)) {
        const encNewPwd = Crypto.genEncrypted(newPassword);
        Users.update({
          username,
        }, {
          $set: {
            password: encNewPwd,
          },
        }, (err2) => {
          if (err2) {
            error(new Error(`Error when updating user ${username} password: ${err2}`));
          } else {
            callback(true);
          }
        });
      } else {
        callback(false);
      }
    });
  },

  touchUser(username, callback, error) {
    Users.update({
      username,
    }, {
      $set: {
        last_visit: new Date(),
      },
      $inc: {
        visit_amount: 1,
      },
    }, (err) => {
      if (err) {
        error(new Error(`Error when updating user visit info: ${err}`));
      } else {
        callback();
      }
    });
  },

  /**
     * Check the user login credential and update the user login infos. Will
     * update the "last_login" to the current time and increment "visit_amount"
     * by 1.
     * @param {string} username
     * @param {string} password
     * @param {Function} callback Callback takes a boolean indicate whether
     * the login is successful
     */
  login(username, password, callback, error) {
    try {
      validateUsername(username);
      validatePassword(password);
    } catch (err) {
      error(err);
      return;
    }

    Users.findOne({
      username,
    }, (err, user) => {
      if (err) {
        error(new Error(`Error when fetching user ${username} info: ${err}`));
      } else if (user) {
        if (Crypto.match(password, user.password)) {
          Users.update({
            username,
          }, {
            $set: {
              last_login: new Date(),
              last_visit: new Date(),
            },
            $inc: {
              login_amount: 1,
              visit_amount: 1,
            },
          }, (err2) => {
            if (err2) {
              error(new Error(`Error when updating user login info: ${err2}`));
            } else {
              callback(true);
            }
          });
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }
    });
  },
};
