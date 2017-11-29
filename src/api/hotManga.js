const ObjectID = require('mongodb').ObjectID;
const Cartoonmad = require("./cartoonmad");
const MangaType = require("./mangaType");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const HotMangas = Mongo.db.collection("hot_manga");

module.exports = {
    
    /**
     * Refresh the database of hot mangas. Basically clean up the database and
     * then fetch all the data and insert them into database
     * @return {[type]} [description]
     */
    refresh (callback) {
        this.clear();
        this.fetch(callback);
    },
    
    /**
     * Clear up the hot manga database
     */
    clear () {
        HotMangas.remove({});
    },
    
    /**
     * Fetch the latest hot manga ids and latest mangas of each types
     */
    fetch (callback) {
        var self = this;
        self.fetchLatest(function () {
            self.fetchAllTypes(callback);
        });
    },
    
    /**
     * Fetch the latest manga
     * @param  {Function} callback function when succeeded
     */
    fetchLatest (callback) {
        Cartoonmad.getHotManga(function (ids) {
            HotMangas.insertMany(ids.map((id) => {
                return {
                    "dmk_id": id,
                    "type": "latest"
                }
            }), function (err) {
                if (err) {
                    Debug.error(err);
                }
                else {
                    callback();
                }
            });
        });
    },
    
    fetchAllTypes (callback) {
        var self = this;
        MangaType.get(function (types) {
            (function p(i) {
                i < types.length ?
                    self.fetchType(types[i], () => p(i + 1)) :
                    callback()
            })(0);
        });
    },
    
    fetchType (type, callback) {
        Cartoonmad.getHotMangaOfType(type.dir, function (ids) {
            HotMangas.insertMany(ids.map((id) => {
                return {
                    "dmk_id": id,
                    "type": type["_id"]
                };
            }), function (err) {
                if (err) {
                    Debug.error(err);
                }
                else {
                    callback();
                }
            });
        });
    },
    
    getLatestIds (callback) {
        HotMangas.find({
            "type": "latest"
        }, {
            "fields": {
                "dmk_id": 1
            }
        }).toArray(function (err, ids) {
            if (err) Debug.error(err);
            else callback(ids.map((obj) => obj["dmk_id"]));
        });
    },
    
    getIdsOfType (typeId, callback) {
        HotMangas.find({
            "type": ObjectID(typeId)
        }, {
            "fields": {
                "dmk_id": 1
            }
        }).toArray(function (err, ids) {
            if (err) {
                Debug.error(err);
            }
            else {
                callback(ids.map((obj) => obj["dmk_id"]));
            }
        });
    }
}
