module.exports = {
    all (arr, func, cb, error) {
        var c = 0, t = () => { if (++c == arr.length) cb() }
        for (var i = 0; i < arr.length; i++) func(arr[i], i, t, error);
    }
}
