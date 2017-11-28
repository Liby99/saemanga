/**
 * Populate Script
 */

// Start a keeling server to access database
var keeling = require("keeling-js");
var config = require("../data/config.json");
config.debug = false;
var server = keeling.createServer(config);

// Start server and start populate
server.start(function () {
    
    // Put all populate functions here!!!
    var list = [
        require("../api/mangaType").populate
    ];
    
    // Iterate through populate list
    var id = 0, exit = () => process.exit(1);
    list[id](() => ++id < list.length ? list[id]() : exit(), exit);
});
