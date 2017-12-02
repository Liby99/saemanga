function ajax(obj) {
    
    function error(err) {
        if (obj.error) {
            obj.error(err);
        }
        else {
            throw err;
        }
    }
    
    $.ajax({
        url: obj.url,
        type: obj.type,
        data: obj.data,
        success: function (result) {
            try {
                var data = JSON.parse(result);
                if (data && data["code"] == 0) {
                    obj.success(data["content"]);
                }
                else {
                    error(new Error(data["code"] + ": " + data["msg"]));
                }
            }
            catch (err) {
                error(err);
            }
        },
        error: function () {
            error(new Error("Internet Connection Error"));
        }
    });
}
