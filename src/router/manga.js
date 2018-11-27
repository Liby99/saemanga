const Debug = require('keeling-js/lib/debug');
const User = require('../api/user');
const Follow = require('../api/follow');
const MangaAPI = require('../api/manga');
const Manga = require('../api/app/manga');

function getFirstEpisode(manga) {
  return manga.books ? manga.books[0] : manga.episodes[0];
}

function isValidEpisode(manga, epi) {
  const pepi = parseInt(epi, 10);
  const isNum = !Number.isNaN(pepi);
  const hasBook = manga.books && (pepi in manga.books);
  const hasEpi = pepi in manga.episodes;
  Debug.log(`${isNum}, ${hasBook}, ${hasEpi}`);
  return isNum && (hasBook || hasEpi);
}

function getMangaInfo(req, res, callback) {
  if (req.query.id) {
    MangaAPI.get(req.query.id, (manga) => {
      if (manga) {
        callback(manga);
      } else {
        res.error(404, `未找到漫画${req.query.id}的信息`);
      }
    }, (err) => {
      res.error(500, err);
    });
  } else {
    res.error(403, '未指定漫画ID');
  }
}

function getUser(req, res, hasUser, noUser) {
  if (req.cookies.username) {
    User.getAndTouchUser(req.cookies.username, (user) => {
      if (user) {
        hasUser(user);
      } else {
        res.clearCookie('username');
        res.error(403, '用户未找到');
      }
    }, (err) => {
      res.error(500, err);
    });
  } else {
    noUser();
  }
}

function isFollowing(req, res, user, manga, yes, no) {
  Follow.isFollowing(user._id, manga._id, (is) => {
    if (is) {
      yes();
    } else {
      no();
    }
  }, (err) => {
    res.error(500, err);
  });
}

function checkEpisode(req, res, user, manga, hasEpisode, noEpisode) {
  const { epi } = req.query;
  if (epi) {
    if (isValidEpisode(manga, epi)) {
      hasEpisode();
    } else {
      res.error(404, '该章节不存在');
    }
  } else {
    noEpisode();
  }
}

function read(req, res, user, manga, callback) {
  Follow.read(user._id, manga._id, req.query.epi, () => {
    callback();
  }, (err) => {
    res.error(500, err);
  });
}

function redirectToLatest(req, res, user, manga) {
  Follow.getFollow(user._id, manga._id, (followInfo) => {
    if (followInfo) {
      res.redirect(`manga.html?id=${req.query.id}&epi=${followInfo.max_episode}`);
    } else {
      res.error(500, 'Manga not found');
    }
  }, (err) => {
    res.error(500, err);
  });
}

function follow(req, res, user, manga, success) {
  Follow.follow(user._id, manga._id, success, (err) => {
    res.error(500, err);
  });
}

function redirectToFirst(req, res, manga) {
  res.redirect(`manga.html?id=${req.query.id}&epi=${getFirstEpisode(manga)}`);
}

function renderPage(loggedIn, user, manga, episode, callback) {
  callback({
    loggedIn,
    user,
    manga: new Manga({
      ...manga,
      _id: manga._id.toString(),
    }),
    episode: parseInt(episode, 10),
  });
}

function renderPageWithUser(req, res, user, manga, callback) {
  renderPage(true, user, manga, req.query.epi, callback);
}

function renderPageNoUser(req, res, manga, callback) {
  renderPage(false, {}, manga, req.query.epi, callback);
}

module.exports = (req, res, callback) => {
  getMangaInfo(req, res, (manga) => {
    getUser(req, res, (user) => {
      isFollowing(req, res, user, manga, () => {
        checkEpisode(req, res, user, manga, () => {
          read(req, res, user, manga, () => {
            renderPageWithUser(req, res, user, manga, callback);
          });
        }, () => {
          redirectToLatest(req, res, user, manga);
        });
      }, () => {
        follow(req, res, user, manga, () => {
          checkEpisode(req, res, user, manga, () => {
            read(req, res, user, manga, () => {
              renderPageWithUser(req, res, user, manga, callback);
            });
          }, () => {
            redirectToFirst(req, res, manga);
          });
        });
      });
    }, () => {
      checkEpisode(req, res, undefined, manga, () => {
        renderPageNoUser(req, res, manga, callback);
      }, () => {
        redirectToFirst(req, res, manga);
      });
    });
  });
};
