/**
 * 
 */

var fileUpload = require("express-fileupload");

/**
 * Set the file upload of the server
 */
exports.set = function (server) {
    server.use(fileUpload());
}