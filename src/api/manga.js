const ObjectID = require("./lib/object_id");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Mangas = Mongo.db.collection("manga");
const Cartoonmad = require("./cartoonmad");

module.exports = {
    
    REFRESH_TIME: 30, // In Minutes
    FULL_REFRESH_RATE: 120, // In Minutes
    
    update (callback, error) {
        Mangas.find({
            "ended": false
        }/*, {
            "sort": { "update_date": 1 }
        }*/).toArray(function (err, mangas) {
            if (err) {
                error(err);
            }
            else {
                
                // Only update a portion of all
                // var portion = REFRESH_TIME / FULL_REFRESH_RATE;
                // var count = Math.floor(portion * mangas.length);
                
                var count = mangas.length;
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
                                    
                                    if (err)
                                        Debug.error("Error updating manga " + dmkId + ": " + err);
                                    
                                    // Continue regardless of error
                                    p(i + 1);
                                });
                            }
                        }, function (err) {
                            
                            // When getting error, continue
                            Debug.error("Error getting manga " + dmkId + ": " + err);
                            p(i + 1);
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
    
    hasUpdate (dmkId, callback, error) {
        this.get(dmkId, function (oldInfo) {
            Cartoonmad.getMangaInfo(dmkId, function (newInfo) {
                callback(newInfo.episodes.length > oldInfo.episodes.length);
            }, error);
        }, error);
    },
    
    fetchAll (ids, callback, error) {
        var self = this;
        (function p(i) {
            if (i < ids.length) {
                self.fetch(ids[i], () => {
                    p(i + 1);
                }, (err) => {
                    
                    // Continue without handling error
                    Debug.error(err);
                    p(i + 1);
                });
            }
            else {
                callback();
            }
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
    fetch (dmkId, callback, error) {
        Cartoonmad.getMangaInfo(dmkId, function (manga) {
            manga["update_date"] = new Date();
            Mangas.findOneAndUpdate({
                "dmk_id": dmkId
            }, manga, {
                "upsert": true,
                "new": true
            }, function (err, ret) {
                if (err) {
                    error(err);
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
        }, error);
    },
    
    get (dmkId, callback, error) {
        Mangas.findOne({ "dmk_id": dmkId }, function (err, manga) {
            if (err) {
                error(err);
            }
            else {
                callback(manga);
            }
        });
    },
    
    getByObjId (mangaId, callback, error) {
        Mangas.findOne({
            "_id": ObjectID(mangaId)
        }, function (err, manga) {
            if (err) {
                error(err);
            }
            else {
                callback(manga);
            }
        });
    },
    
    getAll (dmkIds, callback, error) {
        Mangas.find({
            "dmk_id": {
                $in: dmkIds
            }
        }).toArray(function (err, mangas) {
            if (err) {
                error(err);
            }
            else {
                callback(mangas);
            }
        });
    },
    
    getAllByObjId (mangaIds, callback, error) {
        Mangas.find({
            "_id": {
                $in: mangaIds
            }
        }).toArray(function (err, mangas) {
            if (err) {
                error(err);
            }
            else {
                callback(mangas);
            }
        });
    }
}
