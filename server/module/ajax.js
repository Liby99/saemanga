/**
 *
 */

var bodyParser = require("body-parser");
var response = require("./response.js");
var verification = require("./verification.js");

/**
 * The settlement of ajax processing for the given server
 */
exports.set = function (server) {
    
    //Using Body Parser
    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());
    
    //Using Response Middleware
    server.use(response);
    
    //Pass all the requests to process function
    server.get("/ajax/*", process);
    server.post("/ajax/*", process);
}

/**
 * Process the requirement
 */
function process(req, res) {
    
    //Try get the handler
    try {
        
        //Get the handler specified from the request
        var handler = require("../handler/" + req.params[0] + ".js");
        
        //Check if the request contains the request action
        if (req.query["action"]) {
            
            //Check if the handler has the action
            if (typeof handler[req.query["action"]]["handle"] === "function") {
                
                //Try execute the request
                try {
                
                    //Create context object
                    var context = {
                        request: req,
                        response: res
                    }
                    
                    handler[req.query["action"]](context);
                }
                catch (ex) {
                    
                    //Log the error
                    console.log(ex);
                    res.error(417, "Expectation Failed");
                }
            }
            else {
                res.error(404, "Action Not Found");
            }
        }
        else {
            res.error(404, "No Action Specified");
        }
    }
    catch (ex) {
        console.error(ex);
        res.error(404, "Handler Not Found");
    }
}
