/* eslint-disable global-require, no-console */

const RunScript = require('./lib/run_script');

RunScript({
  task(next, error) {
    const Hot = require('../api/hot');
    const Manga = require('../api/manga');

    // Record time
    const start = new Date();

    // First refresh all hot manga and get the refreshed dmk_ids
    Hot.refresh((ids) => {
      console.log('Successfully refreshed hot manga, start updating manga info');

      // Then fetch all manga in ids
      Manga.updateAll(ids, () => {
        const diff = new Date().getTime() - start.getTime();
        console.log(`Successfully fetched ${ids.length} mangas`);
        console.log(`Time elapsed: ${Math.round(diff / 1000)}s`);
        next();
      }, error);
    }, error);
  },
});
