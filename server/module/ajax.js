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
                    
                    //Check the validity in the request
                    verify(context, handler, req.query.action, function () {
                        
                        //Call the handler
                        handler[req.query.action].handle(context);
                    });
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
        res.error(404, "Handler Not Found");
    }
}

function verify(context, handler, action, callback) {
    var requirement = handler[action].requirement;
    var request = context.request;
    
    //Loop through the field
    for (var field in requirement) {
        
        if (requirement[field] != null) {
        
            //Loop through the entry in the field
            for (var entry in requirement[field]) {
                
                //Check if the entry exists
                if (request[field][entry]) {
                    
                    //The entry in the request does not match the requirement
                    if (!verification[requirement[field][entry]](request[field][entry])) {
                        context.response.error(406, field + " " + entry + " invalid");
                        return;
                    }
                }
                else {
                    
                    //There's no such entry in the request
                    context.response.error(405, "Need " + field + " " + entry);
                    return;
                }
            }
        }
        else {
            
            //There's no such field in the request
            context.response.error(407, "Field " + field + " not exists");
        }
    }
    
    //No error is founc so callback
    callback();
}
