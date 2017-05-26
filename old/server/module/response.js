/**
 * 
 */

/**
 * Extend Response MiddleWare
 */
module.exports = function (req, res, next) {
    
    /**
     * Create Formatted Response For the Given response object
     */
    res.formatResponse = function (errorCode, errorLog, content) {
        res.send(JSON.stringify({
            "error_code": errorCode,
            "error_log": errorLog,
            "content": content
        }));
    };
    
    /**
     * Response successfully with response content
     */
    res.success = function (content) {
        res.formatResponse(0, "", content);
    };
    
    /**
     * Response with error code and error message
     */
    res.error = function (errorCode, errorLog) {
        res.formatResponse(errorCode, errorLog, new Object());
    };
    
    next();
}
