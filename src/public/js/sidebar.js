var Sidebar = {
    $nav: $("nav"),
    $toggle: $("#sidebar-toggle"),
    $mask: $("#sidebar-mask"),
    $sidebar: $("#sidebar"),
    $lightModeSelect: $("#light-mode-select"),
    $handModeSelect: $("#hand-mode-select"),
    scrollElem: "body",
    initiate: function () {
        this.initiateSetting();
    },
    initiateSetting: function () {
        this.initiateSelectListener();
        this.initiateCookieSetting();
    },
    initiateSelectListener: function () {
        
        var self = this;
        
        this.$lightModeSelect.change(function () {
            if ($(this).selectValue() == "night")
                self.setToNightMode();
            else
                self.setToDayMode();
        });
        
        this.$handModeSelect.change(function () {
            if ($(this).selectValue() == "left")
                self.setToLeftMode();
            else
                self.setToRightMode();
        });
    },
    initiateCookieSetting: function () {
        this.initiateHandMode();
        this.initiateLightMode();
    },
    toggle: function () {
        if (this.isShowing())
            this.hide();
        else
            this.show();
    },
    isShowing: function () {
        return this.$sidebar.hasClass("active");
    },
    show: function () {
        this.$nav.addClass("active");
        this.$toggle.children("i").addClass("active");
        this.$sidebar.addClass("active");
        this.$mask.fadeIn(200);
        this.fixBody();
    },
    hide: function () {
        this.$nav.removeClass("active");
        this.$toggle.children("i").removeClass("active");
        this.$sidebar.removeClass("active");
        this.$mask.fadeOut(200);
        this.unfixBody();
    },
    fixBody: function () {
        if (!$("body").hasClass("fixed")) {
            var elem = "body", top = $(elem).scrollTop();
            if ($("html").scrollTop() > top) {
                elem = "html", top = $(elem).scrollTop();
            }
            this.scrollElem = elem;
            $("body").addClass("fixed").attr("data-top", top).css({"margin-top": -top, "position": "fixed"});
        }
    },
    unfixBody: function () {
        if ($("body").hasClass("fixed")) {
            var top = $("body").attr("data-top");
            $("body").removeClass("fixed").css({"margin-top": 0, "position": "relative"});
            $(this.scrollElem).animate({"scrollTop": top}, 0);
        }
    },
    initiateHandMode: function () {
        var mode = this.getHandModeCookie() || "right";
        this.$handModeSelect.selectValue(mode);
    },
    getHandModeCookie: function () {
        return window.cookie.get("hand");
    },
    setHandModeCookie: function (mode) {
        window.cookie.set("hand", mode);
    },
    setToLeftMode: function () {
        this.setHandModeCookie("left");
        $("nav").addClass("left");
    },
    setToRightMode: function () {
        this.setHandModeCookie("right");
        $("nav").removeClass("left");
    },
    initiateLightMode: function () {
        var mode = this.getLightModeCookie() || "day";
        this.$lightModeSelect.selectValue(mode);
    },
    getLightModeCookie: function () {
        return window.cookie.get("light");
    },
    setLightModeCookie: function (mode) {
        window.cookie.set("light", mode);
    },
    setToDayMode: function () {
        this.setLightModeCookie("day");
        $("body").removeClass("night");
    },
    setToNightMode: function () {
        this.setLightModeCookie("night");
        $("body").addClass("night");
    }
}
