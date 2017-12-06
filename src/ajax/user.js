const User = require("../api/user");
const Debug = require("keeling-js/lib/debug");

const usernameReg = /^[A-Za-z0-9@\-\_\.\#\*]{4,16}$/;
const passwordReg = /^[A-Za-z0-9@\-\_\.\#\*]{8,32}$/;

const expires = 1000 * 60 * 60 * 24 * 365;

module.exports = {
    register: function (req, res) {
        
    },
    login: function (req, res) {
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
    }
}
