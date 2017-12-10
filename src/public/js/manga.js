var Page = {
    $holder: $("#manga-body-section"),
    initiate: function () {
        this.renderManga();
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
                    if (i == 1) {
                        self.refreshMangaInfo();
                    }
                    $img.remove();
                });
            }
        }
        loadImage(1);
    },
    refreshMangaInfo: function () {
        // var self = this;
        // if (window.cookie.get("change")) {
            this.alertInfoError();
        // }
        // else {
            $.kajax({
                url: "/ajax/manga?action=refresh_manga_info",
                type: "post",
                data: { id: manga.dmkId() },
                success: (hasChanged) => {
                    if (hasChanged) {
                        window.cookie.set("change", 1);
                    }
                    else {
                        self.alertInfoError();
                    }
                }
            });
        // }
    },
    alertInfoError: function () {
        alert("对不起，该漫画信息有误，请将问题汇报至管理员");
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
    }
};

$(function () {
    Sidebar.initiate();
    User.initiate();
    Page.initiate();
});
