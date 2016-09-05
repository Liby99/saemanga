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
    var file = req.path.substring(1, req.path.indexOf(".html"));
    try {
        
        //Check if there's a route written
        var route = require("../route/" + file + ".js");
        console.log("Route " + file + " Handling Request");
        route(req, res);
    }
    catch (err) {
        
        console.log(path.resolve(__dirname + "../../../public/"));
        
        //Check if the module exists
        if (err.code === "MODULE_NOT_FOUND") {
            
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
                
                //Check if there's an error rendering the static file.s
                if (err) {
                    
                    //Then Log the error
                    console.log(err);
                    if (file === "404") {
                        
                        //To avoid 404 recursively requested, if there's an error sending 404 page then directly send the error message
                        console.log("404 Page not found. Directly send error message");
                        res.status(404).send(config["404_message"]);
                    }
                    else {
                        
                        //If the request err is not 404, then directly send the 404 file.
                        console.log("File " + file + ".html not found. Redirecting to 404");
                        res.redirect("404.html");
                    }
                }
                else {
                    
                    //Directly Send the html success
                    console.log("Request " + file + ".html sent");
                }
            });
        }
        else {
            
            console.log(err);
            res.send(err);
        }
    }
}
