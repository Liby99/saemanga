function clone(obj) {
    if (obj instanceof Array) {
        var ret = [];
        for (var i in obj)
            ret[i] = clone(obj[i]);
        return ret;
    }
    else if (obj instanceof Object) {
        var ret = {};
        for (var i in obj)
            ret[toCamel(i)] = clone(obj[i]);
        return ret;
    }
    else {
        return obj;
    }
}
