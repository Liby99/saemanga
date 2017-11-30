const ObjectID = require("./lib/object_id");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Mangas = Mongo.db.collection("manga");
const Cartoonmad = require("./cartoonmad");

module.exports = {
    
    REFRESH_TIME: 30, // In Minutes
    FULL_REFRESH_RATE: 120, // In Minutes
    
    update (callback) {
        Mangas.find({
            "ended": false
        }, {
            "sort": { "update_date": 1 }
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
                                ni["update_date"] = new Date();
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
    
    /**
     * Fetch the manga info from scrapper and put the data into database.
     * If the manga is already in the database then return void,
     * If not then return the newly inserted <mangaId>
     * @param  {Number}   dmkId    dmk_id
     * @param  {Function} callback
     * @return {void|string}       <mangaId>
     */
    fetch (dmkId, callback) {
        Cartoonmad.getMangaInfo(dmkId, function (manga) {
            manga["update_date"] = new Date();
            Mangas.findOneAndUpdate({
                "dmk_id": dmkId
            }, manga, {
                "upsert": true,
                "new": true
            }, function (err, ret) {
                if (err) {
                    throw err;
                }
                else {
                    var leo = ret["lastErrorObject"];
                    if (leo["updatedExisting"]) {
                        callback(ret["value"]["_id"]);
                    }
                    else {
                        callback(leo["upserted"]);
                    }
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
    },
    
    getByObjId (mangaId, callback) {
        Mangas.findOne({
            "_id": ObjectID(mangaId)
        }, function (err, manga) {
            if (err) {
                throw new Error(err);
            }
            else {
                callback(manga);
            }
        });
    }
}
