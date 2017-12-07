const User = require("../api/user");

module.exports = function (req, res, cb) {
    var username = req.cookies.username;
    var loggedIn = username != undefined;
    if (loggedIn) {
        User.getUser(username, function (user) {
            cb({
                loggedIn: loggedIn,
                user: user
            });
        }, function () {
            cb({ loggedIn: loggedIn });
        });
    }
    else {
        cb({ loggedIn: loggedIn });
    }
};
