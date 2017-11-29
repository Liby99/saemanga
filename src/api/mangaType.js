const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");

const TYPES = require("../data/manga_types.json");

module.exports = {
    
    get () {
        return TYPES;
    },
    
    getNameByDir (dir) {
        return TYPES.filter((obj) => obj.dir == dir)[0]["type"];
    }
}
