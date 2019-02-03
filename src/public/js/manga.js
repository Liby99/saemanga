var Page = {
    $holder: $("#manga-body-section"),
    errorAttempt: 0,
    initiate: function () {
        this.renderManga();
        this.fetchLike();
    },
    renderManga: function () {
        var self = this;
        function loadImage(i) {
            
            // First generate the url and id and append the image
            var url = manga.getImageUrl(episode, i);
            var id = "manga-image-" + i;
            self.$holder.render("manga-image", { id: id, src: url });
            var $img = $("#" + id);
            
            // Then check if the images has already loaded
            if ($img.prop("complete")) {
                loadImage(i + 1);
            }
            else {
                $img.on("load", function () {
                    loadImage(i + 1);
                });
                $img.on("error", function () {
                    $img.remove();
                    if (i == 1) {
                        self.refreshMangaInfo();
                    }
                });
            }
        }
        loadImage(1);
    },
    refreshMangaInfo: function () {
        var self = this;
        if (this.errorAttempt) {
            this.alertInfoError();
        }
        else {
            this.errorAttempt++;
            $.kajax({
                url: "/ajax/manga?action=refresh_manga_info",
                type: "post",
                data: { id: manga.dmkId() },
                success: (result) => {
                    if (result.updated) {
                        var newManga = new Manga(result.manga);
                        manga.data = newManga.data;
                        self.initiate();
                    }
                    else {
                        self.alertInfoError();
                    }
                }
            });
        }
    },
    alertInfoError: function () {
        alert("对不起，该漫画信息有误，请将问题汇报至管理员");
        window.location.href = "index.html";
    },
    unfollow: function () {
        if (confirm("您确定要取消关注 " + manga.title() + " 吗？")) {
            $.kajax({
                url: "/ajax/manga?action=unfollow",
                type: "post",
                data: { id: manga.id() },
                success: function () {
                    window.location.href = "index.html";
                }
            });
        }
    },
    fetchLike: function () {
        $.kajax({
            url: "/ajax/manga?action=get_liked&id=" + manga.id(),
            type: "get",
            success: function (result) {
                let $like = $("#like"), $unlike = $("#unlike");
                if (result) {
                    $like.attr("hidden", "hidden");
                    $unlike.removeAttr("hidden");
                } else {
                    $like.removeAttr("hidden");
                    $unlike.attr("hidden", "hidden");
                }
            }
        });
    },
    like: function () {
        $.kajax({
            url: "/ajax/manga?action=like",
            type: "post",
            data: { id: manga.id() },
            success: function () {
                let $like = $("#like"), $unlike = $("#unlike");
                $like.attr("hidden", "hidden");
                $unlike.removeAttr("hidden");
            }
        });
    },
    unlike: function () {
        $.kajax({
            url: "/ajax/manga?action=unlike",
            type: "post",
            data: { id: manga.id() },
            success: function () {
                let $like = $("#like"), $unlike = $("#unlike");
                $like.removeAttr("hidden");
                $unlike.attr("hidden", "hidden");
            }
        });
    }
};

$(function () {
    Sidebar.initiate();
    User.initiate();
    Page.initiate();
});
