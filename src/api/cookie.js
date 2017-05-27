var mysql = require("keeling-js/lib/mysql");

module.exports = function (req, res, next) {

    res.touchUUID = function () {
        res.updateUUID(req.cookies.UUID);
    };

    res.touchUsername = function () {
        res.updateUsername(req.cookies.username);
    };

    res.updateUUID = function (UUID) {
        res.cookie("UUID", UUID, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });
        updateLastLogin(req.cookies.UUID);
    };

    res.updateUsername = function (username) {
        res.cookie("username", username, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) });
    };

    res.clearUUID = function () {
        res.clearCookie("UUID");
    };

    res.clearUsername = function () {
        res.clearCookie("username");
    };

    res.clearAll = function () {
        res.clearUUID();
        res.clearUsername();
    };

    next();
}

function updateLastLogin(UUID) {
    mysql.query("UPDATE `user` SET `last_login` = NOW() WHERE ?", {
        UUID: UUID
    });
}
