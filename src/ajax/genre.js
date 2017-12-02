const Genre = require("../api/genre");

module.exports = {
    "get": function (req, res) {
        res.success(Genre.get());
    }
}
