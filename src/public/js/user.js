var User = {
    $loginForm: $("#login-form"),
    $registerForm: $("#register-form"),
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
        this.$registerForm.submit(function () {
            self.register($(this));
            return false;
        });
    },
    validate: function (username, password) {
        try {
            if (!username) {
                throw new Error("请输入用户名");
            }
            if (!password) {
                throw new Error("请输入密码");
            }
            var um = username.match(this.usernameReg);
            var pm = password.match(this.passwordReg);
            if (!um) {
                throw new Error("对不起，您输入的用户名不符合要求");
            }
            else if (!pm) {
                throw new Error("对不起，您输入的密码不符合要求");
            }
            else {
                return true;
            }
        }
        catch (err) {
            alert(err);
            return false;
        }
    },
    login: function ($form) {
        var obj = $form.formData();
        if (this.validate(obj.username, obj.password)) {
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
    },
    hasLoggedIn: function () {
        return window.cookie.get("username") != undefined;
    },
    register: function ($form) {
        var obj = $form.formData();
        if (this.validate(obj.username, obj.password)) {
            $.kajax({
                url: "/ajax/user?action=register",
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
    },
    showLogin: function () {
        Sidebar.show();
        this.$loginForm.children("input[name=username]").focus();
    },
    showRegister: function () {
        $.panel.show("register");
        this.$registerForm.children("input[name=username]").focus();
    }
}
