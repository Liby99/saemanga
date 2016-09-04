var mysql = require("../module/mysql.js");
var util = require("../module/util.js");
var Creeper = require("../api/creeper.js");
var Database = require("../api/database.js");
var ProcessUUID = require("../api/uuid.js");

module.exports = function (req, res) {
    ProcessUUID(req, res, function (req, res, UUID) {
        if (req.headers["user-agent"]) {
            mysql.query("INSERT INTO `user` SET `register_date_time` = NOW(), `last_login` = NOW(), ?", {
                UUID: UUID,
                agent: req.headers["user-agent"]
            }, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                }
                else {
                    res.updateUUID(UUID);
                    res.render("index");
                }
            });
        }
        else {
            res.sendStatus(403);
        }
    });
}
