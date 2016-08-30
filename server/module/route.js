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
            res.render(file + ".html", function (err) {
                if (err) {
                    console.log(err);
                    if (file == "404") {
                        console.log("404 Page not found. Directly send error message");
                        res.send("404 Page Not Found");
                    }
                    else {
                        console.log("File " + file + ".html not found. Redirecting to 404");
                        res.redirect("404.html");
                    }
                }
                else {
                    console.log("Request " + file + ".html sent");
                }
            });
        }
        else {
            
            res.send(err);
        }
    }
}
