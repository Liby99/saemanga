const User = require("../api/user");
const Debug = require("keeling-js/lib/debug");

const expires = 1000 * 60 * 60 * 24 * 365;

module.exports = {
    get: function (req, res) {
        var username = req.cookies.username;
        if (username) {
            User.getUser(username, function (user) {
                if (user) {
                    res.success(user);
                }
                else {
                    res.error(3, "对不起，用户未找到");
                }
            }, function (err) {
                res.error(2, err);
            });
        }
        else {
            res.error(1, "对不起，您尚未登陆");
        }
    },
    register: function (req, res) {
        var { username, password } = req.body;
        User.addUser(username, password, function (userId) {
            res.cookie("username", username, {
                expires: new Date(Date.now() + expires)
            });
            res.success();
        }, function (err) {
            res.error(1, err);
        });
    },
    login: function (req, res) {
        var { username, password } = req.body;
        User.login(username, password, function (success) {
            if (success) {
                res.cookie("username", username, {
                    expires: new Date(Date.now() + expires)
                });
                res.success();
            }
            else {
                res.error(6, "对不起，您的用户名或密码输入错误");
            }
        }, function (err) {
            Debug.errro(err);
            res.error(1, err);
        });
    },
    logout: function (req, res) {
        res.clearCookie("username");
        res.success();
    }
}
