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
    
    function resize($holder) {
        if ($holder.hasClass("stick")) {
            var $c = $holder.children(".content");
            $c.css({ width: $holder.width() });
        }
    }
    
    $.fn.stickToTop = function () {
        
        // First cache the holder
        var $holder = $(this);
        
        // Set the height of the holder
        initiate($holder);
        refresh($holder);
        
        // Set the holder resize listener
        // $holder.resize(function () {
        //     resize($holder);
        // });
        
        // Push the holder to the cache
        cache.push($holder);
    }
    
    $.fn.stickRefresh = function () {
        resize($(this));
    }
    
    $(window).scroll(function () {
        for (var i = 0; i < cache.length; i++) {
            refresh(cache[i]);
        }
    });
    
    $(window).resize(function () {
        for (var i = 0; i < cache.length; i++) {
            resize(cache[i]);
        }
    });
})(jQuery);
