/* eslint-disable global-require, no-console */

const RunScript = require('./lib/run_script');

const BATCH_SIZE = 200;

RunScript({
  task(next, error) {
    const Manga = require('../api/manga');

    // Record time
    const start = new Date();
    let totalAmount = 0;

    // Then fetch all manga in ids
    Manga.count((amount) => {
      console.log(`Detected ${amount} mangas to refresh`);
      (function process(numLeft) {
        if (numLeft > 0) {
          const updatingAmount = Math.min(numLeft, BATCH_SIZE);
          Manga.updateOldest(updatingAmount, (currAmount) => {
            totalAmount += currAmount;
            console.log(`- Batch completed: done refreshing ${currAmount} mangas`);
            process(numLeft - updatingAmount);
          }, error);
        } else {
          const diff = new Date().getTime() - start.getTime();
          console.log(`Task finished Done refreshing ${totalAmount} mangas`);
          console.log(`Time elapsed: ${Math.round(diff / 1000)}s`);
          next();
        }
      }(amount));
    }, error);
  },
});
