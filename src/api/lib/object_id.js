const { ObjectID } = require('mongodb');

module.exports = id => ((id instanceof ObjectID) ? id : ObjectID(id));
