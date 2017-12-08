var Follow = {
    $header: $("#index-following-header"),
    $headerInner: $("#index-following-header-inner"),
    $manage: $("#index-following-manage"),
    $mangas: $("#index-following-list"),
    initiate: function () {
        this.initiateHeader();
        this.initiateManage();
        this.initiateFollows();
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
        $(".following.manga").addClass("managing");
    },
    completeManage: function () {
        this.$manage.removeClass("active");
        this.$manage.children("span").text("管理");
        this.$manage.children("i").removeClass("active");
        $(".following.manga").removeClass("managing");
    },
    initiateFollows: function () {
        
        var self = this;
        
        this.mixer = mixitup(this.$mangas.attr("id"));
        
        $(".following.manga .cover .remove").click(function (e) {
            var $manga = $(this).parent().parent();
            var id = $manga.attr("id");
            var title = $manga.children("center").children(".title").text();
            if (confirm("您确定要取消关注 " + title + " 吗？")) {
                $.kajax({
                    url: "/ajax/manga?action=unfollow",
                    type: "post",
                    data: { id: id },
                    success: function () {
                        self.mixer.remove($manga[0]).then(function () {
                            self.checkEmptyFollow();
                        });
                    }
                });
            }
            e.preventDefault();
        });
        
        $(".following.manga .cover").each(function () {
            $(this).css({
                "animation-delay": -Math.random() + "s"
            });
        });
    },
    checkEmptyFollow: function () {
        if (this.$mangas.children().length === 0) {
            this.completeManage();
            this.$mangas.hide(0);
            this.$mangas.render("not-following-manga");
            this.$mangas.slideDown(300);
        }
    }
}
