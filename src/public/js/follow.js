var Follow = {
    $header: $("#index-following-header"),
    $headerInner: $("#index-following-header-inner"),
    $manage: $("#index-following-manage"),
    initiate: function () {
        this.initiateHeader();
        this.initiateManage();
    },
    initiateHeader: function () {
        var self = this;
        this.$header.stickToTop();
        this.$header.on("stick", function () {
            self.$headerInner.addClass("stick");
        });
        this.$header.on("release", function () {
            self.$headerInner.removeClass("stick");
        });
    },
    initiateManage: function () {
        var self = this;
        $("#index-following-manage").click(function () {
            self.toggleManage();
        });
    },
    toggleManage: function () {
        if (this.isManaging())
            this.completeManage();
        else
            this.startManage();
    },
    isManaging: function () {
        return this.$manage.hasClass("active");
    },
    startManage: function () {
        this.$manage.addClass("active");
        this.$manage.children("span").text("完成");
        this.$manage.children("i").addClass("active");
    },
    completeManage: function () {
        this.$manage.removeClass("active");
        this.$manage.children("span").text("管理");
        this.$manage.children("i").removeClass("active");
    }
}
