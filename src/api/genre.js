const Debug = require("keeling-js/lib/debug");
const GENRES = require("../data/app/genre.json");

module.exports = {
    get () {
        return GENRES;
    },
    getNameByDir (dir) {
        var genre = GENRES.filter((obj) => obj.dir == dir)[0];
        return genre && genre["name"];
    }
}
