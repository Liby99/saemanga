try {
    var notexist = require("notexist.js");
}
catch (err) {
    console.log(err.code);
}
