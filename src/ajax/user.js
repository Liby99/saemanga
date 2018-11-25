const Debug = require('keeling-js/lib/debug');
const User = require('../api/user');

const expires = 1000 * 60 * 60 * 24 * 365;

module.exports = {
  get(req, res) {
    const { username } = req.cookies;
    if (username) {
      User.getUser(username, (user) => {
        if (user) {
          res.success(user);
        } else {
          res.error(3, '对不起，用户未找到');
        }
      }, (err) => {
        res.error(2, err);
      });
    } else {
      res.error(1, '对不起，您尚未登陆');
    }
  },
  register(req, res) {
    const { username, password } = req.body;
    User.addUser(username, password, () => {
      res.cookie('username', username, {
        expires: new Date(Date.now() + expires),
      });
      res.success();
    }, (err) => {
      res.error(1, err);
    });
  },
  login(req, res) {
    const { username, password } = req.body;
    User.login(username, password, (success) => {
      if (success) {
        res.cookie('username', username, {
          expires: new Date(Date.now() + expires),
        });
        res.success();
      } else {
        res.error(6, '对不起，您的用户名或密码输入错误');
      }
    }, (err) => {
      Debug.errro(err);
      res.error(1, err);
    });
  },
  logout(req, res) {
    res.clearCookie('username');
    res.success();
  },
  change_password(req, res) {
    const { oldpwd, newpwd } = req.body;
    const { username } = req.cookies;
    User.changePassword(username, oldpwd, newpwd, (success) => {
      if (success) {
        res.success();
      } else {
        res.error(2, '原密码不符');
      }
    }, (err) => {
      res.error(1, err);
    });
  },
};
