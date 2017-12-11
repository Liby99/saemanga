var Sidebar = {
    $nav: $("nav"),
    $toggle: $("#sidebar-toggle"),
    $mask: $("#sidebar-mask"),
    $sidebar: $("#sidebar"),
    $lightModeSelect: $("#light-mode-select"),
    $handModeSelect: $("#hand-mode-select"),
    $zoom: $("#zoom"),
    scrollElem: "body",
    initiate: function () {
        this.initiateSetting();
    },
    initiateSetting: function () {
        this.initiateListener();
        this.initiateCookieSetting();
        this.initiateWidth();
    },
    initiateListener: function () {
        
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
        
        this.$zoom.children(".plus").click(function () {
            if (!$(this).hasClass("disabled")) {
                self.setWidth($("main").width() * 1.2);
            }
        });
        
        this.$zoom.children(".minus").click(function () {
            if (!$(this).hasClass("disabled")) {
                self.setWidth($("main").width() / 1.2);
            }
        });
        
        this.$zoom.children(".data").click(function () {
            self.resetWidth();
        });
        
        $(window).resize(function () {
            self.refreshSize();
            self.refreshZoom();
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
        $("body").addClass("left");
    },
    setToRightMode: function () {
        this.setHandModeCookie("right");
        $("body").removeClass("left");
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
    },
    refreshSize: function () {
        this.initialWidth = Math.min($(window).width(), 768);
        this.maxWidth = $(window).width(),
        this.minWidth = Math.max(320, Math.min(this.initialWidth, this.maxWidth / 2));
    },
    initiateWidth: function () {
        this.refreshSize();
        var w = this.getWidthCookie() || this.initialWidth;
        this.setWidth(w);
    },
    getWidthCookie: function () {
        return window.cookie.get("width");
    },
    setWidthCookie: function (w) {
        window.cookie.set("width", Math.round(w));
    },
    resetWidth: function () {
        this.setWidth(this.initialWidth);
    },
    setWidth: function (w) {
        var fw = Math.max(Math.min(w, this.maxWidth), this.minWidth);
        $("main").css("max-width", fw);
        this.refreshZoom();
    },
    refreshZoom: function () {
        
        var $m = this.$zoom.children(".minus");
        var $p = this.$zoom.children(".plus");
        var $d = this.$zoom.children(".data");
        
        var w = $("main").width();
        
        if (w >= this.maxWidth) {
            $("body").addClass("full-width");
            $p.addClass("disabled");
            if (w > this.maxWidth + 1) {
                this.setWidth(this.maxWidth);
                return;
            }
        }
        else {
            $("body").removeClass("full-width");
            $p.removeClass("disabled");
        }
        
        if (w <= this.minWidth) {
            $m.addClass("disabled");
            if (w < this.minWidth - 1) {
                this.setWidth(this.minWidth);
                return;
            }
        }
        else $m.removeClass("disabled");
        
        // Hack!!!!!! This is BAD. Make sure I change this.
        $("#index-following-header").stickRefresh();
        
        this.setWidthCookie(w);
        
        $d.text(Math.round(w / this.initialWidth * 100));
    }
}
