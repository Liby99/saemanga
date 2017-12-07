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
        $(".following.manga").each(function () {
            $(this).addClass("managing")
            $(this).children(".cover").css({
                "animation-delay": -Math.random() + "s"
            });
        });
    },
    completeManage: function () {
        this.$manage.removeClass("active");
        this.$manage.children("span").text("管理");
        this.$manage.children("i").removeClass("active");
        $(".following.manga").each(function () {
            $(this).removeClass("managing");
        });
    },
    initiateFollows: function () {
        if (User.hasLoggedIn()) {
            var self = this;
            $.kajax({
                url: "/ajax/manga?action=get_following_manga",
                type: "get",
                success: function (follows) {
                    self.renderFollows(follows);
                }
            });
        }
    },
    renderFollows: function (follows) {
        var self = this;
        
        this.$mangas.render("following-manga", follows.map((f) => {
            var m = new Manga(f.manga);
            var read = "已读" + f["max_episode"] + "话，";
            if (m.ended()) {
                var total = "共" + m.lastEpisode() + "话，已完结";
            }
            else if (f["max_episode"] < m.lastEpisode()) {
                var total = "更新至" + m.lastEpisode() + "话";
            }
            else {
                var total = "未更新";
            }
            return {
                id: m.id(),
                href: m.getSaemangaUrl(),
                css: {
                    "background-image": "url('" + m.getCoverUrl() + "')"
                },
                epi: read + total,
                title: m.title(),
                hasUpdate: f["max_episode"] < m.lastEpisode()
            };
        }));
        
        $(".manga .cover .remove").click(function (e) {
            var $manga = $(this).parent().parent();
            var id = $manga.attr("id");
            var title = $manga.children("center").children(".title").text();
            if (confirm("您确定要取消关注 " + title + " 吗？")) {
                $.kajax({
                    url: "/ajax/manga?action=unfollow",
                    type: "post",
                    data: {
                        id: id
                    },
                    success: function () {
                        $manga.fadeOut(500, function () {
                            $(this).remove();
                        });
                    }
                })
            }
            e.preventDefault();
        });
        
        $(".following.manga .cover").each(function () {
            $(this).css({
                "animation-delay": -Math.random() + "s"
            });
        });
    }
}
