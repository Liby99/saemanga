(function ($) {
    
    var cache = [];
    
    $(".panel").each(function () {
        
        cache.push($(this));
        var name = $(this).attr("name");
        
        // First close button
        $(this).find(".panel-head a").click(function () {
            $.panel.hide(name);
        });
        
        // Prevent default popping up in panel-outer
        $(this).find(".panel-outer").click(function (e) {
            e.stopPropagation();
        });
        
        // Then mask
        $(this).find(".panel-mask").click(function () {
            $.panel.hide(name);
        });
    });
    
    function showPanel($panel) {
        $panel.children(".panel-mask").fadeIn(300).addClass("active");
    }
    
    function hidePanel($panel) {
        $panel.children(".panel-mask").fadeOut(300).removeClass("active");
    }
    
    function hideAll() {
        for (var i = 0; i < cache.length; i++) {
            hidePanel(cache[i]);
        }
    }
    
    $.panel = {
        show: function (name) {
            hideAll();
            showPanel($(".panel[name=" + name + "]"));
        },
        hide: function (name) {
            hidePanel($(".panel[name=" + name + "]"));
        }
    }
})(jQuery);
