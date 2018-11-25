const assert = require('assert');
const MongoUnitTest = require('./lib/mongo_unit_test');
const Genre = require('../api/genre');
const Cartoonmad = require('../api/cartoonmad');

let Hot;

MongoUnitTest({
  begin(next) {
    Hot = require('../api/hot');
    next();
  },
  tests: [

    function testGet(next, error) {
      console.log('-----Testing Getting Latest Manga-----');
      Cartoonmad.getHotManga((ids) => {
        console.log(`Latest: [${ids}]`);
        next();
      }, error);
    },

    function testGetType(next, error) {
      console.log('-----Testing Getting Manga of Type-----');
      const gs = Genre.get();
      (function p(i) {
        if (i < gs.length) {
          Cartoonmad.getHotMangaOfGenre(gs[i].dir, (ids) => {
            console.log(`${gs[i].name}: [${ids}]`);
            p(i + 1);
          }, error);
        } else {
          next();
        }
      }(0));
    },

    function testAPIFetch(next, error) {
      console.log('-----Test Fetching-----');
      const Hot = require('../api/hot');
      Hot.refresh(() => {
        console.log('Successfully Fetched All Hot Manga');
        next();
      }, error);
    },

    function testGetFromDB(next, error) {
      console.log('-----Test Getting From DB-----');
      const Hot = require('../api/hot');
      Hot.getLatestIds((ids) => {
        console.log(`Latest: [${ids}]`);
        Hot.getIdsOfGenre('comic04', (ids) => {
          console.log(`Comic 04: [${ids}]`);
          Hot.getIdsOfGenre('comic18', (ids) => {
            console.log(`Comic 18: [${ids}]`);
            next();
          }, error);
        }, error);
      }, error);
    },
  ],
});
