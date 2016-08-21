/**
 * 
 */

var crypto = require("crypto");
var util = require("./util.js");

/**
 * Encrypt the password with the salt
 * @param salt
 * @param password
 */
exports.encrypt = function (salt, password) {
    return encrypt(salt, password);
}

/**
 * Check if the given password is correct
 * @param password, the password to be checked
 * @param encrypted, the encrypted password stored
 */
exports.match = function (password, encrypted) {
    var salt = encrypted.substring(0, 6);
    return encrypt(salt, password) === encrypted;
}

/**
 * Generate Encrypted Password that is going to be stored
 * @param password, the password to be encrypted by new salt
 */
exports.genEncrypted = function (password) {
    return encrypt(util.generateSalt(), password);
}

/**
 * Encrypt the password with the salt
 * @param salt
 * @param password
 */
function encrypt(salt, password) {
    var hash = crypto.createHash('sha256').update(salt + password).digest('base64');
    return salt + hash;
}