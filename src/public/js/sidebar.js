var Sidebar = {
    $toggle: $("#sidebar-toggle"),
    $mask: $("#sidebar-mask"),
    $sidebar: $("#sidebar"),
    scrollElem: "body",
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
        this.$toggle.children("i").addClass("active");
        this.$sidebar.addClass("active");
        this.$mask.fadeIn(200);
        this.fixBody();
    },
    hide: function () {
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
    }
}
