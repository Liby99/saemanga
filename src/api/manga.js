const Debug = require('keeling-js/lib/debug');
const Mongo = require('keeling-js/lib/mongo');
const ObjectID = require('./lib/object_id');

const Mangas = Mongo.db.collection('manga');
const Cartoonmad = require('./cartoonmad');
const Promise = require('./lib/promise');

function hasUpdate(oldManga, newManga) {
  if (newManga.dmk_id_gen !== oldManga.dmk_id_gen
    || newManga.dmk_id_web !== oldManga.dmk_id_web) {
    return true;
  }

  if (oldManga.episodes.length !== newManga.episodes.length) {
    return true;
  }

  if (oldManga.info.ended !== newManga.info.ended) {
    return true;
  }

  return false;
}

module.exports = {

  count(callback, error) {
    Mangas.count({}, (err, result) => {
      if (err) {
        error(err);
      } else {
        callback(result);
      }
    });
  },

  get(dmkId, callback, error) {
    Mangas.findOne({ dmk_id: dmkId }, (err, foundManga) => {
      if (err) {
        error(err);
      } else if (foundManga) {
        callback(foundManga);
      } else {
        Cartoonmad.getMangaInfo(dmkId, (manga) => {
          Mangas.insertOne({
            ...manga,
            insert_date: new Date(),
            update_date: new Date(),
          }, (err2, { insertedId }) => {
            if (err2) {
              error(err2);
            } else {
              callback({
                ...manga,
                _id: insertedId,
              });
            }
          });
        }, error);
      }
    });
  },

  getAll(dmkIds, callback, error) {
    const self = this;
    Mangas.find({
      dmk_id: {
        $in: dmkIds,
      },
    }).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else if (mangas.length === dmkIds) {
        callback(mangas);
      } else {
        const gotIds = mangas.map(manga => manga.dmk_id);
        const diff = dmkIds.filter(id => !(id in gotIds));
        Promise.all(diff, (dmkId, i, c, e) => {
          self.get(dmkId, (m) => {
            mangas.push(m);
            c();
          }, e);
        }, () => {
          callback(mangas);
        }, error);
      }
    });
  },

  getByObjId(mangaId, callback, error) {
    Mangas.findOne({
      _id: ObjectID(mangaId),
    }, (err, manga) => {
      if (err) {
        error(err);
      } else {
        callback(manga);
      }
    });
  },

  getAllByObjId(mangaIds, callback, error) {
    Mangas.find({
      _id: {
        $in: mangaIds.map(id => ObjectID(id)),
      },
    }).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else {
        callback(mangas);
      }
    });
  },

  update(dmkId, callback, error) {
    Mangas.findOne({ dmk_id: dmkId }, (err, manga) => {
      if (err) {
        error(err);
      } else if (manga) {
        Cartoonmad.getMangaInfo(dmkId, (newManga) => {
          if (hasUpdate(manga, newManga)) {
            Mangas.findOneAndUpdate({
              dmk_id: dmkId,
            }, {
              $set: {
                ...newManga,
                insert_date: new Date(),
                update_date: new Date(),
              },
            }, (err2) => {
              if (err2) {
                error(err2);
              } else {
                callback({
                  updated: true,
                  manga: newManga,
                });
              }
            });
          } else {
            callback({
              updated: false,
              manga,
            });
          }
        }, error);
      } else {
        error(new Error(`Manga ${dmkId} does not exist`));
      }
    });
  },

  // Should be deprecated, since this is going to break the memory limit
  updateAllMangas(callback, error) {
    Mangas.find({}).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else {
        Debug.log(`There are ${mangas.length} mangas in total`);
        this.updateMulti(mangas, callback, error);
      }
    });
  },

  updateOldest(amount, callback, error) {
    Mangas.find({
      'info.ended': false,
    }).sort({
      update_date: 1,
    }).limit(amount).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else {
        Debug.log(`There are ${mangas.length} mangas in total`);
        this.updateMulti(mangas, callback, error);
      }
    });
  },

  updateOldest50(callback, error) {
    this.updateOldest(50, callback, error);
  },

  updateEnded(callback, error) {
    Mangas.find({
      'info.ended': true,
    }).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else {
        Debug.log(`There are ${mangas.length} ended mangas in total`);
        this.updateMulti(mangas, callback, error);
      }
    });
  },

  updateMulti(mangas, callback, error) {
    this.updateMultiIds(mangas.map(({ dmk_id: dmkId }) => dmkId), callback, error);
  },

  updateMultiIds(ids, callback, error) {
    Promise.all(ids, (dmkId, i, c) => {
      Cartoonmad.getMangaInfo(dmkId, (info) => {
        Mangas.findOneAndUpdate({
          dmk_id: dmkId,
        }, {
          $setOnInsert: {
            insert_date: new Date(),
          },
          $set: {
            ...info,
            update_date: new Date(),
          },
        }, {
          upsert: true,
        }, (err2) => {
          if (err2) {
            Debug.error(`Error inserting manga ${dmkId}: ${err2}`);
            this.touch(dmkId, c, c);
          } else {
            Debug.log(`Successfully updated manga ${dmkId}`);
            c();
          }
        });
      }, (err2) => {
        Debug.error(`Error updating manga ${dmkId}: ${err2}`);
        this.touch(dmkId, c, c);
      });
    }, callback, error);
  },

  touch(dmkId, callback, error) {
    Mangas.findOneAndUpdate({
      dmk_id: dmkId,
    }, {
      $set: {
        update_date: new Date(),
      },
    }, (err) => {
      if (err) {
        error(err);
      } else {
        callback();
      }
    });
  },
};
