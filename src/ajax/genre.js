const Genre = require('../api/genre');

module.exports = {
  get(req, res) {
    res.success(Genre.get());
  },
};
