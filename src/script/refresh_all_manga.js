/* eslint-disable global-require, no-console */

const RunScript = require('./lib/run_script');

const BATCH_SIZE = 200;

RunScript({
  task(next, error) {
    const Manga = require('../api/manga');

    // Record time
    const start = new Date();

    // Then fetch all manga in ids
    Manga.count((amount) => {
      const batch = amount / BATCH_SIZE;
      (function process(i) {
        if (i <= batch) {
          Manga.updateOldest(BATCH_SIZE, () => {
            console.log(`Done refreshing ${BATCH_SIZE} mangas`);
            process(i + 1);
          }, error);
        } else {
          const diff = new Date().getTime() - start.getTime();
          console.log('Task finished');
          console.log(`Time elapsed: ${Math.round(diff / 1000)}s`);
          next();
        }
      }(0));
    }, error);
  },
});
