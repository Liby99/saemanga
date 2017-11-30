const Hot = require("../api/hot");

module.exports = {
    schedule: "*/1 * * * *",
    task: function () {
        Hot.refresh(function (ids) {
            
        });
    }
};
