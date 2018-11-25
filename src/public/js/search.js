var Search = {
    $form: $("#index-search-form"),
    $input: $("#index-search"),
    $loading: $("#index-search-loading"),
    $clear: $("#index-search-clear"),
    $outer: $("#index-search-result-outer"),
    $result: $("#index-search-result"),
    initiate: function () {
        
        var self = this;
        
        this.$input.on("focus", function() {
            self.focus();
        });

        this.$input.on("blur", function() {
            self.blur();
        });
        
        this.$form.on("click", function() {
            $(this).children("input").focus();
        });
        
        
        
        asdaasdfasdfthis.$form.on("submit", function() {
            self.showLoading();
            var val = self.$input.val().trim();
            if (val && val.length > 0) {
                self.search(val);
            }
            else {
                self.hideLoading();
            }
            return false;
        });
    },
    clearResult: function () {
        this.$result.html("");
    },
    clear: function () {
        var self = this;
        this.hideResult(function () {
            self.clearResult();
            self.clearInput();
            self.hideClear();
            self.hideLoading();
        });
    },
    load: function (ids) {
        this.clearResult();
        this.renderResult(this.parseResult(ids));
        this.showResult();
        this.showClear();
        this.scrollToLeft();
    },
    parseResult: function (ids) {
        var self = this;
        return ids.map((obj) => {
            obj.info = { title: obj.title };
            var manga = new Manga(obj);
            return {
                href: manga.getSaemangaUrl(),
                title: manga.title(),
                css: {
                    "background-image": "url('" + manga.getCoverUrl() + "')"
                }
            };
        });
    },
    renderResult: function (data) {
        this.$result.render("search-manga", data);
    },
    showLoading: function (cb) {
        this.$loading.fadeIn("fast", cb);
    },
    hideLoading: function (cb) {
        this.$loading.fadeOut("fast", cb);
    },
    showClear: function (cb) {
        this.$clear.fadeIn(200, cb);
    },
    hideClear: function (cb) {
        this.$clear.fadeOut(200, cb);
    },
    showResult: function (cb) {
        this.$outer.slideDown(200, cb);
    },
    hideResult: function (cb) {
        this.$outer.slideUp(200, cb);
    },
    scrollToLeft: function () {
        this.$outer.animate({ scrollLeft: 0 }, 500);
    },
    focus: function () {
        this.$form.addClass("focus");
    },
    blur: function () {
        if (this.$input.val().trim() == "") {
            this.$form.removeClass("focus");
            this.hideResult();
            this.hideClear();
        }
    },
    clearInput: function () {
        this.$input.val("");
    },
    search: function (val) {
        var self = this;
        $.kajax({
            url: "/ajax/manga?action=search",
            type: "POST",
            data: { "query": val },
            success: function (ids) {
                if (ids.length) {
                    self.load(ids);
                }
                else {
                    alert("抱歉，您请求的漫画未能找到。");
                    self.hideResult();
                }
                self.hideLoading();
            },
            error: function (err) {
                alert(err);
                self.hideResult();
                self.hideLoading();
            }
        })
    }
};
