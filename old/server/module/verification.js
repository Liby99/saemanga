module.exports = {
    username: function (str) {
        return str.match(/\S{4,12}/) != null;
    },
    password: function (str) {
        return str.match(/\S{8,20}/) != null;
    },
    UUID: function (str) {
        return str.match(/[\d\w]{8}(-[\d\w]{4}){3}-[\d\w]{12}/) != null;
    },
    email: function (str) {
        return str.match(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/) != null;
    }
}
