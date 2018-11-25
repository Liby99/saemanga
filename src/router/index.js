const Debug = require('keeling-js/lib/debug');
const Genre = require('../api/genre');
const Follow = require('../api/follow');
const Hot = require('../api/hot');
const User = require('../api/user');

function getGenre(req, res, callback) {
  const gs = Genre.get();
  callback(gs);
}

function getLatestMangas(req, res, callback) {
  Hot.getLatest((mangas) => {
    callback(mangas);
  }, (err) => {
    Debug.error(err);
    res.error(500, err);
  });
}

function getUser(req, res, hasUser, noUser) {
  const { username } = req.cookies;
  const loggedIn = username !== undefined;
  if (loggedIn) {
    User.getAndTouchUser(username, (user) => {
      if (user) {
        hasUser(user);
      } else {
        res.clearCookie('username');
        res.error(403, `用户 ${username} 不存在`);
      }
    }, (err) => {
      res.error(500, err);
    });
  } else {
    noUser();
  }
}

function getFollows(req, res, user, callback) {
  Follow.getAllFollow(user._id, (follows) => {
    callback(follows.map(f => ({
      ...f,
      manga: {
        ...f.manga,
        lastEpisode: f.manga.episodes[f.manga.episodes.length - 1],
      },
      hasUpdate: f.max_episode < f.manga.lastEpisode,
      showBadge: f.up_to_date && f.hasUpdate,
    })));
  }, (err) => {
    res.error(500, err);
  });
}

module.exports = (req, res, callback) => {
  getGenre(req, res, (genres) => {
    getLatestMangas(req, res, (mangas) => {
      getUser(req, res, (user) => {
        getFollows(req, res, user, (follows) => {
          callback({
            genres,
            latests: mangas,
            loggedIn: true,
            user,
            follows,
          });
        });
      }, () => {
        callback({
          loggedIn: false,
          user: {},
          genres,
          latests: mangas,
        });
      });
    });
  });
};
