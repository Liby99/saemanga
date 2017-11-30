module.exports = function (obj) {
    
    function afterBegin () {
        
        (function t(i) {
            if (i < obj.tests.length) {
                obj.tests[i](() => {
                    t(i + 1);
                }, (err) => {
                    console.error(err);
                    t(i + 1);
                });
            }
            else {
                afterTest();
            }
        })(0);
    }
    
    function afterTest() {
        if (obj.finish) obj.finish();
    }
    
    if (obj.begin)
        obj.begin(afterBegin);
    else
        afterBegin();
};
