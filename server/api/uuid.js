var util = require("../module/util.js");
<<<<<<< HEAD
=======
var mysql = require("../module/mysql.js");
>>>>>>> 7f5fb2e4a77ec56c23e4f5e55303528049fd9627

module.exports = function (req, res, callback) {
    if (req.cookies.UUID) {
        res.touchUUID();
        callback(req, res, req.cookies.UUID);
    }
    else {
        if (req.headers["user-agent"]) {
            var UUID = util.UUID();
            mysql.query("INSERT INTO `user` SET `register_date_time` = NOW(), `last_login` = NOW(), ?", {
                UUID: UUID,
                agent: req.headers["user-agent"]
            }, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                }
                else {
                    res.updateUUID(UUID);
                    callback(req, res, UUID);
                }
            });
        }
        else {
            res.sendStatus(403);
        }
    }
};
