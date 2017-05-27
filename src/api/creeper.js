var request = require("request");
var http = require("http");
var jsdom = require("jsdom");
var iconv = require("iconv-lite");
var BufferHelper = require("bufferhelper");

var authorRegex = /\>\s+原創作者：\s([\S]+)\<\/td\>/;
var episodeRegex = /\/comic\/([\d]{4})([\d]{4})[\d]{7}.html/;
var imageUrlRegex = /src\=\"http:\/\/web(\d?)\.cartoonmad.com\/([\d|\w]{11})\/([\d]{4})\/[\d]{3}\/[\d]{3}\.jpg/;

function getHomepageWindow(callback) {
    jsdom.env({
        url: "http://cartoonmad.com/",
        done: function (err, window) {
            var $ = require("jquery")(window);
            callback($);
        }
    });
}

function getName($) {
    return $("input[name=name]").attr("value");
}

function getLatestEpisode ($) {
    var list = $("fieldset tr td a");
    for (var i = list.length - 1; i >= 0; i--) {
        var href = list.eq(i).attr("href");
        if (href.match(episodeRegex)) {
            return parseInt(href.match(episodeRegex)[2]);
        }
    }
    throw new Error("Latest Episode Not Found");
}

function getEnded($) {
    return $("body").children("table").children("tbody").html().match(/image\/chap1\.gif/) != null;
}

function getMangaId($, callback) {
    var list = $("fieldset tr td a");
    var href = "";
    for (var i = 0; i < list.length; i++) {
        if (list.eq(i).attr("href").match(episodeRegex)) {
            href = list.eq(i).attr("href").match(episodeRegex);
            break;
        }
    }
    jsdom.env({
        url: "http://cartoonmad.com" + href,
        done: function (err, window) {
            if (err) {
                console.log("Error Requesting http://cartoonmad.com" + href);
                callback(undefined);
            }
            else {
                var $ = require("jquery")(window);
                try {
                    var match = $("body table tbody").html().match(imageUrlRegex);
                    callback({
                        dmk_id: parseInt(match[3]),
                        dmk_id_gen: match[2],
                        dmk_id_web: match[1]
                    });
                }
                catch (ex) {
                    console.log("Error Getting Manga Id From: ");
                    //console.log($("body table tbody").html());
                    console.log(ex);
                    callback(undefined);
                }
            }
        },
        error: function (err) {
            console.log("Error Occured In Getting Manga Id");
        }
    });
}

function getMangaWindow(id, callback) {
    jsdom.env({
        url: "http://cartoonmad.com/comic/" + id + ".html",
        done: function (err, window) {
            if (err) {
                throw new Error("Error Occurs when getting manga window " + id);
            }
            else {
                var $ = require("jquery")(window);
                callback($);
            }
        }
    });
}

function getSearchHtml(value, callback) {
    var query = 'keyword=' + toByteString(value) + '&searchtype=all';
    var request = http.request({
        host: 'www.cartoonmad.com',
        path: '/search.html',
        port: '80',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(query)
        }
    }, function (res) {
        var bufferhelper = new BufferHelper();
        res.on('data', function (chunk) {
            bufferhelper.concat(chunk);
        });
        res.on('end', function () {
            callback(iconv.decode(bufferhelper.toBuffer(), 'Big5'));
        });
    });
    request.on("error", function (err) {
        console.log("Error Getting Search Html");
    });
    request.write(query);
    request.end();
}

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

module.exports = {
    getHotManga: function (callback) {
        getHomepageWindow(function ($) {
            var list = $("body").children("table").eq(0).children("tbody").eq(0).children("tr").eq(0).children("td").eq(1)
                    .children("table").eq(0).children("tbody").eq(0).children("tr").eq(3).children("td").eq(0)
                    .children("table").eq(0).children("tbody").eq(0).children("tr").eq(1).children("td").eq(1)
                    .children("table").eq(0).children("tbody").eq(0).children("tr");
            var list1 = list.eq(2).children("td");
            var list2 = list.eq(4).children("td");
            var hrefRegex = /comic\/([\d]{4})\.html/;
            var result = [];
            for (var i = 0; i < 10; i++) {
                result.push({
                    dmk_id: (i < 5 ? list1.eq(i) : list2.eq(i - 5)).children("a").attr("href").match(hrefRegex)[1],
                    name: (i < 5 ? list1.eq(i) : list2.eq(i - 5)).children("a").text()
                });
            }
            callback(result);
        });
    },
    getMangaInfo: function (id, callback) {
        getMangaWindow(id, function ($) {
            try {
                var info = new Object();
                info.name = getName($);
                info.ended = getEnded($) ? 0 : 1; // 0 is ended, 1 is still updating
                info.latest_episode = getLatestEpisode($);
                getMangaId($, function (id) {
                    if (id) {
                        info.dmk_id = id.dmk_id;
                        info.dmk_id_gen = id.dmk_id_gen;
                        info.dmk_id_web = id.dmk_id_web;
                        callback(info);
                    }
                    else {
                        console.log("Error Occurs while getting manga " + id + ": ");
                        callback(undefined);
                    }
                });
            }
            catch (ex) {
                console.log("Error Occurs while getting manga " + id + ": ");
                console.log(ex);
                callback(undefined);
            }
        });
    },
    search: function (value, callback) {
        getSearchHtml(value, function (data) {
            var reg = /\<a href\=comic\/([\d]+).html title=\"([\s\S]{1,30})\"\>\<span class\=\"covers\"\>\<\/span\>/g;
            var matches = [], found;
            while (found = reg.exec(data)) {
                matches.push({
                    id: found[1],
                    name: found[2]
                });
            }
            callback(matches);
        });
    }
}
