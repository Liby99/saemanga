(function ($) {
    
    $(".panel").each(function () {
        
        var name = $(this).attr("name");
        
        $(this).find(".panel-mask").css({
            "z-index": $(this).attr("data-index")
        });
        
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
    
    $.panel = {
        show: function (name) {
            $(".panel[name=" + name + "]").children(".panel-mask").fadeIn(200).addClass("active");
        },
        hide: function (name) {
            $(".panel[name=" + name + "]").children(".panel-mask").fadeOut(200).removeClass("active");
        }
    }
})(jQuery);
