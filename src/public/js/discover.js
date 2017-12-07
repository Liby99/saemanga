var Discover = {
    $holder: $("#index-discover-tags-holder"),
    $toggle: $("#index-discover-tags-toggle"),
    $tags: $("#index-discover-tags"),
    $outer: $("#index-discover-outer"),
    $mangas: $("#index-discover-content"),
    initiate: function () {
        this.initiateToggle();
        this.initiateTags();
    },
    initiateToggle: function () {
        var self = this;
        this.$toggle.click(function () {
            self.toggleTags();
        });
    },
    loadLatest: function () {
        var self = this;
        $.kajax({
            url: "/ajax/hot?action=get_latest",
            type: "get",
            success: function (mangas) {
                self.refresh(mangas);
            }
        });
    },
    loadGenre: function (genreDir) {
        var self = this;
        $.kajax({
            url: "/ajax/hot?action=get_genre&genre_dir=" + genreDir,
            type: "get",
            success: function (mangas) {
                self.refresh(mangas);
            }
        });
    },
    initiateTags: function (gs) {
        var self = this;
        this.$tags.children(".tag").click(function () {
            var $this = $(this);
            if ($this.hasClass("active")) {
                $this.removeClass("active");
                self.loadLatest();
                if (!self.tagsShown()) {
                    self.hideTags();
                }
            }
            else {
                $this.addClass("active").siblings().removeClass("active");
                self.loadGenre($this.attr("id"));
            }
        });
    },
    tagsShown: function () {
        return this.$holder.hasClass("active");
    },
    showTags: function () {
        this.clearTagHolderCss();
        this.$toggle.addClass("active");
        this.$holder.addClass("active");
        this.tagScrollToRight();
    },
    hideTags: function () {
        var self = this;
        this.$toggle.removeClass("active");
        this.$holder.removeClass("active");
        var $active = this.$tags.children(".tag.active");
        if ($active.length) {
            var offset = $active.offset().left - $active.parent().offset().left;
            var scrollLeft = -(this.$tags.width() - $active.outerWidth() - offset);
            this.$holder.css({
                width: $active.outerWidth(),
                marginRight: 10
            }).animate({
                scrollLeft: scrollLeft
            }, 400, function () {
                $(this).css({ "overflow": "hidden" });
            });
        }
        else {
            this.clearTagHolderCss();
        }
    },
    clearTagHolderCss: function () {
        this.$holder.css({
            width: "",
            marginRight: "",
            overflow: ""
        });
    },
    tagScrollToRight: function () {
        this.$holder.animate({
            scrollLeft: this.$tags.width()
        });
    },
    toggleTags: function () {
        if (this.tagsShown()) {
            this.hideTags();
        }
        else {
            this.showTags();
        }
    },
    refresh: function (mangas) {
        var self = this;
        this.hideHot(function () {
            self.clearManga();
            self.renderManga(mangas);
            self.showHot(function () {
                self.scrollToLeft();
            });
        });
    },
    clearManga: function () {
        this.$mangas.html("");
    },
    renderManga: function (mangas) {
        this.$mangas.render("discover-manga", mangas.map((m) => {
            var manga = new Manga(m);
            return {
                id: manga.id(),
                href: manga.getSaemangaUrl(),
                title: manga.title(),
                css: {
                    "background-image": "url('" + manga.getCoverUrl() + "')"
                }
            }
        }));
    },
    hideHot: function (cb) {
        this.$outer.animate({ "opacity": 0 }, 150, cb);
    },
    showHot: function (cb) {
        this.$outer.animate({ "opacity": 1 }, 150, cb);
    },
    scrollToLeft: function () {
        this.$outer.animate({ scrollLeft: 0 }, 500);
    }
}
