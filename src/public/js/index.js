$(document).ready(function () {
    Sidebar.initiate();
    Search.initiate();
    Genre.initiate(function () {
        Discover.initiate();
        Follow.initiate();
    });
});

// $(".scroll-x").each(function() {
//     var $holder = $(this).children();
//     var $elems = $holder.children();
//     var width = 0;
//     $elems.each(function() {
//         width += $(this).outerWidth(true);
//     });
//     $holder.width(width);
// });
