const assert = require("assert");
const MongoUnitTest = require("./lib/mongo_unit_test");
const Genre = require("../api/genre");

var Follow, User, Manga;
var username = "test_user_1", userId, mangaId;

MongoUnitTest({
    begin (cb) {
        var self = this;
        
        Follow = require("../api/follow");
        User = require("../api/user");
        Manga = require("../api/manga");
        
        User.addUser(username, "12345678", function (uid) {
            userId = uid;
            cb();
        }, function (err) {
            throw err;
        });
    },
    tests: [
        
        function (next, error) {
            console.log("-----First Get Manga 5827-----");
            var dmkId = 5827;
            Manga.get(dmkId, function (manga) {
                mangaId = manga._id;
                next();
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing Is Following: No-----");
            Follow.isFollowing(userId, mangaId, function (is) {
                try {
                    assert(!is);
                    console.log("passed");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing Follow-----");
            Follow.follow(userId, mangaId, function (followId) {
                console.log(followId);
                console.log("passed");
                next();
            }, error);
        },
        
        function (next, error) {
            
            // Check if the user has followed
            console.log("-----Testing has follow-----");
            Follow.getFollow(userId, mangaId, function (follow) {
                
                try {
                    assert.notEqual(follow, null);
                    console.log("passed");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error);
        },
        
        function (next, error) {
            
            // Check is following
            console.log("-----Testing Is Following: Yes-----");
            Follow.isFollowing(userId, mangaId, function (is) {
                try {
                    assert(is);
                    console.log("passed");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error)
        },
        
        function (next, error) {
            
            // Check is following
            console.log("-----Testing follow again - should have error-----");
            Follow.follow(userId, mangaId, function (is) {
                error(new Error("should have error"));
            }, function (err) {
                console.log("passed");
                next();
            });
        },
        
        function (next, error) {
            
            console.log("-----Testing unfollow-----");
            Follow.unfollow(userId, mangaId, function () {
                console.log("passed");
                next();
            }, error);
        },
        
        function (next, error) {
            
            console.log("-----Testing unfollow again - should cast error-----");
            Follow.unfollow(userId, mangaId, function () {
                error(new Error("should cast error"));
            }, function (err) {
                // console.log(err);
                console.log("passed");
                next();
            });
        },
        
        function (next, error) {
            console.log("-----Testing follow again-----");
            Follow.follow(userId, mangaId, function (followId) {
                next();
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing read 1-----");
            Follow.read(userId, mangaId, 8, function () {
                Follow.getFollow(userId, mangaId, function (follow) {
                    try {
                        var curr = follow["current_episode"];
                        var max = follow["max_episode"];
                        var isUpToDate = follow["up_to_date"];
                        assert(curr == 8);
                        assert(max == 8);
                        assert(isUpToDate == false);
                        console.log("passed");
                        next();
                    }
                    catch (err) {
                        error(err);
                    }
                }, error);
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing read 2-----");
            Follow.read(userId, mangaId, 5, function () {
                Follow.getFollow(userId, mangaId, function (follow) {
                    try {
                        var curr = follow["current_episode"];
                        var max = follow["max_episode"];
                        var isUpToDate = follow["up_to_date"];
                        assert(curr == 5);
                        assert(max == 8);
                        assert(isUpToDate == false);
                        console.log("passed");
                        next();
                    }
                    catch (err) {
                        error(err);
                    }
                }, error);
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing read 3-----");
            Follow.read(userId, mangaId, 10, function () {
                Follow.getFollow(userId, mangaId, function (follow) {
                    try {
                        var curr = follow["current_episode"];
                        var max = follow["max_episode"];
                        var isUpToDate = follow["up_to_date"];
                        assert(curr == 10);
                        assert(max == 10);
                        assert(isUpToDate == true);
                        console.log("passed");
                        next();
                    }
                    catch (err) {
                        error(err);
                    }
                }, error);
            }, error);
        },
        
        function (next, error) {
            console.log("-----Testing read 4-----");
            Follow.read(userId, mangaId, 1, function () {
                Follow.getFollow(userId, mangaId, function (follow) {
                    try {
                        var curr = follow["current_episode"];
                        var max = follow["max_episode"];
                        var isUpToDate = follow["up_to_date"];
                        assert(curr == 1);
                        assert(max == 10);
                        assert(isUpToDate == true);
                        console.log("passed");
                        next();
                    }
                    catch (err) {
                        error(err);
                    }
                }, error);
            }, error);
        }
    ],
    finish (cb) {
        User.removeUser(username, function (success) {
            cb();
        });
    }
});
