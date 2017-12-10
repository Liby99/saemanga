(function ($) {
    
    $.fn.selectValue = function (val) {
        if (val) {
            $(this).children("[value='" + val + "']").trigger("click");
        }
        else {
            return $(this).children(".active").attr("value");
        }
    }
    
    $(".select a").on("click", function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parent().trigger("change");
    });
})(jQuery);
