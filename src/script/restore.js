/* eslint-disable */
const RunScript = require("./lib/run_script");
const Promise = require("../api/lib/promise");
var Mongo, FollowDB, UserDB, MangaDB;
var Manga, User, Follow;

const convertExcel = require('excel-as-json').processFile;

function getMangas(callback) {
    convertExcel("../../../backup/excel/2017-12-11-mysql.xlsx", undefined, {
        sheet: 2
    }, (err, users) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else {
            callback(users);
        }
    });
}

function populateMangas(mangas, next) {
    var dmkIds = mangas.map((obj) => obj.dmk_id.toString());
    console.log(dmkIds.length + " mangas to fetch");
    Manga.getAll(dmkIds, (mangas) => {
        console.log("successfully fetched " + mangas.length + " mangas");
        next();
    }, (err) => {
        console.error(err);
    });
}

function getUsers(callback) {
    convertExcel("../../../backup/excel/2017-12-11-mysql.xlsx", undefined, {
        sheet: 3
    }, (err, users) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else {
            callback(users);
        }
    });
}

function populateUsers(users, next) {
    Promise.all(users, (user, i, c, e) => {
        UserDB.find({ "username": user.username }).count((err, count) => {
            if (count > 0) {
                c();
            }
            else {
                UserDB.insert({
                    "username": user.username,
                    "password": user.password,
                    "register_date_time": new Date(user.register_date_time * 1000),
                    "last_visit": new Date(user.last_login * 1000),
                    "last_login": new Date(user.last_login * 1000),
                    "login_amount": 0,
                    "visit_amount": 0
                }, (err, result) => {
                    if (err) {
                        e();
                    }
                    else {
                        c();
                    }
                });
            }
        });
    }, next, (err) => {
        console.error(err);
    });
}

function getFollows(callback) {
    convertExcel("../../../backup/excel/2017-12-11-mysql.xlsx", undefined, {
        sheet: 1
    }, (err, users) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else {
            callback(users);
        }
    });
}

function populateFollows(follows, next) {
    Promise.all(follows, (follow, i, c, e) => {
        UserDB.findOne({
            "username": follow["username"]
        }, (err, user) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            else if (!user) {
                c();
            }
            else {
                MangaDB.findOne({
                    "dmk_id": follow["dmk_id"].toString()
                }, (err, manga) => {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    else if (!manga) {
                        console.log("no manga " + follow["dmk_id"]);
                        process.exit(1);
                    }
                    else {
                        FollowDB.find({
                            "user_id": user["_id"],
                            "manga_id": manga["_id"]
                        }).count((err, count) => {
                            if (err) {
                                e(err);
                            }
                            else {
                                if (count > 0) {
                                    c();
                                }
                                else {
                                    FollowDB.insertOne({
                                        "user_id": user["_id"],
                                        "manga_id": manga["_id"],
                                        "update_date": new Date(follow["update_time"] * 1000),
                                        "up_to_date": follow["up_to_date"] ? true : false,
                                        "current_episode": follow["episode"],
                                        "max_episode": follow["episode"]
                                    }, (err, result) => {
                                        if (err) {
                                            e(err);
                                        }
                                        else {
                                            c();
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }, () => {
        next();
    });
}

RunScript({
    begin () {
        
        // Initiate mongo databases
        Mongo = require("keeling-js/lib/mongo");
        FollowDB = Mongo.db.collection("follow");
        UserDB = Mongo.db.collection("user");
        MangaDB = Mongo.db.collection("manga");
        
        // Initiate APIs
        Manga = require("../api/manga");
        User = require("../api/user");
        Follow = require("../api/follow");
    },
    task (next) {
        getMangas(function (mangas) {
            console.log("get " + mangas.length + " mangas to fetch");
            populateMangas(mangas, function () {
                console.log("successfully fetched mangas");
                getUsers(function (users) {
                    console.log("get " + users.length + " users to insert");
                    populateUsers(users, function () {
                        console.log("successfully populated users");
                        getFollows(function (follows) {
                            console.log("get " + follows.length + " follows");
                            populateFollows(follows, function () {
                                console.log("successfully populated follows");
                                next();
                            });
                        });
                    });
                });
            });
        });
    }
});
