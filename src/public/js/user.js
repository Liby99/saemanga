var User = {
    $loginForm: $("#login-form"),
    $registerForm: $("#register-form"),
    $changePasswordForm: $("#change-password-form"),
    usernameReg: /^[A-Za-z0-9@\-\_\.\#\*]{4,16}$/,
    passwordReg: /^[A-Za-z0-9@\-\_\.\#\*]{8,32}$/,
    initiate: function () {
        this.initiateForm();
    },
    initiateForm: function () {
        
        var self = this;
        
        // Initiate login form
        this.$loginForm.submit(function () {
            try {
                self.login($(this));
            }
            catch (err) {
                console.error(err);
            }
            return false;
        });
        
        // Initiate register form
        this.$registerForm.submit(function () {
            try {
                self.register($(this));
            }
            catch (err) {
                console.error(err);
            }
            return false;
        });
        
        // Initiate Change Password form
        this.$changePasswordForm.submit(function () {
            try {
                self.changePassword($(this));
            }
            catch (err) {
                console.error(err);
            }
            return false;
        });
    },
    validateString: function (str, reg) {
        return str.match(reg) != undefined;
    },
    validateUsername: function (username) {
        return this.validateString(username, this.usernameReg);
    },
    validatePassword: function (password) {
        return this.validateString(password, this.passwordReg);
    },
    validate: function (username, password) {
        if (this.validateUsername(username)) {
            if (this.validatePassword(password)) {
                return true;
            }
            else {
                alert("对不起，您输入的密码不符合要求");
                return false;
            }
        }
        else {
            alert("对不起，您输入的用户名不符合要求");
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
    changePassword: function ($form) {
        var self = this, obj = $form.formData();
        if (this.validatePassword(obj.oldpwd)) {
            if (this.validatePassword(obj.newpwd)) {
                $.kajax({
                    url: "/ajax/user?action=change_password",
                    type: "post",
                    data: obj,
                    success: function () {
                        alert("密码修改成功！");
                        $.panel.hide("change-password");
                        self.clearChangePassword();
                    }
                });
            }
            else {
                alert("您输入的新密码不符合规范");
            }
        }
        else {
            alert("您输入的旧密码不符合规范");
        }
    },
    showLogin: function () {
        Sidebar.show();
        this.$loginForm.children("input[name=username]").focus();
    },
    showRegister: function () {
        $.panel.show("register");
        this.$registerForm.children("input[name=username]").focus();
    },
    showChangePassword: function () {
        $.panel.show("change-password");
        this.$changePasswordForm.children("input[name=old]").focus();
    },
    clearChangePassword: function () {
        this.$changePasswordForm[0].reset();
    }
}
