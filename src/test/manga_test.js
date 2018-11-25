/* eslint no-console: off */

const assert = require('assert');
const MongoUnitTest = require('./lib/mongo_unit_test');
const Cartoonmad = require('../api/cartoonmad');

let Manga;

MongoUnitTest({

  begin(next) {
    Manga = require('../api/manga');
    next();
  },
  tests: [

    function (next, error) {
      console.log('-----Testing Scrapper Get Non Existing Manga-----');
      Cartoonmad.getMangaInfo(11, error, (err) => {
        console.log('Error thrown. Passed');
        next();
      });
    },

    function (next, error) {
      console.log('-----Testing Scrapper Get Manga 5967-----');
      Cartoonmad.getMangaInfo(5967, (info) => {
        console.log(info);
        next();
      }, error);
    },

    function (next, error) {
      console.log('-----Testing Scrapper Get Manga 1152-----');
      Cartoonmad.getMangaInfo(1152, (info) => {
        console.log(info);
        next();
      }, error);
    },

    function (next, error) {
      console.log('-----Testing Get-----');
      const Manga = require('../api/manga');
      Manga.get(5967, (manga) => {
        console.log(manga);
        next();
      }, error);
    },

    function (next, error) {
      console.log('-----Testing Update-----');
      const Manga = require('../api/manga');
      Manga.update(5967, (manga) => {
        console.log(manga);
        next();
      }, error);
    },
  ],
});
