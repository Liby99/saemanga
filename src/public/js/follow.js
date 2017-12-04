var Follow = {
    $manage: $("#index-following-manage"),
    initiate: function () {
        this.initiateManage();
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
