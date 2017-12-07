var User = {
    loginElems: [
        $("#index-header-login"),
        $("#sidebar-login-section")
    ],
    userElems: [
        $("#index-header-user"),
        $("#sidebar-user-section")
    ],
    $username: $(".username"),
    $loginForm: $("#login-form"),
    usernameReg: /^[A-Za-z0-9@\-\_\.\#\*]{4,16}$/,
    passwordReg: /^[A-Za-z0-9@\-\_\.\#\*]{8,32}$/,
    initiate: function () {
        this.initiateForm();
    },
    initiateForm: function () {
        var self = this;
        this.$loginForm.submit(function () {
            self.login($(this));
            return false;
        });
    },
    // initiateUser: function (callback) {
    //     var self = this;
    //     var username = window.cookie.get("username");
    //     if (username) {
    //         this.username = username;
    //         this.logged = true;
    //         $.kajax({
    //             url: "/ajax/user?action=get",
    //             type: "post",
    //             data: { username: username },
    //             success: function (user) {
    //                 self.showUser(user);
    //                 callback();
    //             },
    //             error: function (err) {
    //                 self.showLogin();
    //                 callback();
    //             }
    //         });
    //     }
    //     else {
    //         self.showLogin();
    //         callback();
    //     }
    // },
    // showUser: function (user) {
    //     this.showUserElems(user);
    //     this.hideLoginElems();
    // },
    // showLogin: function () {
    //     this.showLoginElems();
    //     this.hideUserElems();
    // },
    // showUserElems: function (user) {
    //     for (var i = 0; i < this.userElems.length; i++)
    //         this.userElems[i].show();
    //     this.$username.text(user.username);
    // },
    // hideUserElems: function () {
    //     for (var i = 0; i < this.userElems.length; i++)
    //         this.userElems[i].hide();
    // },
    // showLoginElems: function () {
    //     for (var i = 0; i < this.loginElems.length; i++)
    //         this.loginElems[i].show();
    // },
    // hideLoginElems: function () {
    //     for (var i = 0; i < this.loginElems.length; i++)
    //         this.loginElems[i].hide();
    // },
    login: function ($form) {
        try {
            var obj = $form.formData();
            if (!obj.username) {
                throw new Error("请输入用户名");
            }
            if (!obj.password) {
                throw new Error("请输入密码");
            }
            var um = obj.username.match(this.usernameReg);
            var pm = obj.password.match(this.passwordReg);
            if (!um) {
                throw new Error("对不起，您输入的用户名不符合要求");
            }
            else if (!pm) {
                throw new Error("对不起，您输入的密码不符合要求");
            }
            else {
                $.kajax({
                    url: "/ajax/user?action=login",
                    type: "post",
                    data: obj,
                    success: function () {
                        window.location.reload();
                    },
                    error: function (error) {
                        alert(error);
                    }
                });
            }
        }
        catch (err) {
            alert(err);
        }
    },
    logout: function () {
        if (confirm("您确定要登出吗")) {
            $.kajax({
                url: "/ajax/user?action=logout",
                type: "get",
                success: function () {
                    window.location.reload();
                }
            });
        }
    }
}
