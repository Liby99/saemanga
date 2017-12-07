const Genre = require("../api/genre");
const User = require("../api/user");

function getGenre(req, res, callback) {
    var gs = Genre.get();
    callback(gs);
}

function getUser(req, res, hasUser, noUser) {
    var username = req.cookies.username;
    var loggedIn = username != undefined;
    if (loggedIn) {
        User.getUser(username, function (user) {
            hasUser(user);
        }, function () {
            res.error(403, "User " + username + " not exists");
        });
    }
    else {
        noUser();
    }
}

module.exports = function (req, res, callback) {
    getGenre(req, res, function (gs) {
        getUser(req, res, function hasUser (user) {
            callback({
                genres: gs,
                user: user
            });
        }, function noUser () {
            callabck({
                genres: gs
            });
        });
    });
};
