var Page = {
    initiate: function () {
        Page.loadPanels();
        Page.loadLogin();
        Page.loadSetting();
    },
    initiateButtonClick: function () {
        $(".selection .option").click(function () {
            $(this).addClass("active").siblings().removeClass("active");
        });
    },
    initiateTimeMode: function () {
        var time = Utility.getCookie("time_mode");
        if (time) {
            if (time == "0") {
                this.setToDayTimeMode();
            }
            else {
                this.setToNightTimeMode();
            }
        }
        else {
            this.setToDayTimeMode();
        }
    },
    setToDayTimeMode: function () {
        Utility.setCookie("time_mode", "0");
        $("#menu_time_mode_day").addClass("active").siblings().removeClass("active");
        $("body").removeClass("night_time");
    },
    setToNightTimeMode: function () {
        Utility.setCookie("time_mode", "1");
        $("#menu_time_mode_night").addClass("active").siblings().removeClass("active");
        $("body").addClass("night_time");
    },
    initiateHandMode: function () {
        var hand = Utility.getCookie("hand_mode");
        if (hand) {
            if (hand == "0") {
                this.setToLeftHandMode();
            }
            else {
                this.setToRightHandMode();
            }
        }
        else {
            this.setToRightHandMode();
        }
    },
    setToLeftHandMode: function () {
        Utility.setCookie("hand_mode", 0);
        $("#menu_hand_mode_left").addClass("active").siblings().removeClass("active");
        $("#menu").addClass("left");
    },
    setToRightHandMode: function () {
        Utility.setCookie("hand_mode", 1);
        $("#menu_hand_mode_right").addClass("active").siblings().removeClass("active");
        $("#menu").removeClass("left");
    },
    goToIndex: function () {
        window.location.href = "/index.html";
    },
    fixBody: function () {
        if (!$("body").hasClass("fixed")) {
            $("body").addClass("fixed").attr("data-top", $("body").scrollTop()).css({"margin-top": - $("body").scrollTop(), "position": "fixed"});
        }
    },
    unfixBody: function () {
        if ($("body").hasClass("fixed")) {
            $("body").removeClass("fixed").css({"margin-top": 0, "position": "relative"}).animate({"scrollTop": $("body").attr("data-top")}, 0);
        }
    },
    loadLogin: function () {
        $.ajax({
            url: "view/login.html",
            type: "get",
            success: function (login) {
                $.ajax({
                    url: "view/account.html",
                    type: "get",
                    success: function (account) {
                        $("#menu_user_login").html(login);
                        $("#menu_user_account").html(account);
                        User.initiate();
                        User.load();
                    },
                    error: function () {
                        alert("服务器连接错误");
                    }
                });
            },
            error: function () {
                alert("服务器连接错误");
            }
        })
    },
    loadPanels: function () {
        $.ajax({
            url: "view/panels.html",
            type: "get",
            success: function (result) {
                $("#panels").html(result);
                About.initiate();
            },
            error: function () {
                alert("服务器连接错误");
            }
        });
    },
    loadSetting: function () {
        $.ajax({
            url: "view/setting.html",
            type: "get",
            success: function (result) {
                $("#menu_setting").html(result);
                Page.initiateButtonClick();
                Page.initiateTimeMode();
                Page.initiateHandMode();
            },
            error: function () {
                alert("服务器连接错误");
            }
        });
    }
}

var User = {
    logged: false,
    initiate: function () {
        var RETURN = 13;
        
        $("#menu_login_username, #menu_login_password").keydown(function (event) {
            switch (event.keyCode) {
                case RETURN:
                    User.login();
                    break;
            }
        });
        
        $("#register_username, #register_password, #register_confirm_password").keydown(function (event) {
            switch (event.keyCode) {
                case RETURN:
                    User.register();
                    break;
            }
        });

        $("#original_password, #new_password, #confirm_new_password").keydown(function (event) {
            switch (event.keyCode) {
                case RETURN:
                    User.changePassword();
                    break;
            }
        });

        $("#menu_user_logout").click(function (event) {
            event.stopPropagation();
            User.logout();
        });

        $("#menu_user_change_password").click(function (event) {
            event.stopPropagation();
            Panel.show("change_password");
        });
    },
    load: function () {
        if (Utility.getCookie("username")) {
            $("#menu_user_username").text(Utility.getCookie("username"));
            this.logged = true;
            this.showAccount();
        }
        else {
            this.showLogin();
        }
    },
    login: function () {
        var username = $("#menu_login_username").val();
        var password = $("#menu_login_password").val();
        if (username != "" && password != "") {
            $.ajax({
                url: "/ajax/user?action=login",
                type: "post",
                data: { username: username, password: password },
                success: function (result) {
                    var data = JSON.parse(result);
                    if (data.error_code != 0) {
                        alert(data.error_log);
                    }
                    else {
                        window.location.reload();
                    }
                },
                error: function () {
                    alert("服务器连接错误");
                }
            })
        }
        else {
            alert("请输入您的用户名和密码");
        }
    },
    logout: function () {
        if (confirm("您确定要登出吗？在下次登录前，您的记录依旧会被保存。")) {
            if (Utility.getCookie("username")) {
                $.ajax({
                    url: "/ajax/user?action=logout",
                    type: "post",
                    success: function (result) {
                        var data = JSON.parse(result);
                        if (data.error_code == 0) {
                            window.location.reload();
                        }
                        else {
                            alert(data.error_log);
                        }
                    },
                    error: function () {
                        alert("服务器连接错误");
                    }
                })
            }
            else {
                alert("您还没登录呢");
            }
        }
    },
    register: function () {
        var username = $("#register_username").val();
        var password = $("#register_password").val();
        var confirm = $("#register_confirm_password").val();
        if (username != "" && password != "" && confirm != "") {
            if (confirm == password) {
                $.ajax({
                    url: "/ajax/user?action=register",
                    type: "post",
                    data: { username: username, password: password },
                    success: function (result) {
                        var data = JSON.parse(result);
                        if (data.error_code != 0) {
                            alert(data.error_log);
                        }
                        else {
                            window.location.reload();
                        }
                    },
                    error: function () {
                        alert("服务器连接错误");
                    }
                });
            }
            else {
                alert("您的确认密码和密码不匹配");
            }
        }
        else {
            alert("请输入用户名和密码");
        }
    },
    changePassword: function () {
        if (this.logged) {
            var originalPassword = $("#original_password").val();
            var newPassword = $("#new_password").val();
            var confirmNewPassword = $("#confirm_new_password").val();
            if (originalPassword != "" && newPassword != "" && confirmNewPassword != "") {
                if (newPassword == confirmNewPassword) {
                    $.ajax({
                        url: "/ajax/user?action=change_password",
                        type: "post",
                        data: { origin_pw: originalPassword, new_pw: newPassword },
                        success: function (result) {
                            var data = JSON.parse(result);
                            if (data.error_code == 0) {
                                alert("密码更改成功");
                                window.location.reload();
                            }
                            else {
                                alert(data.error_log);
                            }
                        },
                        error: function () {
                            alert("服务器连接错误");
                        }
                    });
                }
                else {
                    alert("您输入的确认密码和新密码不匹配");
                }
            }
            else {
                alert("请输入所有必填项");
            }
        }
        else {
            alert("您还未登录");
        }
    },
    reset: function () {
        if (confirm("重置账户将会在本机上生成一个全新的账户。如果没有注册的话，之前的数据就再也恢复不了了。您确定要这么做吗？")) {
            $.ajax({
                url: "/ajax/user?action=reset",
                type: "post",
                success: function (result) {
                    var data = JSON.parse(result);
                    if (data.error_code == 0) {
                        window.location.href = "/index.html";
                    }
                    else {
                        alert(data.error_log);
                    }
                },
                error: function () {
                    alert("服务器连接错误");
                }
            });
        }
    },
    showAccount: function () {
        $("#menu_user_login").attr("hidden", "hidden");
        $("#menu_user_account").removeAttr("hidden");
    },
    showLogin: function () {
        $("#menu_user_account").attr("hidden", "hidden");
        $("#menu_user_login").removeAttr("hidden");
    },
}

var Menu = {
    show: function () {
        $("#menu_outer").addClass("active");
        $("#menu_mask").fadeIn("fast");
        Page.fixBody();
    },
    hide: function () {
        $("#menu_outer").removeClass("active");
        $("#menu_mask").fadeOut("fast");
        Page.unfixBody();
    }
}

var Panel = {
    show: function (panel) {
        $("#" + panel + "_panel").addClass("active").fadeIn();
    },
    close: function (panel) {
        $("#" + panel + "_panel").removeClass("active").fadeOut();
    }
};

var About = {
    initiate: function () {
        this.initiatePanelCollapse();
    },
    initiatePanelCollapse: function () {
        var self = this;
        
        $("#about_panel_body .title").click(function () {
            if ($(this).parent().hasClass("collapsed")) {
                self.span($(this).parent());
            }
            else {
                self.collapse($(this).parent());
            }
        });
        
        $("#about_panel_body .collapse_btn").click(function () {
            self.collapse($(this).parent());
        });
    },
    collapse: function (elem) {
        elem.addClass("collapsed");
        elem.children(".title").children("i").removeClass("fa-rotate-90");
    },
    span: function (elem) {
        elem.removeClass("collapsed");
        elem.children(".title").children("i").addClass("fa-rotate-90");
    }
}

var Utility = {
    setCookie: function (entry, value) {
        var date = new Date();
        date.setDate(date.getDate() + 365);
        document.cookie = entry + "=" + value + ";expires=" + date.toLocaleDateString();
    },
    getCookie: function (entry) {
        if (document.cookie.length > 0) {
            start = document.cookie.indexOf(entry + "=")
            if (start != -1) { 
                start += entry.length + 1 ;
                end = document.cookie.indexOf(";", start);
                if (end == -1) {
                    end = document.cookie.length;
                }
                return document.cookie.substring(start, end);
            }
        }
        return "";
    },
    pad: function (num) {
        if (num < 10) {
            return "00" + num;
        }
        else if (num < 100) {
            return "0" + num;
        }
        else {
            return num;
        }
    },
    getQueryParams: function () {
        var search = document.location.search.split('+').join(' ');
        var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(search)) params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        return params;
    }
}
