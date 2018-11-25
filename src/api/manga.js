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

  get(dmkId, callback, error) {
    Mangas.findOne({ dmk_id: dmkId }, (err, manga) => {
      if (err) {
        error(err);
      } else if (manga) {
        callback(manga);
      } else {
        Cartoonmad.getMangaInfo(dmkId, (manga) => {
          manga.insert_date = new Date();
          manga.update_date = new Date();
          Mangas.insertOne(manga, (err, result) => {
            if (err) {
              error(err);
            } else {
              manga._id = result.insertedId;
              callback(manga);
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
      } else if (mangas.length == dmkIds) {
        callback(mangas);
      } else {
        const gotIds = mangas.map(manga => manga.dmk_id);
        const diff = dmkIds.filter(id => !(id in gotIds));
        Promise.all(diff, (dmkId, i, c, e) => {
          self.get(dmkId, (m) => {
            mangas.push(m);
            c();
          }, error);
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
            newManga.insert_date = new Date();
            newManga.update_date = new Date();
            Mangas.findOneAndUpdate({
              dmk_id: dmkId,
            }, newManga, (err, result) => {
              if (err) {
                error(err);
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

  updateAll(dmkIds, callback, error) {
    Promise.all(dmkIds, (dmkId, i, c, e) => {
      Cartoonmad.getMangaInfo(dmkId, (manga) => {
        manga.update_date = new Date();
        Mangas.findOneAndUpdate({
          dmk_id: dmkId,
        }, {
          $setOnInsert: {
            insert_date: new Date(),
          },
          $set: manga,
        }, {
          upsert: true,
        }, (err, result) => {
          if (err) {
            Debug.error(err);
          } else {
            Debug.log(`Successfully updated manga ${dmkId}`);
          }
          c();
        });
      }, (err) => {
        Debug.error(err);
        c();
      });
    }, callback, error);
  },

  updateOldest50(callback, error) {
    Mangas.find({
      'info.ended': false,
    }).sort({
      update_date: 1,
    }).limit(50).toArray((err, mangas) => {
      if (err) {
        error(err);
      } else {
        Debug.log(`There are ${mangas.length} mangas in total`);
        Promise.all(mangas, (oi, i, c, e) => {
          const dmkId = oi.dmk_id;
          Cartoonmad.getMangaInfo(dmkId, (ni) => {
            ni.insert_date = oi.insert_date;
            ni.update_date = new Date();
            Mangas.findOneAndUpdate({
              dmk_id: dmkId,
            }, ni, (err, result) => {
              if (err) {
                Debug.error(`Error inserting manga ${dmkId}`);
              } else {
                Debug.log(`Successfully updated manga ${dmkId}`);
              }
              c();
            });
          }, (err) => {
            Debug.error(`Error updating manga ${dmkId}`);
            c();
          });
        }, callback, error);
      }
    });
  },
};
