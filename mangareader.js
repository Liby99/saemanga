var express = require("express");

function setConfig() {
    process.env.config = require("./server/data/config.json");
}

function setDateTime() {
    require("./server/module/datetime.js")();
}

function setCookie(server) {
    server.use(require("cookie-parser")());
    server.use(require("./server/api/cookie.js"));
}

function setRenderEngine(server) {
    server.set("views", __dirname + "/public");
    server.engine(".html", require("ejs").__express);
    server.set('view engine', "html");
}

function setRoute(server) {
    setDefaultPage(server);
    setStaticField(server);
    setPageHandler(server);
}

function setDefaultPage(server) {
    server.get("/", function (req, res) {
        res.redirect("/" + process.env.config["default_page"]);
    });
}

function setStaticField(server) {
    process.env.config["static_field"].forEach(function (obj, number) {
        server.use(obj, express.static(__dirname + "/public/" + obj));
    });
}

function setPageHandler(server) {
    require("./server/module/route.js").set(server);
}

function setAjax(server) {
    require("./server/module/ajax.js").set(server);
}

function setSchedule() {
    require("./server/api/schedule.js").set();
}

(function () {
    var server = express();
    
    setDateTime();
    setCookie(server);
    setRenderEngine(server);
    setRoute(server);
    setAjax(server);
    setSchedule();
    
    server.use(function (err, req, res, next) {
        console.log("Server Error: " + err);
        next(err);
    });
    
    server.listen(process.env.config['port'], function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(process.env.config['name'] + ' Server Now Listening to Port ' + process.env.config['port']);
        }
    });
})();
