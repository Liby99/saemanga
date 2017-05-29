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
var debug = require("keeling-js/lib/debug");
var scheduler = require("keeling-js/lib/scheduler");

// Create and start server
var server = keeling.createServer();

// use cookie
server.use(require("./api/cookie"));

// Start all the tasks
scheduler._tasks.forEach(function (task) {
    debug.log("Pre run scheduled task [" + task.name + "]");
    task.task();
});

// Start the server
server.start();
