const Debug = require('keeling-js/lib/debug');
const Hot = require('../api/hot');
const Manga = require('../api/manga');

module.exports = {
  name: 'refresh latest hot manga',
  schedule: '0 * * * *', // At the start of every hour
  task() {
    Debug.info(`${new Date()} Refreshing latest hot mangas`);
    Hot.refreshLatest((ids) => {
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
