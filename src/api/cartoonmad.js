/**
 * Cartoonmad Scrapper
 * @author Liby99
 * @date 2017/11/28
 */

const Request = require("./request");
const Debug = require("keeling-js/lib/debug");

// Url lists
const BASE_URL = "http://cartoonmad.com/";

// Regex lists
const COMIC_URL_REG = /^comic\/(\d+)\.html$/;
const COMIC_TYPE_REG = /^\/(comic\d\d).html$/;
const NUM_REG = /\d+/;
const COMIC_IMG_SRC_REG = /^http:\/\/(web\d)\.cartoonmad\.com\/([\w|\d]+)\//;

function getMangaUrl(id) {
    return "http://www.cartoonmad.com/comic/" + id + ".html";
}

function getEpisodeList($rs) {
    var arr = [];
    for (var i = 1; i < $rs.length; i++) {
        var $ds = $rs.eq(i).children("td");
        for (var j = 1; j < $ds.length; j++) {
            var $e = $ds.eq(j);
            var _epi = $e.text().trim();
            var _mepi = _epi.match(NUM_REG);
            if (_mepi) arr.push(parseInt(_mepi[0]));
        }
    }
    return arr;
}

module.exports = {
    
    /**
     * Get all the hot manga (latest update) id array
     * @param  {Function} callback with array of manga id
     * @throw error when internet connection error
     */
    getHotManga (callback) {
        
        // Get the base url
        Request.get(BASE_URL, function ($) {
            
            // First get $r, all the hot mangas
            var $rs = $("body").children("table").children("tbody")
                      .children("tr").eq(0).children("td").eq(1)
                      .children("table").children("tbody").children("tr").eq(3)
                      .children("td").children("table").children("tbody")
                      .children("tr").eq(1).children("td").eq(1)
                      .children("table").children("tbody").children("tr");
            var $r = $rs.eq(2).append($rs.eq(4).children()).children();
            var ids = [];
            
            // Go through every element to get the id and append to ids
            $r.each(function () {
                var href = $(this).children("a").attr("href");
                if (href) {
                    var m = href.match(COMIC_URL_REG);
                    if (m) {
                        ids.push(m[1]);
                    }
                    else {
                        Debug.error("Error when matching id");
                    }
                }
                else {
                    Debug.error("Error finding manga href");
                }
            });
            
            // Check if there is id
            if (ids.length) {
                callback(ids);
            }
            else {
                Debug.error("No hot manga id found");
            }
        }, function (err) {
            Debug.error("Internet connection error");
        });
    },
    
    /**
     * Get the hot manga of a certain type (latest update) id array
     * @param  {Function} callback with array of manga id
     * @throw error when internet connection error
     */
    getHotMangaOfType (typeDir, callback) {
        
        // Get the base url
        Request.get(BASE_URL + typeDir + ".html", function ($) {
            
            // First get $r, all the hot mangas
            var $rs = $("body").children("table").children("tbody")
                      .children("tr").eq(0).children("td").eq(1)
                      .children("table").children("tbody").children("tr").eq(3)
                      .children("td").children("table").children("tbody")
                      .children("tr").eq(1).children("td").eq(1)
                      .children("table").children("tbody").children("tr");
            var $r = $rs.eq(2).append($rs.eq(4).children()).children();
            var ids = [];
            
            // Go through every element to get the id and append to ids
            $r.each(function () {
                var href = $(this).children("a").attr("href");
                if (href) {
                    var m = href.match(COMIC_URL_REG);
                    if (m) {
                        ids.push(m[1]);
                    }
                    else {
                        Debug.error("Error when matching id");
                    }
                }
                else {
                    Debug.error("Error finding manga href");
                }
            });
            
            // Check if there is id
            if (ids.length) {
                callback(ids);
            }
            else {
                Debug.error("No hot manga id found");
            }
        }, function (err) {
            Debug.error("Internet connection error");
        });
    },
    
    getMangaInfo (dmkId, callback) {
        var url = getMangaUrl(dmkId);
        Request.get(url, function ($) {
            
            // Precache info
            var info = { "dmk_id": dmkId };
            
            // Traverse
            var $ps = $("body").children("table").children("tbody")
                     .children("tr").eq(0).children("td").eq(1)
                     .children("table").children("tbody").children("tr");
                     
            // Get the header
            var $h = $ps.eq(2).children("td").eq(1).children("a").last();
            info.title = $h.text();
            
            // Go to the main section
            var $m = $ps.eq(3).children("td").children("table")
                     .children("tbody").children("tr").eq(1).children("td")
                     .eq(1).children("table");
            
            // Get author
            var $t1 = $m.eq(0).children("tbody").children("tr");
            var _t = $t1.eq(2).children("td").children("a").eq(0).attr("href");
            var _tm = _t.match(COMIC_TYPE_REG);
            info.type_dir = _tm ? _tm[1] : "";
            var _as = $t1.eq(4).children("td").text().trim().split(" ");
            info.author = _as[_as.length - 1];
            var $tags = $t1.eq(12).children("td").children("a");
            var _ta = Array.apply(1, { length: $tags.length });
            info.tags = _ta.map((n, i) => $tags.eq(i).text());
            var _imgsrc = $t1.eq(6).find("img").last().attr("src");
            info.ended = _imgsrc.indexOf("9") > 0 ? true : false;
            
            // Get Description
            var $t2 = $m.eq(1).find("tbody tr td fieldset table tbody tr td");
            info.description = $t2.text().trim();
            
            // Get books and episodes
            var $t3 = $m.eq(2).find("tbody tr td fieldset table");
            if ($t3.length == 1) {
                var $rs = $t3.eq(0).find("tbody tr");
                info.episodes = getEpisodeList($rs);
            }
            else {
                var $rs1 = $t3.eq(0).find("tbody tr");
                var $rs2 = $t3.eq(1).find("tbody tr");
                info.books = getEpisodeList($rs1);
                info.episodes = getEpisodeList($rs2);
            }
            
            // Get manga ids
            var epiurl = $t3.eq(0).find("tbody tr").eq(1).children("td").eq(1)
                         .children("a").attr("href");
            Request.get(BASE_URL + epiurl, function ($) {
                var src = $("body > table > tbody > tr").eq(4).children("td")
                          .children("table").children("tbody").children("tr")
                          .eq(0).children("td").eq(0).children("a")
                          .children("img").attr("src");
                var msrc = src.match(COMIC_IMG_SRC_REG);
                if (msrc) {
                    info.dmk_id_web = msrc[1];
                    info.dmk_id_gen = msrc[2];
                    callback(info);
                }
                else {
                    Debug.error("Img src info extraction error");
                }
            });
        });
    }
}
