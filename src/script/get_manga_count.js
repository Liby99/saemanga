const RunScript = require("./lib/run_script");
var Hot, Manga;

RunScript({
  task (next, error) {
    const Manga = require("../api/manga");
    Manga.count((num) => {
      console.log(`There are ${num} mangas in general`);
      next();
    }, error);
  }
});
