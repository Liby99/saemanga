const Cartoonmad = require("./cartoonmad");
const Genre = require("./genre");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const HotMangas = Mongo.db.collection("hot_manga");

module.exports = {
    
    /**
     * Refresh the database of hot mangas. Basically clean up the database and
     * then fetch all the data and insert them into database
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
     * Fetch the latest hot manga ids and latest mangas of each genre
     */
    fetch (callback) {
        var self = this;
        self.fetchLatest(function () {
            self.fetchAllGenres(callback);
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
                    "genre_dir": ""
                }
            }), function (err) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    callback();
                }
            });
        });
    },
    
    fetchAllGenres (callback) {
        var self = this, gs = Genres.get();
        (function p(i) {
            i < gs.length ? self.fetchGenre(gs[i], () => p(i + 1)) : callback();
        })(0);
    },
    
    fetchGenre (genre, callback) {
        Cartoonmad.getHotMangaOfGenre(genre.dir, function (ids) {
            HotMangas.insertMany(ids.map((id) => {
                return {
                    "dmk_id": id,
                    "genre_dir": genre.dir
                };
            }), function (err) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    callback();
                }
            });
        });
    },
    
    getLatestIds (callback) {
        this.getIdsOfGenre("", callback);
    },
    
    getIdsOfGenre (genreDir, callback) {
        HotMangas.find({
            "genre_dir": genreDir
        }, {
            "fields": { "dmk_id": 1 }
        }).toArray(function (err, ids) {
            if (err) {
                throw new Error(err);
            }
            else {
                callback(ids.map((obj) => obj["dmk_id"]));
            }
        });
    }
}
