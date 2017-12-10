const ObjectID = require("./lib/object_id");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Mangas = Mongo.db.collection("manga");
const Cartoonmad = require("./cartoonmad");

function hasUpdate (oldManga, newManga) {
    if (newManga["dmk_id_gen"] != oldManga["dmk_id_gen"] ||
        newManga["dmk_id_web"] != oldManga["dmk_id_web"]) {
        return true;
    }
    else {
        if (oldManga.episodes.length != newManga.episodes.length) {
            return true;
        }
        else {
            if (oldManga.info.ended != newManga.info.ended) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}

module.exports = {
    
    get (dmkId, callback, error) {
        Mangas.findOne({ "dmk_id": dmkId }, function (err, manga) {
            if (err) {
                error(err);
            }
            else if (manga) {
                callback(manga);
            }
            else {
                Cartoonmad.getMangaInfo(dmkId, function (manga) {
                    manga["insert_date"] = new Date();
                    manga["update_date"] = new Date();
                    Mangas.insertOne(manga, function (err, result) {
                        if (err) {
                            error(err);
                        }
                        else {
                            manga["_id"] = result["insertedId"];
                            callback(manga);
                        }
                    });
                }, error);
            }
        });
    },
    
    getAll (dmkIds, callback, error) {
        var self = this;
        Mangas.find({
            "dmk_id": {
                $in: dmkIds
            }
        }).toArray(function (err, mangas) {
            if (err) {
                error(err);
            }
            else {
                if (mangas.length == dmkIds) {
                    callback(mangas);
                }
                else {
                    var gotIds = mangas.map((manga) => manga["dmk_id"]);
                    var diff = dmkIds.filter((id) => !id in gotIds);
                    (function p (i) {
                        if (i < diff.length) {
                            self.get(diff[i], (m) => {
                                mangas.push(m);
                                p(i + 1);
                            }, error);
                        }
                        else {
                            callback(mangas);
                        }
                    })(0);
                }
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
    
    getAllByObjId (mangaIds, callback, error) {
        Mangas.find({
            "_id": {
                $in: mangaIds.map((id) => ObjectID(id))
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
    
    update (dmkId, callback, error) {
        Mangas.findOne({ "dmk_id": dmkId }, function (err, manga) {
            if (err) {
                error(err);
            }
            else if (manga) {
                Cartoonmad.getMangaInfo(dmkId, function (newManga) {
                    if (hasUpdate(manga, newManga)) {
                        newManga["insert_date"] = new Date();
                        newManga["update_date"] = new Date();
                        Mangas.findOneAndUpdate({
                            "dmk_id": dmkId
                        }, newManga, function (err, result) {
                            if (err) {
                                error(err);
                            }
                            else {
                                callback({
                                    updated: true,
                                    manga: newManga
                                });
                            }
                        });
                    }
                    else {
                        callback({
                            updated: false,
                            manga: manga
                        });
                    }
                }, error);
            }
            else {
                error(new Error("Manga " + dmkId + " does not exist"));
            }
        });
    },
    
    updateAll (dmkIds, callback, error) {
        (function p (i) {
            if (i < dmkIds.length) {
                var dmkId = dmkIds[i];
                Cartoonmad.getMangaInfo(dmkId, function (manga) {
                    manga["update_date"] = new Date();
                    Mangas.findOneAndUpdate({
                        "dmk_id": dmkId
                    }, {
                        $setOnInsert: {
                            "insert_date": new Date()
                        },
                        $set: manga
                    }, {
                        "upsert": true
                    }, function (err, result) {
                        if (err) {
                            Debug.error(err);
                        }
                        else {
                            Debug.log("Successfully updated manga " + dmkId);
                        }
                        p(i + 1)
                    });
                }, function (err) {
                    Debug.error(err);
                    p(i + 1);
                });
            }
            else {
                callback();
            }
        })(0)
    },
    
    updateOldest50 (callback, error) {
        Mangas.find({
            ended: false
        }, {
            sort: {
                "update_date": 1
            }
        }).limit(50).toArray(function (err, mangas) {
            if (err) {
                error(err);
            }
            else {
                (function p (i) {
                    if (i < mangas.length) {
                        var oi = mangas[i];
                        var dmkId = oi["dmk_id"];
                        Cartoonmad.getMangaInfo(dmkId, function (ni) {
                            ni["insert_date"] = oi["insert_date"];
                            ni["update_date"] = new Date();
                            Mangas.findOneAndUpdate({
                                "dmk_id": dmkId
                            }, ni, function (err, result) {
                                if (err) {
                                    Debug.error("Error inserting manga " + dmkId);
                                }
                                p(i + 1);
                            });
                        }, function (err) {
                            Debug.error("Error updating manga " + dmkId);
                            p(i + 1);
                        });
                    }
                    else {
                        callback();
                    }
                })(0);
            }
        });
    }
}
