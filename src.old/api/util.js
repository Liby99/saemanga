function s4() {
    var charList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];
    var str = "";
    for (var i = 0; i < 4; i++) {
        str += charList[Math.floor(Math.random() * charList.length)];
    }
    return str;
}

module.exports.generateUUID = function () {
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}
