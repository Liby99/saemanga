/* eslint-disable global-require, no-console */

const RunScript = require('./lib/run_script');
require('keeling-js/lib/debug').set(true);

RunScript({
  task(next, error) {
    const Manga = require('../api/manga');
    const dmkId = process.argv[2];
    if (dmkId && dmkId !== '') {
      console.log(`Attempting to update manga ${dmkId}`);
      Manga.update(dmkId, ({ updated, manga }) => {
        console.log('Successfully fetched manga info');
        if (updated) {
          console.log('Database entry updated');
        } else {
          console.log('Database entry not updated: no changes present');
        }
        console.log('Manga Info: ');
        console.log(manga);
        next();
      }, (err) => {
        console.log('Encountered error');
        console.log(err);
        error(err);
      });
    } else {
      console.log('dmkId cannot be empty. Example usage: ');
      console.log('$ node refresh_manga.js 1357');
      error();
    }
  },
});
