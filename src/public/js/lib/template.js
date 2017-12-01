(function ($) {
    
    const BASIC_ATTR_LIST = [ "id", "src", "href", "alt", "value", "name" ];
    
    // Use cache to increase speed of rendering
    var cache = {};
    
    function getTemplate (name) {
        if (!cache[name]) {
            cache[name] = $($("template[name=" + name + "]").html());
        }
        return cache[name].clone();
    }
    
    function procAttr ($t, attr, data, callback) {
        var selector = "[" + attr + "]";
        $t.find(selector).addBack(selector).each(function () {
            callback($(this), eval($(this).attr(attr)));
            $(this).removeAttr(attr);
        });
    }
    
    function renderElem ($elem, name, data) {
        
        // First get template
        var $t = getTemplate(name);
        
        // Then process general attribution list
        for (var i = 0; i < BASIC_ATTR_LIST.length; i++) {
            procAttr($t, "data-" + BASIC_ATTR_LIST[i], data, ($e, v) => {
                $e.attr(BASIC_ATTR_LIST[i], v);
            });
        }
        
        // Then process special attribution list
        procAttr($t, "data-html", data, ($e, v) => $e.html(v));
        procAttr($t, "data-text", data, ($e, v) => $e.text(v));
        procAttr($t, "data-prepend", data, ($e, v) => $e.prepend(v));
        procAttr($t, "data-append", data, ($e, v) => $e.append(v));
        procAttr($t, "data-class", data, ($e, v) => $e.addClass(v));
        procAttr($t, "data-css", data, ($e, v) => $e.css(v));
        
        // Finally process recursive template call
        procAttr($t, "template-data", data, ($e, v) => {
            $e.render($e.attr("template-name"), v);
            $e.removeAttr("template-name");
        });
        
        // Append the data to elem
        $t.appendTo($elem);
    }
    
    function renderArray ($elem, name, arr) {
        for (var i = 0; i < arr.length; i++) {
            renderElem($elem, name, arr[i]);
        }
    }
    
    $.fn.render = function (name, data) {
        if (data instanceof Array)
            renderArray($(this), name, data);
        else
            renderElem($(this), name, data);
    }
})(jQuery);
