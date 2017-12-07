(function ($) {
    
    $(".panel").each(function () {
        
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
    
    $.panel = {
        show: function (name) {
            $(".panel[name=" + name + "]").fadeIn(200).addClass("active");
        },
        hide: function (name) {
            $(".panel[name=" + name + "]").fadeOut(200).removeClass("active");
        }
    }
})(jQuery);
