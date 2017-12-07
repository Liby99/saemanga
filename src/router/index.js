const User = require("../api/user");

module.exports = function (req, res, callback) {
    var username = req.cookies.username;
    var loggedIn = username != undefined;
    if (loggedIn) {
        User.getUser(username, function (user) {
            callback({
                loggedIn: loggedIn,
                user: user
            });
        }, function () {
            callback({
                loggedIn: loggedIn,
                user: {}
            });
        });
    }
    else {
        callback({
            loggedIn: loggedIn,
            user: {}
        });
    }
};
