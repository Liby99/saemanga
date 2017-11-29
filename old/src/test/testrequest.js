let request = require("../api/request");
const iconv = require("iconv-lite");

function toByteString(str) {
    var buf = iconv.encode(str, 'Big5');
    var hex = buf.toString('hex');
    var ret = '';
    for (var i = 0; i < hex.length; i += 2) {
        ret += '%';
        ret += hex[i].toUpperCase();
        ret += hex[i + 1].toUpperCase();
    }
    return ret;
}

function testGet() {
    request.get("http://cartoonmad.com", function ($) {
        console.log($("body").html());
    }, function (err) {
        throw new Error("Error when getting cartoonmad homepage");
    });
}

function testPost() {
    var query = "keyword=" + toByteString("元气") + "&searchtype=all";
    request.post("http://cartoonmad.com/search.html", query, function ($) {
        console.log($("body").html());
    }, function (err) {
        throw new Error("Error when searching 元气 in Cartoonmad");
    })
}

testGet();
testPost();
