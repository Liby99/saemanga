var mysql = require("../module/mysql.js");
var util = require("../module/util.js");
var crypto = require("../module/crypto.js");

module.exports = {
    login: function (context) {
        var username = context.request.body.username;
        var password = context.request.body.password;
        mysql.query("SELECT * FROM `user` WHERE ?", {
            username: username
        }, function (err, result) {
            if (err || result.length == 0) {
                context.response.error(1, "该用户名不存在");
            }
            else {
                if (crypto.match(password, result[0]["password"])) {
                    context.response.updateUUID(result[0]["UUID"]);
                    context.response.updateUsername(result[0]["username"]);
                    context.response.success({});
                }
                else {
                    context.response.error(2, "密码输入错误");
                }
            }
        });
    },
    logout: function (context) {
        context.response.clearUsername();
        context.response.success({});
    },
    reset: function (context) {
        context.response.clearAll();
        context.response.success({});
    },
    register: function (context) {
        var username = context.request.body.username;
        var password = context.request.body.password;
        var UUID = context.request.cookies.UUID;
        if (validUsername(username) && validPassword(password)) {
            mysql.query("SELECT * FROM `user` WHERE ?", {
                UUID: UUID
            }, function (err, result) {
                if (err) {
                    context.response.error(100, "数据库错误");
                }
                else {
                    if (result.length == 0) {
                        context.response.error(101, "该用户不存在");
                    }
                    else {

                        function insert(UUID, username, password) {
                            mysql.query("SELECT * FROM `user` WHERE ?", {
                                username: username
                            }, function (err, result) {
                                if (err || result.length > 0) {
                                    context.response.error(103, "该用户名已被使用");
                                }
                                else {
                                    var encrypted = crypto.genEncrypted(password);
                                    mysql.query("UPDATE `user` SET `username` = ?, `password` = ? WHERE `UUID` = ?", [
                                        username,
                                        encrypted,
                                        UUID
                                    ], function (err, result) {
                                        if (err) {
                                            context.response.error(104, "数据库出错");
                                        }
                                        else {
                                            context.response.updateUUID(UUID);
                                            context.response.updateUsername(username);
                                            context.response.success({});
                                        }
                                    });
                                }
                            });
                        }

                        if (result[0]["username"]) {
                            UUID = util.UUID();
                            mysql.query("INSERT INTO `user` SET `register_date_time` = NOW(), `last_login` = NOW(), ?", {
                                UUID: UUID,
                                agent: context.request.headers["user-agent"]
                            }, function (err, result) {
                                if (err) {
                                    context.response.error(105, "数据库出错");
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
            context.response.error(1, "您输入的用户名或密码不符合要求");
        }
    },
    change_password: function (context) {
        var origin_pw = context.request.body.origin_pw;
        var new_pw = context.request.body.new_pw;
        var UUID = context.request.cookies.UUID;
        var username = context.request.cookies.username;
        mysql.query("SELECT * FROM `user` WHERE ?", {
            UUID: UUID
        }, function (err, result) {
            if (err) {
                context.response.error(100, "数据库处理错误");
            }
            else {
                if (result.length == 0) {
                    context.response.error(101, "该账户未找到");
                }
                else if (!username || !result[0]["username"] || username != result[0]["username"]) {
                    context.response.error(102, "用户未登录或注册");
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
                                    context.response.error(105, "数据库出错");
                                }
                                else {
                                    context.response.success({});
                                }
                            });
                        }
                        else {
                            context.response.error(104, "输入的新密码不符合要求");
                        }
                    }
                    else {
                        context.response.error(103, "输入的原密码不符");
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
