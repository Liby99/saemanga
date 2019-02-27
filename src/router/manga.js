const User = require('../api/user');
const FollowAPI = require('../api/follow');
const MangaAPI = require('../api/manga');
const Manga = require('../api/app/manga');

function isValidEpisode(manga, epi) {
  const pepi = parseInt(epi, 10);
  const isNum = !Number.isNaN(pepi);
  return isNum && (manga.hasEpisode(pepi) || manga.hasBook(pepi));
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
  FollowAPI.isFollowing(user._id, manga.id(), (is) => {
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
  if (epi !== undefined) {
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
  FollowAPI.read(user._id, manga.id(), req.query.epi, () => {
    callback();
  }, (err) => {
    res.error(500, err);
  });
}

function redirectToLatest(req, res, user, manga) {
  FollowAPI.getFollow(user._id, manga.id(), (followInfo) => {
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
  FollowAPI.follow(user._id, manga.id(), success, (err) => {
    res.error(500, err);
  });
}

function redirectToFirst(req, res, manga) {
  res.redirect(`manga.html?id=${req.query.id}&epi=${manga.firstEpisode()}`);
}

function renderPage(loggedIn, user, manga, followInfo, episode, callback) {
  callback({
    loggedIn,
    user,
    follow: followInfo,
    manga,
    episode: parseInt(episode, 10),
  });
}

function renderPageWithUser(req, res, user, manga, callback) {
  FollowAPI.getFollow(user._id, manga.id(), (followInfo) => {
    renderPage(true, user, manga, followInfo, req.query.epi, callback);
  }, (err) => {
    res.error(500, err);
  });
}

function renderPageNoUser(req, res, manga, callback) {
  renderPage(false, {}, manga, {}, req.query.epi, callback);
}

module.exports = (req, res, callback) => {
  getMangaInfo(req, res, (m) => {
    const manga = new Manga(m);
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
