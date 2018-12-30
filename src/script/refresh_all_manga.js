/* eslint-disable global-require, no-console */

const RunScript = require('./lib/run_script');

RunScript({
  task(next, error) {
    const Manga = require('../api/manga');

    // Record time
    const start = new Date();

    // Then fetch all manga in ids
    Manga.updateAllMangas(() => {
      const diff = new Date().getTime() - start.getTime();
      console.log('Task finished');
      console.log(`Time elapsed: ${Math.round(diff / 1000)}s`);
      next();
    }, error);
  },
});
