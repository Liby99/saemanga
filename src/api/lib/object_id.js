const ObjectID = require('mongodb').ObjectID;
module.exports = function (id) {
    return (id instanceof ObjectID) ? id : ObjectID(id);
}
