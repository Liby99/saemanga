function ajax(obj) {
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
                    throw new Error("Err " + data["code"] + ": " + data["msg"]);
                }
            }
            catch (err) {
                obj.error(err);
            }
        },
        error: function () {
            obj.error(new Error("Internet Connection Error"));
        }
    });
}
