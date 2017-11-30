const Cartoonmad = require("./cartoonmad");
const Genre = require("./genre");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Hots = Mongo.db.collection("hot");

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
    
    /**
     * Fetch the latest hot manga ids and latest mangas of each genre
     */
    fetch (callback, error) {
        var self = this;
        self.fetchLatest(function (ids1) {
            self.fetchAllGenres(function (ids2) {
                callback(ids1.concat(ids2));
            }, error);
        }, error);
    },
    
    /**
     * Fetch the latest manga
     * @param  {Function} callback function when succeeded
     */
    fetchLatest (callback, error) {
        Cartoonmad.getHotManga(function (ids) {
            Hots.insertMany(ids.map((id) => {
                return {
                    "dmk_id": id,
                    "genre_dir": ""
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
            Hots.insertMany(ids.map((id) => {
                return {
                    "dmk_id": id,
                    "genre_dir": genre.dir
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
    
    getAll (callback, error) {
        Hots.find({}, {
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
    }
}
