
// Require Keeling-js Module
var mysql = require("keeling-js/lib/mysql");

// Process UUID Function
var processUUID = require("../api/uuid.js");

module.exports = function (req, res, callback) {
    processUUID(req, res, function (req, res, UUID) {
        callback({});
    });
}
