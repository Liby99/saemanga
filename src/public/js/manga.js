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
        $.kajax({
            url: "/ajax/manga?action=refresh_manga_info",
            type: "post",
            data: { id: manga.dmkId() },
            success: (hasChanged) => {
                if (hasChanged) {
                    
                }
                else {
                    
                }
            }
        });
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
    User.initiate();
    Page.initiate();
});
