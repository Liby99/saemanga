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
      (function process(numLeft) {
        if (numLeft > 0) {
          Manga.updateOldest(BATCH_SIZE, () => {
            console.log(`- Batch completed: done refreshing ${BATCH_SIZE} mangas`);
            process(numLeft - BATCH_SIZE);
          }, error);
        } else {
          const diff = new Date().getTime() - start.getTime();
          console.log(`Task finished Done refreshing ${amount} mangas`);
          console.log(`Time elapsed: ${Math.round(diff / 1000)}s`);
          next();
        }
      }(amount));
    }, error);
  },
});
