const Debug = require('keeling-js/lib/debug');
const Hot = require('../api/hot');

module.exports = {
  get_latest(req, res) {
    Hot.getLatest((mangas) => {
      res.success(mangas);
    }, (err) => {
      Debug.error(err);
      res.error(1, 'Error getting hot manga ids');
    });
  },
  get_genre(req, res) {
    Hot.getGenre(req.query.genre_dir, (mangas) => {
      res.success(mangas);
    }, (err) => {
      Debug.error(err);
      res.error(1, `Error getting hot manga of genre ${req.query.genre_dir}`);
    });
  },
};
