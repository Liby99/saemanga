const Debug = require('keeling-js/lib/debug');
const Cartoonmad = require('../api/cartoonmad');
const User = require('../api/user');
const Follow = require('../api/follow');
const Manga = require('../api/manga');
const ObjectID = require('../api/lib/object_id');

function setLiked(req, res, liked) {
  if (req.body.id) {
    const { id: mangaId } = req.body;
    const { username } = req.cookies;
    User.getUser(username, (user) => {
      if (user) {
        const { _id: userId } = user;
        try {
          const mangaObjectId = ObjectID(mangaId); // eslint-disable-line
          Follow.setLiked(userId, mangaId, liked, () => {
            res.success();
          }, (err) => {
            res.error(5, err);
          });
        } catch (err) {
          res.error(4, err);
        }
      } else {
        res.error(3, `User ${username} not found`);
      }
    }, (err) => {
      res.error(2, err);
    });
  } else {
    res.error(1, 'Please specify manga id');
  }
}

module.exports = {
  search(req, res) {
    Cartoonmad.search(req.body.query, (ids) => {
      res.success(ids);
    }, (err) => {
      Debug.error(err);
      res.error(1, err);
    });
  },
  get_following_manga(req, res) {
    User.getUser(req.cookies.username, (user) => {
      if (user) {
        Follow.getAllFollow(user._id, (follows) => {
          res.success(follows);
        }, (err) => {
          Debug.error(err);
          res.error(2, err);
        });
      } else {
        res.error(2, `User ${req.cookies.username} not found`);
      }
    }, (err) => {
      Debug.error(err);
      res.error(1, err);
    });
  },
  unfollow(req, res) {
    if (req.body.id) {
      if (req.cookies.username) {
        User.getUser(req.cookies.username, (user) => {
          Follow.unfollow(user._id, req.body.id, () => {
            res.success();
          }, (err) => {
            Debug.error(err);
            res.error(4, err);
          });
        }, (err) => {
          Debug.error(err);
          res.error(3, err);
        });
      } else {
        res.error(2, 'You have not logged in yet');
      }
    } else {
      res.error(1, 'Please specify the id of the manga');
    }
  },
  get_info(req, res) {
    if (req.body.id) {
      Manga.get(req.body.id, (manga) => {
        if (manga) {
          res.success(manga);
        } else {
          res.error(3, `Manga with id ${req.body.id} not found`);
        }
      }, (err) => {
        Debug.error(err);
        res.error(2, err.toString());
      });
    } else {
      res.error(1, 'Please specify manga id');
    }
  },
  refresh_manga_info(req, res) {
    if (req.body.id) {
      Manga.update(req.body.id, (om) => {
        if (om) {
          res.success(om);
        } else {
          res.error(3, `Manga with id ${req.body.id} not found`);
        }
      }, (err) => {
        Debug.error(err);
        res.error(2, err.toString());
      });
    } else {
      res.error(1, 'Please specify manga id');
    }
  },
  get_liked(req, res) {
    if (req.query.id) {
      const { id: mangaId } = req.query;
      const { username } = req.cookies;
      User.getUser(username, (user) => {
        if (user) {
          const { _id: userId } = user;
          Follow.getFollow(userId, mangaId, (follow) => {
            if (follow) {
              res.success(!!follow.liked);
            } else {
              res.error(5, 'User not following manga');
            }
          }, (err) => {
            res.error(4, err);
          });
        } else {
          res.error(3, `User ${username} not found`);
        }
      }, (err) => {
        res.error(2, err);
      });
    } else {
      res.error(1, 'Please specify manga id');
    }
  },
  like(req, res) {
    setLiked(req, res, true);
  },
  unlike(req, res) {
    setLiked(req, res, false);
  },
  request_update(req, res) {
    if (req.query.dmk_id) {
      const { dmk_id: dmkId } = req.query;
      if (dmkId.match(/^\d{4}$/)) {
        Manga.update(dmkId, ({ updated }) => {
          res.success(updated);
        }, (err) => {
          Debug.info(`user requested update encountering error ${err}`);
          res.error(3, err);
        });
      } else {
        Debug.info(`user requested update with invalid dmk_id ${dmkId}`);
        res.error(2, 'Invalid dmk_id');
      }
    } else {
      res.error(1, 'Please specify manga id');
    }
  },
};
