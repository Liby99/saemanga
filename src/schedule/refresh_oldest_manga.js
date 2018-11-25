const Debug = require('keeling-js/lib/debug');
const Manga = require('../api/manga');

module.exports = {
  name: 'refresh oldest 50 manga',
  schedule: '*/30 * * * *', // Every half an hour
  task() {
    Debug.log(`${new Date()} Refreshing oldest 50 mangas`);
    Manga.updateOldest50(() => {
      Debug.log('Successfully refreshed oldest 50 mangas');
    }, (err) => {
      Debug.error(`Error fetching manga info ${err}`);
    });
  },
};
