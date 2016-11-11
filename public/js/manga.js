var Manga = {
    params: {},
    info: {},
    initiate: function () {
        var self = this;
        this.loadParams();
        this.getInfo(function (info) {
            self.info = info;
            self.loadInfo(info.name);
            self.loadEpisode(self.params.epi);
            self.loadMangaContent(info, self.params.epi);
            self.loadMenuEpisode(info.latest_episode);
            self.loadNavigation(info.latest_episode);
        });
    },
    loadParams: function () {
        this.params = Utility.getQueryParams();
        this.params.epi = parseInt(this.params.epi);
    },
    unfollow: function () {
        $.ajax({
            url: "/ajax/manga?action=unfollow_manga",
            type: "post",
            data: { id: this.params.id },
            success: function (result) {
                var data = JSON.parse(result);
                if (data.error_code == 0) {
                    window.location.href = "/index.html";
                }
                else {
                    alert("取消关注失败");
                }
            },
            error: function () {
                alert("服务器连接错误");
            }
        });
    },
    getInfo: function (callback) {
        $.ajax({
            url: "/ajax/manga?action=get_manga_info",
            type: "post",
            data: { id: this.params.id },
            success: function (result) {
                var data = JSON.parse(result);
                if (data.error_code == 0) {
                    callback(data.content);
                }
                else {
                    alert(data.error_log);
                }
            },
            error: function () {
                alert("服务器连接错误");
            }
        });
    },
    loadInfo: function (name) {
        $("title").html(name + " - Manga");
        $("#manga_title .name").text(name);
    },
    loadEpisode: function (episode) {
        $("#manga_episode .episode").text(episode);
    },
    loadMangaContent: function (info, episode) {
        var src = "http://web" + info.dmk_id_web + ".cartoonmad.com/" + info.dmk_id_gen + "/" + info.dmk_id + "/" + Utility.pad(episode) + "/";
        this.loadImage(src, 0, function (result) {
            if (result == 0) {
                alert("这一话还未更新！");
            }
            else if (result == 1) {
                //setHistory(index, episode);
            }
        });
    },
    loadImage: function (src, index, callback) {
        var self = this;
        index++;
        $("#manga_holder_section").append("<img id=\"img_" + index + "\" src=\"" + src + Utility.pad(index) + ".jpg\" />");
        $("#img_" + index).load(function () {
            self.loadImage(src, index, callback);
        });
        $("#img_" + index).error(function () {
            $(this).remove();
            if (index == 1) {
                callback(0);
            }
            else {
                callback(1);
            }
            return false;
        });
    },
    loadMenuEpisode: function (latestEpisode) {
        var html = "";
        for (var i = 1; i <= latestEpisode; i++) {
            html += this.generateMenuEpisode(this.info.dmk_id, i, i == this.params.epi);
        }
        $("#menu_episode_list").html(html);
    },
    generateMenuEpisode: function (id, episode, active) {
        return "<li" + (active ? " class=\"active\"" : "") + ">"
                 + "<a href=\"manga.html?id=" + id + "&epi=" + episode + "\">" + episode + "</a>"
             + "</li>";
    },
    loadNavigation: function (latestEpisode) {
        if (this.hasNext()) {
            $("#next_episode_button").html("第" + this.next() + "话<i class=\"fa fa-angle-right\"></i>");
            $("#next_episode_button").click(function () {
                Manga.nextEpisode();
            });
        }
        else {
            $("#next_episode_button").text("最后一话了哦").addClass("disabled");
            $("#menu_next_episode").attr("hidden", "hidden");
        }
        
        if (this.hasPrev()) {
            $("#prev_episode_button").html("<i class=\"fa fa-angle-left\"></i>第" + this.prev() + "话");
            $("#prev_episode_button").click(function () {
                Manga.prevEpisode();
            });
        }
        else {
            $("#prev_episode_button").text("最前一话了哦").addClass("disabled");
            $("#menu_prev_episode").attr("hidden", "hidden");
        }
    },
    hasNext: function () {
        return this.next() <= this.info.latest_episode;
    },
    hasPrev: function () {
        return this.prev() >= 1;
    },
    next: function () {
        return this.params.epi + 1;
    },
    prev: function () {
        return this.params.epi - 1;
    },
    nextEpisode: function () {
        var episode = this.next();
        if (episode <= this.info.latest_episode) {
            this.goToEpisode(episode);
        }
    },
    prevEpisode: function () {
        var episode = this.prev();
        if (episode >= 1) {
            this.goToEpisode(episode);
        }
    },
    goToEpisode: function (episode) {
        window.location.href = "/manga.html?id=" + this.info.dmk_id + "&epi=" + episode;
    },
    randomEpisode: function () {
        var episodeList = $("#menu_episode_list li");
        episodeList.eq(episodeList.length()).click();
    }
}
