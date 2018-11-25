const Mongo = require('keeling-js/lib/mongo');
const Cartoonmad = require('./cartoonmad');
const Genre = require('./genre');
const Promise = require('./lib/promise');

const Hots = Mongo.db.collection('hot');

function unique(a) {
  return a.sort().filter((item, pos, ary) => !pos || item !== ary[pos - 1]);
}

module.exports = {

  /**
   * Refresh the database of hot mangas. Basically clean up the database and
   * then fetch all the data and insert them into database
   */
  refresh(callback, error) {
    this.clear();
    this.fetch(callback, error);
  },

  /**
   * Clear up the hot manga database
   */
  clear() {
    Hots.remove({});
  },

  refreshLatest(callback, error) {
    this.clearLatest();
    this.fetchLatest((ids) => {
      callback(ids);
    }, error);
  },

  clearLatest() {
    Hots.remove({
      genre_dir: '',
    });
  },

  refreshAllGenres(callback, error) {
    this.clearAllGenres();
    this.fetchAllGenres((ids) => {
      callback(ids);
    }, error);
  },

  clearAllGenres() {
    Hots.remove({
      genre_dir: {
        $ne: '',
      },
    });
  },

  /**
   * Fetch the latest hot manga ids and latest mangas of each genre
   */
  fetch(callback, error) {
    const self = this;
    self.fetchLatest((ids1) => {
      self.fetchAllGenres((ids2) => {
        callback(unique(ids1.concat(ids2)));
      }, error);
    }, error);
  },

  /**
   * Fetch the latest manga
   * @param  {Function} callback function when succeeded
   */
  fetchLatest(callback, error) {
    Cartoonmad.getHotManga((ids) => {
      Hots.insertMany(ids.map((id, i) => ({
        dmk_id: id,
        genre_dir: '',
        order: i,
      })), (err) => {
        if (err) {
          error(err);
        } else {
          callback(ids);
        }
      });
    }, error);
  },

  fetchAllGenres(callback, error) {
    const self = this; const gs = Genre.get(); let
      ids = [];
    Promise.all(gs, (genreDir, i, c, e) => {
      self.fetchGenre(genreDir, (gids) => {
        ids = ids.concat(gids);
        c();
      }, e);
    }, () => {
      callback(ids);
    }, error);
  },

  fetchGenre(genre, callback, error) {
    Cartoonmad.getHotMangaOfGenre(genre.dir, (ids) => {
      Hots.insertMany(ids.map((id, i) => ({
        dmk_id: id,
        genre_dir: genre.dir,
        order: i,
      })), (err) => {
        if (err) {
          error(err);
        } else {
          callback(ids);
        }
      });
    }, error);
  },

  getLatestIds(callback, error) {
    this.getIdsOfGenre('', callback, error);
  },

  getIdsOfGenre(genreDir, callback, error) {
    Hots.find({
      genre_dir: genreDir,
    }, {
      fields: { dmk_id: 1 },
    }).toArray((err, ids) => {
      if (err) {
        error(err);
      } else {
        callback(ids.map(obj => obj.dmk_id));
      }
    });
  },

  getLatest(callback, error) {
    this.getGenre('', callback, error);
  },

  getGenre(genreDir, callback, error) {
    Hots.aggregate([{
      $match: { genre_dir: genreDir },
    }, {
      $sort: { order: 1 },
    }, {
      $lookup: {
        from: 'manga',
        localField: 'dmk_id',
        foreignField: 'dmk_id',
        as: 'manga',
      },
    }, {
      $unwind: '$manga',
    }, {
      $replaceRoot: {
        newRoot: '$manga',
      },
    }]).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else {
        callback(mangas);
      }
    });
  },
};
