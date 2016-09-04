var Search = {
    initiate: function () {
        var self = this;

        $("#index_manga_search_outer").click(function () {
            $("#search").focus();
            self.focus();
        });

        $("#search").on("keydown", function (event) {
            var RETURN = 13, SHIFT = 16, CTRL = 17, ALT = 18, ESC = 27,
                LCMD = 91, RCMD = 93, CMD = 224, CAPS = 224;
            switch (event.keyCode) {
                case RETURN:
                    if (!Search.isEmpty()) {
                        Search.search();
                    }
                    break;
                case ESC:
                    Search.clear();
                    break;
                case SHIFT:
                case CTRL:
                case ALT:
                case LCMD:
                case RCMD:
                case CMD:
                case CAPS:
                    break;
                default:
                    if (Search.isEmpty()) {
                        Search.clear();
                    }
                    break;
            }
        }).on("focus", function () {
            self.focus();
        }).on("blur", function () {
            self.blur();
        });
    },
    search: function () {
        if (!this.isEmpty()) {
            $.ajax({
                url: "/ajax/handler?action=search",
                type: "post",
                data: { search: this.get() },
                success: function (result) {
                    var data = JSON.parse(result);
                    if (data.error_code == 0) {
                        var html = "";
                        for (var i = 0; i < data.content.length; i++) {
                            html += Manga.generateSearchManga(data.content[i]);
                        }
                        $("#index_manga_search_result").html(html);
                        $("#index_manga_search_result_outer").removeClass("collapsed");
                        Manga.loadClick();
                    }
                    else {
                        alert(data.error_log);
                    }
                },
                error: function () {
                    alert("服务器连接出错，请稍后再试");
                }
            });
        }
        else {
            alert("请输入搜索内容");
        }
    },
    set: function (value) {
        $("#search").val(value);
    },
    get: function () {
        return $("#search").val();
    },
    isEmpty: function () {
        return this.get() == "";
    },
    clear: function () {
        this.set("");
        $("#index_manga_search_result_outer").addClass("collapsed");
    },
    focus: function () {
        $("#index_manga_search_outer").addClass("focus");
    },
    blur: function () {
        $("#index_manga_search_outer").removeClass("focus");
    }
}

var Manga = {
    initiate: function () {
        $("#manage_following_manga").click(function () {
            Manga.manage();
        });
    },
    loadClick: function () {
        $(".index_manga").off("click");
        $(".index_manga").click(function () {
            var list = $(this).attr("id").split("_");
            var id = list[list.length - 1];
            window.location.href = "/manga.html?id=" + id;
        });
    },
    random: function () {
        $.ajax({
            url: "/ajax/manga?action=get_random_manga",
            type: "get",
            success: function (result) {
                
            }
        })
    },
    getHotManga: function () {
        $.ajax({
            url: "/ajax/manga?action=get_hot_manga",
            type: "get",
            success: function (result) {
                var data = JSON.parse(result);
                if (data.error_code == 0) {
                    var html = "";
                    for (var i = 0; i < data.content.length; i++) {
                        html += Manga.generateHotManga(data.content[i]);
                    }
                    $("#index_hot_manga_list").html(html);
                    Manga.loadClick();
                }
            }
        });
    },
    getFollowingManga: function () {
        $.ajax({
            url: "/ajax/manga?action=get_following_manga",
            type: "get",
            success: function (result) {
                var data = JSON.parse(result);
                if (data.error_code == 0) {
                    var mangas = data.content;
                    if (mangas.length == 0) {
                        $("#index_following_manga_list").html("<div class=\"no_following\">您还没有正在追的漫画</div>");
                        Manga.hideManage();
                    }
                    else {
                        var html = "";
                        for (var i = 0; i < mangas.length; i++) {
                            html += Manga.generateFollowingManga(mangas[i]);
                        }
                        $("#index_following_manga_list").html(html);
                        Manga.loadClick();
                    }
                }
                else {
                    alert(data.error_log);
                }
            }
        });
    },
    manage: function () {

        $("#manage_following_manga").text("完成").off("click").click(function () {
            Manga.finishManage();
        });

        $("#index_following_manga_list .index_manga").each(function () {
            var cover = $(this).children(".index_manga_cover");
            setTimeout(function () {
                cover.addClass("shake-little");
            }, Math.random() * 300);
            cover.append("<div class=\"unfollow\"><i class=\"fa fa-times\"></i></div>");
            cover.children(".unfollow").click(function (event) {
                event.stopPropagation();
                var name = $(this).parent().siblings(".index_manga_info").children(".index_manga_title").text();
                var id = $(this).parent().parent().attr("data-id");
                if (confirm("您确定要放弃追 " + name + " 吗？")) {
                    Manga.unfollow(id);
                }
            });
        });
    },
    finishManage: function () {
        $("#manage_following_manga").text("管理").off("click").click(function () {
            Manga.manage();
        });

        $("#index_following_manga_list .index_manga .index_manga_cover").removeClass("shake-little");
        $("#index_following_manga_list .index_manga .unfollow").remove();
    },
    hideManage: function () {
        $("#manage_following_manga").attr("hidden", "hidden");
    },
    unfollow: function (id) {
        $.ajax({
            url: "/ajax/manga?action=unfollow_manga",
            type: "post",
            data: { id: id },
            success: function (result) {
                var data = JSON.parse(result);
                if (data.error_code == 0) {
                    $("#following_manga_" + id).fadeOut();
                }
                else {
                    alert(data.error_log);
                }
            },
            error: function () {
                alert("服务器连接错误");
            }
        })
    },
    generateCoverImage: function (id) {
        return "http://img.cartoonmad.com/ctimg/" + id + ".jpg";
    },
    generateSearchManga: function (manga) {
        return "<div class=\"index_manga\" id=\"search_manga_" + manga.id + "\" data-id=\"" + manga.dmk_id + "\">"
                 + "<div class=\"index_manga_cover\" style=\"background-image: url(" + this.generateCoverImage(manga.id) + ")\"></div>"
                 + "<div class=\"index_manga_info\">"
                     + "<div class=\"index_manga_title\">" + manga.name + "</div>"
                 + "</div>"
             + "</div>";
    },
    generateHotManga: function (manga) {
        return "<div class=\"index_manga\" id=\"hot_manga_" + manga.dmk_id + "\" data-id=\"" + manga.dmk_id + "\">"
                 + "<div class=\"index_manga_cover\" style=\"background-image: url(" + this.generateCoverImage(manga.dmk_id) + ")\"></div>"
                 + "<div class=\"index_manga_info\">"
                     + "<div class=\"index_manga_title\">" + manga.name + "</div>"
                 + "</div>"
             + "</div>";
    },
    generateFollowingManga: function (manga) {
        return "<div class=\"index_manga\" id=\"following_manga_" + manga.dmk_id + "\" data-id=\"" + manga.dmk_id + "\">"
                 + "<div class=\"index_manga_cover shake-constant\" style=\"background-image: url(" + this.generateCoverImage(manga.dmk_id) + ")\">"
                     + ((manga.up_to_date == 1 && manga.current_episode < manga.latest_episode) ? "<div class=\"has_update\"></div>" : "")
                 + "</div>"
                 + "<div class=\"index_manga_info\">"
                     + "<div class=\"index_manga_episode\">"
                         + "<span>已读</span>"
                         + "<span class=\"current\">" + manga.current_episode + "</span>"
                         + "<span>话"
                         + ((manga.ended == 1)
                            ? "，共" + manga.latest_episode + "话，已完结</span>"
                            : (manga.current_episode < manga.latest_episode)
                              ? ("，更新至</span><span class=\"latest\">" + manga.latest_episode + "</span><span>话</span>")
                              : ("，未更新</span>"))
                     + "</div>"
                     + "<div class=\"index_manga_title\">" + manga.name + "</div>"
                 + "</div>"
             + "</div>";
    }
}
