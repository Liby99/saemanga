var Genre = {
    _cache: undefined,
    initiate: function (callback) {
        var self = this;
        ajax({
            url: "/ajax/genre?action=get",
            type: "get",
            success: function (genres) {
                self._cache = genres;
                callback();
            }
        });
    },
    get: function () {
        return this._cache;
    }
};
