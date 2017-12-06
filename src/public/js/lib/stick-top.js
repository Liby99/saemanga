(function ($) {
    
    var cache = [];
    
    function initiate($holder) {
        var $c = $holder.children(".content");
        var $p = $holder.children(".placeholder");
        $p.height($c.outerHeight());
    }
    
    function refresh($holder) {
        if ($holder.offset().top < $(window).scrollTop())
            stick($holder);
        else
            release($holder);
    }
    
    function release($holder) {
        var $ph = $holder.children(".placeholder");
        var $c = $holder.children(".content");
        $ph.css({ display: "none" });
        $c.css({ position: "", top: "", width: "" });
        if ($holder.hasClass("stick")) {
            $holder.removeClass("stick").trigger("release");
        }
    }
    
    function stick($holder) {
        var $ph = $holder.children(".placeholder");
        var $c = $holder.children(".content");
        $ph.css({ display: "block" });
        $c.css({ position: "fixed", top: 0, width: $holder.width() });
        if (!$holder.hasClass("stick")) {
            $holder.addClass("stick").trigger("stick");
        }
    }
    
    $.fn.stickToTop = function () {
        
        // First cache the holder
        var $holder = $(this);
        
        // Set the height of the holder
        initiate($holder);
        refresh($holder);
        
        // Push the holder to the cache
        cache.push($holder);
    }
    
    $(window).scroll(function () {
        for (var i = 0; i < cache.length; i++) {
            refresh(cache[i]);
        }
    });
})(jQuery);
