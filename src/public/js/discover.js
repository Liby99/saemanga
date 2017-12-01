var Discover = {
    initiate: function () {
        
    },
    initiateTags: function () {
        $.ajax({
            url: "/ajax/genre?action=get",
            type: "get",
            success: function (result) {
                var data = JSON.parse(result);
                if (data["code"] == 0) {
                    
                }
            },
            error: function () {
                alert("抱歉，网络连接错误");
            }
        });
    }
}
