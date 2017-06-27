/**
 * Cartoonmad Creeper
 * @author Liby99
 */

const request = require("./request");
const debug = require("keeling-js/lib/debug");

const hrefRegex = /comic\/([\d]{4})\.html/;
const authorRegex = /\>\s+原創作者：\s([\S]+)\<\/td\>/;
const episodeRegex = /\/comic\/([\d]{4})([\d]{4})[\d]{7}.html/;
const imageUrlRegex = /src\=\"http:\/\/web(\d?)\.cartoonmad.com\/([\d|\w]{11})\/([\d]{4})\/[\d]{3}\/[\d]{3}\.jpg/;
const searchResultRegex = /\<a href\=comic\/([\d]+).html title=\"([\s\S]{1,30})\"\>\<span class\=\"covers\"\>\<\/span\>/g;

function getHomepageWindow(callback) {
    request.get("http://www.cartoonmad.com", function ($) {
        callback($);
    }, function (err) {
        throw new Error("Error when getting homepage");
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
    request.get("http://cartoonmad.com" + href, function ($) {
        try {
            var match = $("body table tbody").html().match(imageUrlRegex);
            callback({
                dmk_id: parseInt(match[3]),
                dmk_id_gen: match[2],
                dmk_id_web: match[1]
            });
        }
        catch (ex) {
            console.log("Error Parsing Manga Id: ");
            console.log(ex);
            callback(undefined);
        }
    }, function (err) {
        throw new Error("Error Getting Manga Id");
    });
}

function getMangaWindow(id, callback) {
    request.get("http://cartoonmad.com/comic/" + id + ".html", function ($) {
        callback($);
    }, function (err) {
        throw new Error("Error Occurs when getting manga window " + id);
    });
}

function getSearchHtml(value, callback) {
    var query = "keyword=" + toByteString(value) + "&searchtype=all";
    request.post("http://www.cartoonmad.com/search.html", query, function ($) {
        callback($);
    }, function (err) {
        throw new Error("Error Getting Search Result HTML");
    });
}

function toByteString(str) {
    var buf = iconv.encode(str, "Big5");
    var hex = buf.toString("hex");
    var ret = "";
    for (var i = 0; i < hex.length; i += 2) {
        ret += "%";
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
            var result = [];
            for (var i = 0; i < 10; i++) {
                var id = (i < 5 ? list1.eq(i) : list2.eq(i - 5)).children("a");
                var dmk_id = id.attr("href").match(hrefRegex)[1];
                result.push({
                    dmk_id: dmk_id,
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
                getMangaId($, callback);
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
            var matches = [], found;
            while (found = searchResultRegex.exec(data)) {
                matches.push({
                    id: found[1],
                    name: found[2]
                });
            }
            callback(matches);
        });
    }
}
