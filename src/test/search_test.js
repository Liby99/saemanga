const assert = require("assert");
const Cartoonmad = require("../api/cartoonmad");
const UnitTest = require("./lib/unit_test");

UnitTest({
    tests: [
        
        (next, error) => {
            console.log("-----Testing Search Empty-----");
            Cartoonmad.search("", function (ids) {
                error(new Error("Should throw error"));
            }, function (err) {
                console.log("passed");
                next();
            });
        },
        
        (next, error) => {
            console.log("-----Testing Search Trimmed Empty-----");
            Cartoonmad.search("    ", function (ids) {
                error(new Error("Should throw error"));
            }, function (err) {
                console.log("passed");
                next();
            });
        },
        
        (next, error) => {
            console.log("-----Testing search with no result-----");
            Cartoonmad.search("哈哈哈", function (ids) {
                try {
                    assert(ids.length == 0);
                    console.log("passed");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error)
        },
        
        (next, error) => {
            console.log("-----Testing 抱歉-----");
            Cartoonmad.search("抱歉", function (ids) {
                try {
                    assert(ids.length != 0);
                    console.log("[" + ids + "]");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error);
        },
        
        (next, error) => {
            console.log("-----Testing 魔法-----");
            Cartoonmad.search("魔法", function (ids) {
                try {
                    assert(ids.length != 0);
                    console.log("[" + ids + "]");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error);
        },
        
        (next, error) => {
            console.log("-----Testing 小埋-----");
            Cartoonmad.search("小埋", function (ids) {
                try {
                    assert(ids.length != 0);
                    console.log("[" + ids + "]");
                    next();
                }
                catch (err) {
                    error(err);
                }
            }, error);
        }
    ]
});
