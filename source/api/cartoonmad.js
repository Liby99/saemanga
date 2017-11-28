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

module.exports = {
    
    /**
     * Get all the hot manga (latest update) id array
     * @param  {Function} callback with array of manga id
     * @throw error when internet connection error
     */
    getHotManga: function (callback) {
        
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
    }
}
