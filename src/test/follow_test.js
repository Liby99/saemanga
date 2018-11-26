/* eslint no-console: off, global-require: off */

const assert = require('assert');
const MongoUnitTest = require('./lib/mongo_unit_test');

let Follow;
let User;
let Manga;
const username = 'test_user_1';

let userId;
let mangaId;
let maxEpi;

MongoUnitTest({
  begin(cb) {
    Follow = require('../api/follow');
    User = require('../api/user');
    Manga = require('../api/manga');

    User.addUser(username, '12345678', (uid) => {
      userId = uid;
      cb();
    }, (err) => {
      throw err;
    });
  },
  tests: [

    (next, error) => {
      console.log('-----First Get Manga 5827-----');
      const dmkId = 5827;
      Manga.get(dmkId, (manga) => {
        mangaId = manga._id;
        maxEpi = manga.episodes[manga.episodes.length - 1];
        next();
      }, error);
    },

    (next, error) => {
      console.log('-----Testing Is Following: No-----');
      Follow.isFollowing(userId, mangaId, (is) => {
        try {
          assert(!is);
          console.log('passed');
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },

    (next, error) => {
      console.log('-----Testing Follow-----');
      Follow.follow(userId, mangaId, (followId) => {
        console.log(followId);
        console.log('passed');
        next();
      }, error);
    },

    (next, error) => {
      // Check if the user has followed
      console.log('-----Testing has follow-----');
      Follow.getFollow(userId, mangaId, (follow) => {
        try {
          assert.notEqual(follow, null);
          console.log('passed');
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },

    (next, error) => {
      // Check is following
      console.log('-----Testing Is Following: Yes-----');
      Follow.isFollowing(userId, mangaId, (is) => {
        try {
          assert(is);
          console.log('passed');
          next();
        } catch (err) {
          error(err);
        }
      }, error);
    },

    (next, error) => {
      // Check is following
      console.log('-----Testing follow again - should have error-----');
      Follow.follow(userId, mangaId, () => {
        error(new Error('should have error'));
      }, () => {
        console.log('passed');
        next();
      });
    },

    (next, error) => {
      console.log('-----Testing unfollow-----');
      Follow.unfollow(userId, mangaId, () => {
        console.log('passed');
        next();
      }, error);
    },

    (next, error) => {
      console.log('-----Testing unfollow again - should cast error-----');
      Follow.unfollow(userId, mangaId, () => {
        error(new Error('should cast error'));
      }, () => {
        // console.log(err);
        console.log('passed');
        next();
      });
    },

    (next, error) => {
      console.log('-----Testing follow again-----');
      Follow.follow(userId, mangaId, () => {
        next();
      }, error);
    },

    (next, error) => {
      console.log('-----Testing read 1-----');
      Follow.read(userId, mangaId, 8, () => {
        Follow.getFollow(userId, mangaId, (follow) => {
          try {
            const curr = follow.current_episode;
            const max = follow.max_episode;
            const isUpToDate = follow.up_to_date;
            assert(curr === 8);
            assert(max === 8);
            assert(isUpToDate === false);
            console.log('passed');
            next();
          } catch (err) {
            error(err);
          }
        }, error);
      }, error);
    },

    (next, error) => {
      console.log('-----Testing read 2-----');
      Follow.read(userId, mangaId, 5, () => {
        Follow.getFollow(userId, mangaId, (follow) => {
          try {
            const curr = follow.current_episode;
            const max = follow.max_episode;
            const isUpToDate = follow.up_to_date;
            assert(curr === 5);
            assert(max === 8);
            assert(isUpToDate === false);
            console.log('passed');
            next();
          } catch (err) {
            error(err);
          }
        }, error);
      }, error);
    },

    (next, error) => {
      console.log('-----Testing read 3-----');
      Follow.read(userId, mangaId, maxEpi, () => {
        Follow.getFollow(userId, mangaId, (follow) => {
          try {
            const curr = follow.current_episode;
            const max = follow.max_episode;
            const isUpToDate = follow.up_to_date;
            assert(curr === maxEpi);
            assert(max === maxEpi);
            assert(isUpToDate === true);
            console.log('passed');
            next();
          } catch (err) {
            error(err);
          }
        }, error);
      }, error);
    },

    (next, error) => {
      console.log('-----Testing read 4-----');
      Follow.read(userId, mangaId, 1, () => {
        Follow.getFollow(userId, mangaId, (follow) => {
          try {
            const curr = follow.current_episode;
            const max = follow.max_episode;
            const isUpToDate = follow.up_to_date;
            assert(curr === 1);
            assert(max === maxEpi);
            assert(isUpToDate === true);
            console.log('passed');
            next();
          } catch (err) {
            error(err);
          }
        }, error);
      }, error);
    },
  ],
  finish(cb) {
    User.removeUser(username, () => {
      cb();
    });
  },
});
