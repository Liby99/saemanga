const Crypto = require("keeling-js/lib/crypto");
const Mongo = require("keeling-js/lib/mongo");
const Users = Mongo.db.collection("user");
const ObjectID = require('mongodb').ObjectID;

const usernameReg = /^[A-Za-z0-9@\-\_\.\#\*]{4,16}$/;
const passwordReg = /^[A-Za-z0-9@\-\_\.\#\*]{8,32}$/;

function encrypt(password) {
    return Crypto.genEncrypted(password);
}

function generateUser(username, password) {
    return {
        "username": username,
        "password": encrypt(password),
        "register_date_time": new Date(),
        "last_login": new Date(),
        "last_visit": new Date(),
        "login_amount": 1,
        "visit_amount": 1,
        "love": []
    }
}

module.exports = {
    
    /**
     * Check if the user with the username already existed in the database.
     * @param {string} username
     * @param {Function} callback Callback that takes a boolean of whether the
     * user existed
     */
    hasUser (username, callback, error) {
        Users.findOne({
            "username": username
        }, function (err, user) {
            if (err) {
                error(new Error("Error checking user " + username + " existence: " + err));
            }
            else {
                if (user) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
        });
    },
    
    /**
     * Add a new user to the database specified by username and password. Will
     * abort if the username is already existed.
     * @param {string} username
     * @param {string} password
     * @param {Function} callback Callback function takes a boolean indicating
     * whether the add is successful
     */
    addUser (username, password, callback, error) {
        
        // First check if username and password exists
        if (!username) {
            error(new Error("Username not specified"));
            return;
        }
        if (!password) {
            error(new Error("Password not specified"));
            return;
        }
        
        // Then check if username and password meets criteria
        var um = username.match(usernameReg);
        if (!um) {
            error(new Error("Username not meeting criteria"));
            return;
        }
        var pm = password.match(passwordReg);
        if (!pm) {
            error(new Error("Password not meeting criteria"));
            return;
        }
        
        // Finally start searching for username existence
        Users.findOne({
            "username": username
        }, function (err, user) {
            if (err) {
                error(new Error("Error fetching user info: " + err));
            }
            else {
                if (user) {
                    error(new Error("Username " + username + " has already existed"));
                }
                else {
                    
                    // Then encrypt the password and save the entry to database
                    var user = generateUser(username, password);
                    Users.insertOne(user, function (err, res) {
                        if (err) {
                            error(new Error("Error inserting new user " + username + ": " + err));
                        }
                        else {
                            callback(res["insertedId"]);
                        }
                    });
                }
            }
        });
    },
    
    /**
     * Remove the user specified by the username
     * @param {string} username
     * @param {Function} callback Callback function takes a boolean of whether
     * the remove is successful
     */
    removeUser (username, callback, error) {
        Users.removeOne({
            "username": username
        }, function (err, ret) {
            if (err) {
                error(new Error("Error when removing user " + username + ": " + err));
            }
            else {
                callback(ret.result.n != 0);
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
    changePassword (username, oldPassword, newPassword, callback, error) {
        Users.findOne({
            "username": username
        }, function (err, user) {
            if (err) {
                error(new Error("Error when fetching user " + username + " info: " + err));
            }
            else {
                if (Crypto.match(oldPassword, user.password)) {
                    var encNewPwd = Crypto.genEncrypted(newPassword);
                    Users.update({
                        "username": username
                    }, {
                        $set: {
                            "password": encNewPwd
                        }
                    }, function (err, result) {
                        if (err) {
                            error(new Error("Error when updating user " + username + " password: " + err));
                        }
                        else {
                            callback(true);
                        }
                    });
                }
                else {
                    callback(false);
                }
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
    login (username, password, callback, error) {
        Users.findOne({
            "username": username
        }, function (err, user) {
            if (err) {
                error(new Error("Error when fetching user " + username + " info: " + err));
            }
            else {
                if (user) {
                    if (Crypto.match(password, user.password)) {
                        var sessionId = ObjectID();
                        Users.update({
                            "username": username
                        }, {
                            $set: {
                                "last_login": new Date(),
                                "last_visit": new Date(),
                                "session_id": sessionId
                            },
                            $inc: {
                                "login_amount": 1,
                                "visit_amount": 1
                            }
                        }, function (err, result) {
                            if (err) {
                                error(new Error("Error when updating user login info: " + err));
                            }
                            else {
                                callback(true, sessionId.toString());
                            }
                        });
                    }
                    else {
                        callback(false);
                    }
                }
                else {
                    callback(false);
                }
            }
        });
    },
    
    getUserWithSessionId: function (sessionId, callback, error) {
        Users.findOneAndUpdate({
            "session_id": ObjectID(sessionId)
        }, {
            $set: {
                "last_visit": new Date(),
            },
            $inc: {
                "visit_amount": 1
            }
        }, function (err, user) {
            if (err) {
                error(new Error("Error when fetching user with session id " + sessionId));
            }
            else {
                if (user) {
                    callback(user);
                }
                else {
                    error(new Error("User with session id " + sessionId + " not found"));
                }
            }
        });
    }
}
