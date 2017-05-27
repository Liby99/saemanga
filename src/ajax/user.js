
// Require Keeling Js Modules
var mysql = require("keeling-js/lib/mysql");
var crypto = require("keeling-js/lib/crypto");

// Require Utility API
var util = require("../api/util.js");

module.exports = {
    login: function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        mysql.query("SELECT * FROM `user` WHERE ?", {
            username: username
        }, function (err, result) {
            if (err || result.length == 0) {
                res.error(1, "该用户名不存在");
            }
            else {
                if (crypto.match(password, result[0]["password"])) {
                    res.updateUUID(result[0]["UUID"]);
                    res.updateUsername(result[0]["username"]);
                    res.success({});
                }
                else {
                    res.error(2, "密码输入错误");
                }
            }
        });
    },
    logout: function (req, res) {
        res.clearUsername();
        res.success({});
    },
    reset: function (req, res) {
        res.clearAll();
        res.success({});
    },
    register: function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var UUID = req.cookies.UUID;
        if (validUsername(username) && validPassword(password)) {
            mysql.query("SELECT * FROM `user` WHERE ?", {
                UUID: UUID
            }, function (err, result) {
                if (err) {
                    res.error(100, "数据库错误");
                }
                else {
                    if (result.length == 0) {
                        res.error(101, "该用户不存在");
                    }
                    else {

                        function insert(UUID, username, password) {
                            mysql.query("SELECT * FROM `user` WHERE ?", {
                                username: username
                            }, function (err, result) {
                                if (err || result.length > 0) {
                                    res.error(103, "该用户名已被使用");
                                }
                                else {
                                    var encrypted = crypto.genEncrypted(password);
                                    mysql.query("UPDATE `user` SET `username` = ?, `password` = ? WHERE `UUID` = ?", [
                                        username,
                                        encrypted,
                                        UUID
                                    ], function (err, result) {
                                        if (err) {
                                            res.error(104, "数据库出错");
                                        }
                                        else {
                                            res.updateUUID(UUID);
                                            res.updateUsername(username);
                                            res.success({});
                                        }
                                    });
                                }
                            });
                        }

                        if (result[0]["username"]) {
                            UUID = util.generateUUID();
                            mysql.query("INSERT INTO `user` SET `register_date_time` = NOW(), `last_login` = NOW(), ?", {
                                UUID: UUID,
                                agent: req.headers["user-agent"]
                            }, function (err, result) {
                                if (err) {
                                    res.error(105, "数据库出错");
                                }
                                else {
                                    insert(UUID, username, password);
                                }
                            });
                        }
                        else {
                            insert(UUID, username, password);
                        }
                    }
                }
            });
        }
        else {
            res.error(1, "您输入的用户名或密码不符合要求");
        }
    },
    change_password: function (req, res) {
        var origin_pw = req.body.origin_pw;
        var new_pw = req.body.new_pw;
        var UUID = req.cookies.UUID;
        var username = req.cookies.username;
        mysql.query("SELECT * FROM `user` WHERE ?", {
            UUID: UUID
        }, function (err, result) {
            if (err) {
                res.error(100, "数据库处理错误");
            }
            else {
                if (result.length == 0) {
                    res.error(101, "该账户未找到");
                }
                else if (!username || !result[0]["username"] || username != result[0]["username"]) {
                    res.error(102, "用户未登录或注册");
                }
                else {
                    if (crypto.match(origin_pw, result[0]["password"])) {
                        if (validPassword(new_pw)) {
                            var encrypted = crypto.genEncrypted(new_pw);
                            mysql.query("UPDATE `user` SET `password` = ? WHERE `UUID` = ?", [
                                encrypted,
                                UUID
                            ], function (err, result) {
                                if (err) {
                                    res.error(105, "数据库出错");
                                }
                                else {
                                    res.success({});
                                }
                            });
                        }
                        else {
                            res.error(104, "输入的新密码不符合要求");
                        }
                    }
                    else {
                        res.error(103, "输入的原密码不符");
                    }
                }
            }
        });
    }
}

function validUsername(username) {
    var regex = /^[\w\d]{4,10}$/;
    return username.match(regex) != null;
}

function validPassword(password) {
    var regex = /^[\w\d\-\_\@\=]{8,16}$/;
    return password.match(regex) != null;
}
