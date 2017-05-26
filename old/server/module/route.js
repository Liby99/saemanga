/**
 *
 */
 
var path = require("path");
var config = require("../data/config.json");
var debug = false;

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
        log("Router " + file + " handling request");
        route(req, res, function (data) {
            
            //Render the data and the file
            res.render(file, {
                "file": file,
                "data": data
            }, function (err, html) {
                
                //Check if there's error when rendering
                if (err) {
                    
                    console.log("Renderer Error: ");
                    console.log(err);
                    res.redirect("/error.html?err=500");
                }
                else {
                    
                    //If correct, then send html directly
                    res.status(200).send(html);
                }
            });
        });
    }
    catch (err) {
        
        //Check if the module exists
        if (err.code === "MODULE_NOT_FOUND") {
            
            //Try send the static file
            res.render(file + ".html", {
                "file": file
            }, function (err) {
                
                //Check if there's an error rendering the static file.s
                if (err) {
                    
                    //Then Log the error
                    console.log(err);
                    
                    if (file === "error") {
                        
                        //To avoid 404 recursively requested, if there's an error sending 404 page then directly send the error message
                        log("Directly sent static html " + file);
                        res.status(404).send(config["404_message"]);
                    }
                    else {
                        
                        //If the request err is not 404, then directly send the 404 file.
                        res.redirect("/error.html?err=404");
                    }
                }
                else {
                    log("Directly sent static html " + file);
                }
            });
        }
        else {
            
            console.log("Router " + file + " Error: ");
            console.log(err);
            res.redirect("/error.html?err=500");
        }
    }
}

function log(text) {
    if (debug) {
        console.log(text);
    }
}
