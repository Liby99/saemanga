const Cartoonmad = require("../api/cartoonmad");

module.exports = {
    search: function (req, res) {
        Cartoonmad.search(req.body.query, function (ids) {
            res.success(ids);
        }, function (err) {
            res.error(1, err);
        });
    }
}
