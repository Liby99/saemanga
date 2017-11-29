const request = require("request");
const http = require("http");
const jquery = require("jquery");
const { JSDOM } = require("jsdom");
const iconv = require("iconv-lite");
const BufferHelper = require("bufferhelper");

function parseUrl(url) {
    if (url.indexOf("http://") == 0) {
        url = url.substring(7);
    }
    if (url.indexOf("/") >= 0) {
        var index = url.indexOf("/");
        return {
            host: url.substring(0, index),
            path: url.substring(index)
        };
    }
    else {
        return {
            host: url
        }
    }
}

function toWindow(body) {
    var dom = new JSDOM(body);
    return jquery(dom.window);
}

module.exports = {
    get: function (url, success, error) {
        request({
            url: url,
            encoding: null
        }, function (err, response, body) {
            if (err) {
                error(err);
            }
            else {
                var cbody = iconv.decode(body, "Big5");
                success(toWindow(cbody));
            }
        });
    },
    post: function (url, data, success, error) {
        var parsedUrl = parseUrl(url);
        console.log(parsedUrl);
        var request = http.request({
            host: parsedUrl.host,
            path: parsedUrl.path,
            port: '80',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        }, function (res) {
            var bufferhelper = new BufferHelper();
            res.on('data', function (chunk) {
                bufferhelper.concat(chunk);
            });
            res.on('end', function () {
                var decoded = iconv.decode(bufferhelper.toBuffer(), "Big5");
                success(toWindow(decoded));
            });
        });
        request.on("error", function (err) {
            error(err);
        });
        request.write(data);
        request.end();
    }
}
