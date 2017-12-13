const Cartoonmad = require("./cartoonmad");
const Genre = require("./genre");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Hots = Mongo.db.collection("hot");

function unique(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

module.exports = {
    
    /**
     * Refresh the database of hot mangas. Basically clean up the database and
     * then fetch all the data and insert them into database
     */
    refresh (callback, error) {
        this.clear();
        this.fetch(callback, error);
    },
    
    /**
     * Clear up the hot manga database
     */
    clear () {
        Hots.remove({});
    },
    
    refreshLatest () {
        this.clearLatest();
        this.fetchLatest(function (ids) {
            callback(ids);
        }, error);
    },
    
    clearLatest () {
        Hots.remove({
            "genre_dir": ""
        });
    },
    
    refreshAllGenres () {
        this.clearAllGenres();
        this.fetchAllGenres(function (ids) {
            callback(ids);
        }, error);
    },
    
    clearAllGenres () {
        Hots.remove({
            "genre_dir": {
                $ne: ""
            }
        });
    },
    
    /**
     * Fetch the latest hot manga ids and latest mangas of each genre
     */
    fetch (callback, error) {
        var self = this;
        self.fetchLatest(function (ids1) {
            self.fetchAllGenres(function (ids2) {
                callback(unique(ids1.concat(ids2)));
            }, error);
        }, error);
    },
    
    /**
     * Fetch the latest manga
     * @param  {Function} callback function when succeeded
     */
    fetchLatest (callback, error) {
        Cartoonmad.getHotManga(function (ids) {
            Hots.insertMany(ids.map((id, i) => {
                return {
                    "dmk_id": id,
                    "genre_dir": "",
                    "order": i
                }
            }), function (err) {
                if (err) {
                    error(err);
                }
                else {
                    callback(ids);
                }
            });
        }, error);
    },
    
    fetchAllGenres (callback, error) {
        var self = this, gs = Genre.get(), ids = [];
        (function p(i) {
            i < gs.length ? self.fetchGenre(gs[i], (gids) => {
                ids = ids.concat(gids);
                p(i + 1);
            }, (err) => {
                error(err);
            }) : callback(ids);
        })(0);
    },
    
    fetchGenre (genre, callback, error) {
        Cartoonmad.getHotMangaOfGenre(genre.dir, function (ids) {
            Hots.insertMany(ids.map((id, i) => {
                return {
                    "dmk_id": id,
                    "genre_dir": genre.dir,
                    "order": i
                };
            }), function (err) {
                if (err) {
                    error(err);
                }
                else {
                    callback(ids);
                }
            });
        }, error);
    },
    
    getLatestIds (callback, error) {
        this.getIdsOfGenre("", callback, error);
    },
    
    getIdsOfGenre (genreDir, callback, error) {
        Hots.find({
            "genre_dir": genreDir
        }, {
            "fields": { "dmk_id": 1 }
        }).toArray(function (err, ids) {
            if (err) {
                error(err);
            }
            else {
                callback(ids.map((obj) => obj["dmk_id"]));
            }
        });
    },
    
    getLatest (callback, error) {
        this.getGenre("", callback, error);
    },
    
    getGenre (genreDir, callback, error) {
        Hots.aggregate([{
            $match: { "genre_dir": genreDir }
        }, {
            $sort: { "order": 1 }
        }, {
            $lookup: {
                from: "manga",
                localField: "dmk_id",
                foreignField: "dmk_id",
                as: "manga"
            }
        }, {
            $unwind: "$manga"
        }, {
            $replaceRoot: {
                newRoot: "$manga"
            }
        }]).toArray(function (err, mangas) {
            if (err) {
                error(err);
            }
            else {
                callback(mangas);
            }
        });
    }
}
