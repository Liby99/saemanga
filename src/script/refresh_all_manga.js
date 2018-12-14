const RunScript = require("./lib/run_script");
var Hot, Manga;

RunScript({
    task (next, error) {
        
        const Manga = require("../api/manga");
        
        // Record time
        var start = new Date();
        
        // Then fetch all manga in ids
        Manga.updateOldest50(function () {
                
            var diff = new Date().getTime() - start.getTime();
            console.log("Successfully fetched 50 mangas");
            console.log("Time elapsed: " + Math.round(diff / 1000) + "s");
            next();
        }, error);
    }
});
