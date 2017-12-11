const ObjectID = require("./lib/object_id");
const Manga = require("./manga");
const Debug = require("keeling-js/lib/debug");
const Mongo = require("keeling-js/lib/mongo");
const Follows = Mongo.db.collection("follow");

module.exports = {
    
    getAllFollow (userId, callback, error) {
        Follows.aggregate([{
            $match: { "user_id": ObjectID(userId) }
        }, {
            $lookup: {
                from: "manga",
                localField: "manga_id",
                foreignField: "_id",
                as: "manga"
            }
        }, { $unwind: "$manga" }, {
            $addFields: {
                "latest_episode": {
                    $slice: [ "$manga.episodes", -1 ]
                },
                "up_to_date_int": {
                    $cond: {
                        "if": "$up_to_date",
                        "then": 1,
                        "else": 0
                    }
                }
            }
        }, { $unwind: "$latest_episode" }, {
            $addFields: {
                "sort_num": {
                    $multiply: [
                        "$up_to_date_int",
                        { $subtract: [ "$latest_episode", "$max_episode" ] }
                    ]
                }
            }
        }, {
            $sort: {
                "sort_num": -1,
                "update_date": -1
            }
        }, {
            $project: {
                "sort_num": 0,
                "latest_episode": 0,
                "up_to_date_int": 0
            }
        }]).toArray(function (err, arr) {
            if (err) {
                error(err);
            }
            else {
                callback(arr);
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
                            "current_episode": currentEpisode,
                            "max_episode": currentEpisode
                        }, function (err, followId) {
                            if (err) {
                                error(err);
                            }
                            else {
                                callback(followId["insertedId"]);
                            }
                        });
                    }
                    else {
                        error(new Error("Manga " + mangaId + " not found"));
                    }
                }, error);
            }
        }, error);
    },
    
    unfollow (userId, mangaId, callback, error) {
        Follows.removeOne({
            "user_id": ObjectID(userId),
            "manga_id": ObjectID(mangaId)
        }, function (err, ret) {
            if (err) {
                error(err);
            }
            else {
                if (ret.result.n) {
                    callback();
                }
                else {
                    error(new Error("User has not followed this manga"));
                }
            }
        });
    },
    
    updateAllFollowOfManga (mangaId, callback, error) {
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
    
    read (userId, mangaId, episode, callback, error) {
        var self = this;
        Manga.getByObjId(mangaId, function (manga) {
            var latestEpisode = manga.episodes[manga.episodes.length - 1];
            self.getFollow(userId, mangaId, function (follow) {
                if (follow) {
                    var maxEpisode = Math.max(episode, follow["max_episode"]);
                    var isUpToDate = maxEpisode == latestEpisode;
                    Follows.updateOne({
                        "user_id": userId,
                        "manga_id": mangaId
                    }, {
                        $set: {
                            "update_date": new Date(),
                            "current_episode": parseInt(episode),
                            "max_episode": parseInt(maxEpisode),
                            "up_to_date": isUpToDate
                        }
                    }, function (err, ret) {
                        if (err) {
                            error(err);
                        }
                        else {
                            if (ret.result.n) {
                                callback();
                            }
                            else {
                                error(new Error("Error updating follow " + follow["_id"]));
                            }
                        }
                    });
                }
                else {
                    error(new Error("User " + userId + " has not followed manga " + mangaId + " yet."));
                }
            }, error);
        }, error);
    }
}
