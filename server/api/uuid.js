module.exports = function (req, res, callback) {
    if (req.cookies.UUID) {
        res.touchUUID();
        callback(req.cookies.UUID);
    }
    else {
        if (req.headers["user-agent"]) {
            var UUID = util.UUID();
            mysql.query("INSERT INTO `user` SET `register_date_time` = NOW(), `last_login` = NOW(), ?", {
                UUID: UUID,
                agent: req.headers["user-agent"]
            }, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                }
                else {
                    res.updateUUID(UUID);
                    callback(UUID);
                }
            });
        }
        else {
            res.sendStatus(403);
        }
    }
};
