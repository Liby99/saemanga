const GENRES = require('../data/app/genre');
const GENRES_FULL = require('../data/app/genre_full');

module.exports = {

  get() {
    return GENRES;
  },

  getFull() {
    return GENRES_FULL;
  },

  getNameByDir(dir) {
    const genre = GENRES.filter(obj => obj.dir === dir)[0];
    return genre && genre.name;
  },
};
