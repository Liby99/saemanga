var Page = {
    $holder: $("#manga-body-section"),
    errorAttempt: 0,
    initiate: function () {
        this.renderManga();
    },
    renderManga: function () {
        const self = this;
        const pageCount = manga.getPageCount(episode);
        const data = Array.apply(null, Array(pageCount)).map(function (_, i) {
            const index = i + 1;
            return {
                id: 'manga-image-' + index,
                src: manga.getImageUrl(episode, index),
                loaded: false,
            };
        });
        self.$holder.render('manga-image', data);
        $(".manga-image").on('load', function () {
            const pageIndex = parseInt($(this).attr("id").split('-')[2], 10);
            data[pageIndex].loaded = true;
            for (var i = 0; i < data.length; i++) {
                if (!data[i].loaded) break;
                $("#manga-image-" + i).removeAttr("hidden");
            }
        });
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
    },
    requestUpdate: function () {
        $.kajax({
            url: "/ajax/manga?action=request_update&dmk_id=" + manga.dmkId(),
            type: "get",
            success: function (updated) {
                if (updated) {
                    window.location.reload();
                } else {
                    alert("No database entry update");
                }
            }
        });
    }
};

$(function () {
    Sidebar.initiate();
    User.initiate();
    Page.initiate();
});
