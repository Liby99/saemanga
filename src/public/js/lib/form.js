(function ($) {
    $.fn.formData = function () {
        return $(this).serialize().split("&").reduce((prev, curr) => {
            var p = curr.split("=");
            prev[p[0]] = decodeURIComponent(p[1]);
            return prev;
        }, {});
    }
})(jQuery);
