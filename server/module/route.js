/**
 *
 */
 
var path = require("path");
var config = require("../data/config.json");

exports.set = function (server) {
    
    /**
     * Regular File router
     */
    server.get(/\.html(\?(.\=.\&)+)?$/, process);
    server.post(/\.html(\?(.\=.\&)+)?$/, process);
}

function process(req, res) {
    var file = req.path.substring(0, req.path.indexOf(".html"));
    try {
        
        //Check if there's a route written
        var route = require("../route/" + file + ".js");
        route(req, res);
    }
    catch (ex) {
        
        //First load the option
        var options = {
            root: path.resolve(__dirname + "../../../public/"),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        }
        
        //Try send the static file
        res.sendFile(file + ".html", options, function (err) {
            if (err) {
                
                //If there's error finding the file,
                res.sendFile(config["404_page"], options, function (err) {
                    if (err) {
                        
                        //If there's a 404 page error, then send regular failure string
                        res.status(404).send("Sorry, There's no such file");
                    }
                    else {
                        console.log("Request " + file + ".html failed. 404 Sent");
                    }
                });
            }
            else {
                console.log("Request " + file + ".html sent");
            }
        });
    }
}
