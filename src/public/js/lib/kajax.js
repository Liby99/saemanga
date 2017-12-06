(function ($) {
    
    $.kajax = function (obj) {
        
        function error(err) {
            if (obj.error)
                obj.error(err);
            else
                if (err)
                    throw err;
        }
        
        $.ajax({
            url: obj.url,
            type: obj.type,
            data: obj.data,
            success: function (result) {
                try {
                    var data = JSON.parse(result);
                }
                catch (err) {
                    error(err);
                }
                if (data && data["code"] == 0) {
                    obj.success(data["content"]);
                }
                else {
                    error(new Error(data["msg"]));
                }
            },
            error: function () {
                error(new Error("Internet Connection Error"));
            }
        });
    }
})(jQuery);
