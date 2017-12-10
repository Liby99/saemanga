(function() {
    var cache;
    
    function refreshCache () {
        cache = document.cookie.split('; ').reduce((p, c) => {
            var e = c.split("=");
            p[e[0]] = decodeURIComponent(e[1]);
            return p;
        }, {});
    }
    
    window.cookie = {
        get: (k) => {
            
            // If no cache, then get from document
            if (!cache) {
                refreshCache();
            }
            
            // Return the value using key in cache
            return cache[k];
        },
        set: (k, v, d, p) => {
            document.cookie = k + "=" + v +
            (d ? ("; expires=" + new Date(Date.now() + d).toUTCString()) : "") +
            (p ? ("; path=" + p) : "");
            refreshCache();
        }
    };
})();
