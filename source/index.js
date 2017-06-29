/**
 * File: entry.js
 * Author: liby99
 * Date:
 *
 * Default Entry point of keeling-js
 *
 * Note: you can move this into your own directory and modify it for
 * your own purpose.
 */

// Require the library
var keeling = require("keeling-js");

// Create and start server
var server = keeling.createServer();
server.start();
