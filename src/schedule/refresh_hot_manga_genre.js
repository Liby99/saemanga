const Debug = require('keeling-js/lib/debug');
const Hot = require('../api/hot');
const Manga = require('../api/manga');

module.exports = {
  name: 'refresh hot manga genres',
  schedule: '0 */4 * * *', // At the start of every 4 hours.
  task() {
    Debug.info(`${new Date()} Refreshing hot mangas genres`);
    Hot.refreshAllGenres((ids) => {
      Manga.updateMultiIds(ids, () => {
        Debug.log(`Successfully fetched ${ids.length} mangas`);
      }, (err) => {
        Debug.error(`Error fetching manga info ${err}`);
      });
    }, (err) => {
      Debug.error(`Error refreshing hot manga ${err}`);
    });
  },
};
