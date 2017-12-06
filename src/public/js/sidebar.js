var Sidebar = {
    $toggle: $("#sidebar-toggle"),
    $mask: $("#sidebar-mask"),
    $sidebar: $("#sidebar"),
    initiate: function () {
        
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
        this.$toggle.children("i").addClass("active");
        this.$sidebar.addClass("active");
        this.$mask.fadeIn(200);
    },
    hide: function () {
        this.$toggle.children("i").removeClass("active");
        this.$sidebar.removeClass("active");
        this.$mask.fadeOut(200);
    }
}
