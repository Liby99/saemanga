var User = {
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
    },
    hasLoggedIn: function () {
        return window.cookie.get("username") != undefined;
    },
    showLogin: function () {
        Sidebar.show();
        this.$loginForm.children("input[name=username]").focus();
    }
}
