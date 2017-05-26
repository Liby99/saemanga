var mysql = require("../module/mysql.js");
var util = require("../module/util.js");
var Creeper = require("../api/creeper.js");
var Database = require("../api/database.js");
var ProcessUUID = require("../api/uuid.js");

module.exports = function (req, res, callback) {
    ProcessUUID(req, res, function (req, res, UUID) {
        callback({});
    });
}
