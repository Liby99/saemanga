var Sidebar = {
    $toggle: $("#sidebar-toggle"),
    $mask: $("#sidebar-mask"),
    $sidebar: $("#sidebar"),
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
        if (!$("body").hasClass("fixed"))
            $("body").addClass("fixed").attr("data-top", $("body").scrollTop()).css({"margin-top": - $("body").scrollTop(), "position": "fixed"});
    },
    unfixBody: function () {
        if ($("body").hasClass("fixed"))
            $("body").removeClass("fixed").css({"margin-top": 0, "position": "relative"}).animate({"scrollTop": $("body").attr("data-top")}, 0);
    }
}
