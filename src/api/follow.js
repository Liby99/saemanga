const ObjectID = require("./lib/object_id");
const Manga = require("./manga");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Follows = Mongo.db.collection("follow");

module.exports = {
    
    getAllFollow (userId, callback, error) {
        Follows.find({
            "user_id": ObjectID(userId)
        }).toArray(function (err, follows) {
            if (err) {
                error(err);
            }
            else {
                callback(follows);
            }
        });
    },
    
    getFollow (userId, mangaId, callback, error) {
        Follows.findOne({
            "user_id": ObjectID(userId),
            "manga_id": ObjectID(mangaId)
        }, function (err, follow) {
            if (err) {
                error(err);
            }
            else {
                callback(follow);
            }
        });
    },
    
    isFollowing (userId, mangaId, callback, error) {
        this.getFollow(userId, mangaId, function (follow) {
            callback(follow !== null);
        }, error);
    },
    
    follow (userId, mangaId, callback, error) {
        this.isFollowing(userId, mangaId, function (is) {
            if (is) {
                error(new Error("User is already following this manga"));
            }
            else {
                Manga.getByObjId(mangaId, function (manga) {
                    if (manga) {
                        var isUpToDate, currentEpisode;
                        if (manga.books) {
                            isUpToDate = false;
                            currentEpisode = manga.books[0];
                        }
                        else {
                            isUpToDate = manga.episodes.length == 1;
                            currentEpisode = manga.episodes[0];
                        }
                        Follows.insertOne({
                            "user_id": ObjectID(userId),
                            "manga_id": ObjectID(mangaId),
                            "start_date": new Date(),
                            "update_date": new Date(),
                            "up_to_date": isUpToDate,
                            "current_episode": currentEpisode
                        }, function (err, followId) {
                            if (err) {
                                error(err);
                            }
                            else {
                                callback(followId);
                            }
                        });
                    }
                    else {
                        error(new Error("Manga " + mangaId + " not found"));
                    }
                });
            }
        }, error);
    },
    
    unfollow (userId, mangaId, callback) {
        
    },
    
    updateAllFollowOfManga (mangaId, callback) {
        Manga.getByObjId(mangaId, function (manga) {
            if (manga) {
                Follows.updateMany({ "manga_id": mangaId }, {
                    $set: {
                        "update_date": new Date(),
                        "up_to_date": false
                    }
                }, function (err) {
                    if (err) {
                        error(err);
                    }
                    else {
                        callback();
                    }
                });
            }
            else {
                error(new Error("Manga " + mangaId + " not found"));
            }
        });
    },
    
    read (userId, mangaId, episode, callback) {
        
    }
}
