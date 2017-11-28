const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const MangaTypes = Mongo.db.collection("manga_type");

module.exports = {
    
    /**
     * Populate the manga types to the database
     */
    populate (next, error) {
        
        // First clean up the collection
        MangaTypes.remove({});
        
        // Fetch the data and insert
        var data = require("../data/manga_types.json");
        MangaTypes.insertMany(data, {}, function (err) {
            if (err) {
                console.error("Error populating manga types");
                error();
            }
            else {
                console.log("Successfully inserted all manga types");
                next();
            }
        });
    },
    
    /**
     * Return a list of types
     * @param  {Function} callback
     * @return [ <typeId> ]
     */
    get (callback) {
        MangaTypes.find({}).toArray(function (err, types) {
            if (err) {
                Debug.error(err);
            }
            else {
                callback(types);
            }
        });
    }
}
