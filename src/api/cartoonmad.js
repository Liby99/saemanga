/**
 * Cartoonmad Scrapper
 * @author Liby99
 * @date 2017/11/28
 */

const Request = require("./lib/request");
const Debug = require("keeling-js/lib/debug");

// Url lists
const BASE_URL = "http://cartoonmad.com/";

// Regex lists
const COMIC_URL_REG = /^comic\/(\d+)\.html$/;
const COMIC_GENRE_REG = /^\/(comic\d\d).html$/;
const NUM_REG = /\d+/;
const COMIC_IMG_SRC_REG = /^http:\/\/(web\d)\.cartoonmad\.com\/([\w|\d]+)\//;

function getMangaUrl(id) {
    return BASE_URL + "comic/" + id + ".html";
}

function getEpisodeList($rs) {
    var arr = [];
    for (var i = 1; i < $rs.length; i++) {
        var $ds = $rs.eq(i).children("td");
        for (var j = 1; j < $ds.length; j++) {
            var $e = $ds.eq(j);
            var _epi = $e.text().trim();
            var _mepi = _epi.match(NUM_REG);
            if (_mepi) {
                arr.push(parseInt(_mepi[0]));
            }
            else {
                throw new Error("Error matching episode list");
            }
        }
    }
    return arr;
}

function extractHotMangaId($) {
    
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
                throw new Error("Error when matching id");
            }
        }
        else {
            throw new Error("Error finding manga href");
        }
    });
    
    // Check if there is id
    if (ids.length) {
        return ids;
    }
    else {
        throw new Error("No hot manga id found");
    }
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
            callback(extractHotMangaId($));
        }, function (err) {
            throw new Error("Internet connection error");
        });
    },
    
    /**
     * Get the hot manga of a certain genre (latest update) id array
     * @param  {Function} callback with array of manga id
     * @throw error when internet connection error
     */
    getHotMangaOfGenre (genreDir, callback) {
        
        // Get the base url
        Request.get(BASE_URL + genreDir + ".html", function ($) {
            callback(extractHotMangaId($));
        }, function (err) {
            throw new Error("Internet connection error");
        });
    },
    
    /**
     * Get manga info using dmk_id.
     * @param  {string|integer}   dmkId    id of dmk
     * @param  {Function} callback callback
     * @return {object}            manga info
     */
    getMangaInfo (dmkId, callback) {
        var url = getMangaUrl(dmkId);
        Request.get(url, function ($) {
            
            // Precache info
            var manga = { "dmk_id": dmkId, "info": {} };
            
            // Traverse
            var $ps = $("body").children("table").children("tbody")
                     .children("tr").eq(0).children("td").eq(1)
                     .children("table").children("tbody").children("tr");
                     
            // Get the header
            var $h = $ps.eq(2).children("td").eq(1).children("a").last();
            manga.info.title = $h.text();
            
            // Go to the main section
            var $m = $ps.eq(3).children("td").children("table")
                     .children("tbody").children("tr").eq(1).children("td")
                     .eq(1).children("table");
            
            // Get author
            var $t1 = $m.eq(0).children("tbody").children("tr");
            var _g = $t1.eq(2).children("td").children("a").eq(0).attr("href");
            var _gm = _t.match(COMIC_GENRE_REG);
            manga.info.genre_dir = _tm ? _tm[1] : "";
            var _as = $t1.eq(4).children("td").text().trim().split(" ");
            manga.info.author = _as[_as.length - 1];
            var $tags = $t1.eq(12).children("td").children("a");
            var _ta = Array.apply(1, { length: $tags.length });
            manga.info.tags = _ta.map((n, i) => $tags.eq(i).text());
            var _src = $t1.eq(6).find("img").last().attr("src");
            manga.info.ended = _src && (_src.indexOf("9") > 0 ? true : false);
            
            // Get Description
            var $t2 = $m.eq(1).find("tbody tr td fieldset table tbody tr td");
            manga.info.description = $t2.text().trim();
            
            // Get books and episodes
            var $t3 = $m.eq(2).find("tbody tr td fieldset table");
            if ($t3.length == 1) {
                manga.episodes = getEpisodeList($t3.eq(0).find("tbody tr"));
            }
            else {
                manga.books = getEpisodeList($t3.eq(0).find("tbody tr"));
                manga.episodes = getEpisodeList($t3.eq(1).find("tbody tr"));
            }
            
            // Get manga ids
            var epiurl = $t3.eq(0).find("tbody tr").eq(1).children("td").eq(1)
                         .children("a").attr("href").substring(1);
            Request.get(BASE_URL + epiurl, function ($) {
                var src = $("body > table > tbody > tr").eq(4).children("td")
                          .children("table").children("tbody").children("tr")
                          .eq(0).children("td").eq(0).children("a")
                          .children("img").attr("src");
                var msrc = src.match(COMIC_IMG_SRC_REG);
                if (msrc) {
                    manga.dmk_id_web = msrc[1];
                    manga.dmk_id_gen = msrc[2];
                    callback(manga);
                }
                else {
                    throw new Error("Img src info extraction error");
                }
            });
        });
    }
}