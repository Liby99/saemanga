/* eslint no-console: off, global-require: off */

const MongoUnitTest = require('./lib/mongo_unit_test');
const Cartoonmad = require('../api/cartoonmad');

let Manga;

MongoUnitTest({
  begin(next) {
    Manga = require('../api/manga');
    next();
  },
  tests: [

    (next, error) => {
      console.log('-----Testing Scrapper Get Non Existing Manga-----');
      Cartoonmad.getMangaInfo(11, error, () => {
        console.log('Error thrown. Passed');
        next();
      });
    },

    (next, error) => {
      console.log('-----Testing Scrapper Get Manga 5967-----');
      Cartoonmad.getMangaInfo(5967, (info) => {
        console.log(info);
        next();
      }, error);
    },

    (next, error) => {
      console.log('-----Testing Scrapper Get Manga 1152-----');
      Cartoonmad.getMangaInfo(1152, (info) => {
        console.log(info);
        next();
      }, error);
    },

    (next, error) => {
      console.log('-----Testing Get-----');
      Manga.get(5967, (manga) => {
        console.log(manga);
        next();
      }, error);
    },

    (next, error) => {
      console.log('-----Testing Update-----');
      Manga.update(5967, (manga) => {
        console.log(manga);
        next();
      }, error);
    },
  ],
});
