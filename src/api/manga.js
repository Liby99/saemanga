const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Mangas = Mongo.db.collection("manga");
const Cartoonmad = require("./cartoonmad");

/**
 * Manga Schema
 *  {
 *      _id: <ObjectId>,
 *      update_time: <Time>,
 *      dmk_id: <Int>,
 *      dmk_id_gen: <String>,
 *      dmk_id_web: <String>,
 *      books: [ <Int> ],
 *      episodes: [ <Int> ],
 *      info: {
 *          title: <String>,
 *          author: <String>,
 *          description: <String>,
 *          ended: <Boolean>,
 *          genre_dir: <String>,
 *          tags: [ <String> ]
 *      }
 *  }
 */

module.exports = {
    
    REFRESH_TIME: 30, // In Minutes
    FULL_REFRESH_RATE: 120, // In Minutes
    
    update (callback) {
        Mangas.find({
            "ended": false
        }, {
            "sort": { "update_time": 1 }
        }).toArray(function (err, mangas) {
            if (err) {
                throw new Error(err);
            }
            else {
                var portion = REFRESH_TIME / FULL_REFRESH_RATE;
                var count = Math.floor(portion * mangas.length);
                (function p(i) {
                    if (i < count) {
                        var oi = mangas[i];
                        var dmkId = oi["dmk_id"];
                        Cartoonmad.getMangaInfo(dmkId, function (ni) {
                            if (oi.episodes.length < ni.episodes.length) {
                                ni["update_time"] = new Date();
                                Mangas.update({
                                    "dmk_id": dmkId
                                }, ni, function (err) {
                                    if (err) {
                                        Debug.error(err);
                                    }
                                    p(i + 1);
                                });
                            }
                        });
                    }
                    else {
                        Debug.log("Finished updating all manga");
                        callback();
                    }
                })(0);
            }
        });
    },
    
    hasUpdate (dmkId, callback) {
        this.get(dmkId, function (oldInfo) {
            Cartoonmad.getMangaInfo(dmkId, function (newInfo) {
                callback(newInfo.episodes.length > oldInfo.episodes.length);
            });
        });
    },
    
    fetchAll (ids, callback) {
        var self = this;
        (function p(i) {
            i < ids.length ? self.fetch(ids[i], () => p(i + 1)) : callback()
        })(0);
    },
    
    fetch (dmkId, callback) {
        Cartoonmad.getMangaInfo(dmkId, function (manga) {
            manga["update_time"] = new Date();
            Mangas.update({
                "dmk_id": dmkId
            }, manga, {
                upsert: true
            }, function (err) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    callback();
                }
            });
        });
    },
    
    get (dmkId, callback) {
        Mangas.findOne({ "dmk_id": dmkId }, function (err, manga) {
            if (err) {
                throw new Error(err);
            }
            else {
                callback(manga);
            }
        });
    }
}
