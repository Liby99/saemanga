var express = require("express");
var config = require("./server/data/config.js");

function setDateTime() {
    require("./server/module/datetime.js")();
}

function setCookie(server) {
    server.use(require("cookie-parser")());
    server.use(require("./server/handler/cookie.js"));
}

function setRouting(server) {
    setDefaultPage(server);
    setPageHandler(server);
    setStaticField(server);
}

function setDefaultPage(server) {
    server.get("/", function (req, res) {
        res.redirect("/" + config["default_page"]);
    });
}

function setPageHandler(server) {
    require("./server/handler/page.js").set(server);
}

function setStaticField(server) {
    var fields = ["/css", "/js", "/fonts", "/img", "/view"];
    fields.forEach(function (obj, number) {
        server.use(obj, express.static(require("path").resolve("./public/" + obj)));
    });
}

function setAjax(server) {
    require("./server/module/ajax.js").set(server);
}

function setSchedule() {
    require("./server/handler/schedule.js").set();
}

(function () {
    var server = express();
    
    setDateTime();
    setCookie(server);
    setRouting(server);
    setAjax(server);
    setSchedule();
    
    server.use(function (err, req, res, next) {
        console.log("Server Error: " + err);
        next(err);
    });
    
    server.listen(config['port'], function () {
        console.log(config['name'] + ' Server Now Listening to Port ' + config['port']);
    });
})();
