$(document).ready(function () {
    
    $("a[href=#]").click((e) => e.preventDefault());
    
    User.initiate();
    Search.initiate();
    Discover.initiate();
    Follow.initiate();
});
