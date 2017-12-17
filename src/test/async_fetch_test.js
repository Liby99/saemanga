var Cartoonmad = require("../api/cartoonmad");
var Promise = require("../api/lib/promise");

var arr = [
    "4485",
    "4085",
    "3949",
    "6212",
    "1159",
    "6176",
    "6094",
    "4462",
    "6085",
    "6013",
    "6153",
    "4975",
    "6037",
    "5240",
    "6256",
    "4701",
    "6130",
    "6329",
    "5496",
    "4168",
    "6323",
    "1936",
    "5425",
    "4798",
    "5013",
    "5345",
    "5295",
    "4750",
    "6047",
    "5498",
    "4778",
    "5582",
    "3774",
    "5456",
    "5289",
    "6090",
    "2003",
    "4477",
    "1387",
    "5636",
    "3690",
    "1878",
    "4566",
    "5500",
    "4336",
    "5800",
    "6257",
    "6236",
    "6159",
    "5121",
    "1204"
];

function runAsyncOld (callback) {
    var count = 0;
    function trigger () {
        count++;
        if (count == arr.length) {
            callback();
        }
    }
    for (var i = 0; i < arr.length; i++) {
        Cartoonmad.getMangaInfo(arr[i], function (info) {
            console.log("Async Done fetching " + info["dmk_id"]);
            trigger();
        }, function (err) {
            console.log("fetch error: " + err);
            process.exit(1);
        });
    }
}

function runAsync (callback) {
    Promise.all(arr, (dmkId, i, c, e) => {
        Cartoonmad.getMangaInfo(dmkId, (info) => {
            console.log("Async done fetching " + info["dmk_id"]);
            c();
        }, e);
    }, callback, (err) => {
        console.log("fetch error: " + err);
        process.exit(1);
    });
}

function runSync (callback) {
    (function p (i) {
        if (i < arr.length) {
            Cartoonmad.getMangaInfo(arr[i], function (info) {
                console.log("Sync Done fetching " + arr[i]);
                p(i + 1);
            }, function (err) {
                console.log("fetch " + arr[i] + "error: " + err);
                process.exit(1);
            });
        }
        else {
            callback();
        }
    })(0);
}

function benchmark (func, callback) {
    var start = new Date();
    func(function () {
        var end = new Date();
        callback(Math.floor((end - start) / 1000));
    });
}

benchmark(runAsync, function (time) {
    console.log("Async runs " + time + "s");
    benchmark(runSync, function (time) {
        console.log("Sync runs " + time + "s");
    });
});
