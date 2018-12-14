/* eslint-disable */

/**
 * Populate Script
 */

const Mongo = require('keeling-js/lib/mongo');
const config = require('../data/mongo.json');

function populate() {
  // Put all populate functions here!!!
  const list = [
    // require("../api/mangaType").populate
  ];

  // Iterate through populate list
  const exit = Mongo.close;
  (function p(i) {
    if (i < list.length) {
      list[i](() => p(i + 1), exit);
    } else {
      exit();
    }
  }(0));
}

function start() {
  console.log('Connecting to MongoDB...');
  Mongo.init(config, () => {
    console.log('Success!');
    populate();
  });
}

start();
