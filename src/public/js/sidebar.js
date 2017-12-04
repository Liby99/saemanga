var Sidebar = {
    $toggle: $("#sidebar-toggle"),
    $mask: $("#sidebar-mask"),
    $sidebar: $("#sidebar"),
    initiate: function () {
        this.initiateToggle();
    },
    initiateToggle: function () {
        var self = this;
        this.$toggle.click(function () {
            self.toggleSidebar();
        });
    },
    toggleSidebar: function () {
        if (this.isShowingSidebar())
            this.hideSidebar();
        else
            this.showSidebar();
    },
    isShowingSidebar: function () {
        return this.$sidebar.hasClass("active");
    },
    showSidebar: function () {
        this.$toggle.children("i").addClass("active");
        this.$sidebar.addClass("active");
        this.$mask.fadeIn(300);
    },
    hideSidebar: function () {
        this.$toggle.children("i").removeClass("active");
        this.$sidebar.removeClass("active");
        this.$mask.fadeOut(300);
    }
}
