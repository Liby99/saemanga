const ObjectID = require('mongodb').ObjectID;

module.exports = function (id) {
    console.log(JSON.stringify(id));
    (id instanceof ObjectID) ? id : ObjectID(id);
}
