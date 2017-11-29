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
                    "type_dir": ""
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
        var self = this, ts = MangaType.get();
        (function p(i) {
            i < ts.length ? self.fetchType(ts[i], () => p(i + 1)) : callback();
        })(0);
    },
    
    fetchType (type, callback) {
        Cartoonmad.getHotMangaOfType(type.dir, function (ids) {
            HotMangas.insertMany(ids.map((id) => {
                return {
                    "dmk_id": id,
                    "type_dir": type.dir
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
        this.getIdsOfType("", callback);
    },
    
    getIdsOfType (typeDir, callback) {
        HotMangas.find({
            "type_dir": typeDir
        }, {
            "fields": { "dmk_id": 1 }
        }).toArray(function (err, ids) {
            if (err) Debug.error(err);
            else callback(ids.map((obj) => obj["dmk_id"]));
        });
    }
}
