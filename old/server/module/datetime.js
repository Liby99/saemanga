/**
 * 
 */

var util = require("./util.js");
var TimeSpan = require("./timespan.js");

/**
 * 
 */
module.exports = function () {
    
    /**
     * Export the date to string like: 2016-03-14
     */
    Date.prototype.toDateString = function () {
        return this.getFullYear() + "-" + util.pad(this.getMonth() + 1) + "-" + util.pad(this.getDate());
    }
    
    /**
     * Export the time to string like: 09:35:14
     */
    Date.prototype.toTimeString = function () {
        return util.pad(this.getHours()) + ":" + util.pad(this.getMinutes()) + ":" + util.pad(this.getSeconds());
    }
    
    /**
     * Export the time to string like: 2016-03-14 09:35:14
     */
    Date.prototype.toString = function () {
        return this.toDateString() + " " + this.toTimeString();
    }
    
    /**
     * Get the full month string of the date
     */
    Date.prototype.getMonthString = function () {
        switch (this.getMonth()) {
            case 0: return "January";
            case 1: return "Febuary";
            case 2: return "March";
            case 3: return "April";
            case 4: return "May";
            case 5: return "June";
            case 6: return "July";
            case 7: return "August";
            case 8: return "September";
            case 9: return "October";
            case 10: return "November";
            case 11: return "December";
        }
    }
    
    /**
     * Get the short version of the month string
     */
    Date.prototype.getShortMonthString = function () {
        return this.getMonthString().substring(0, 3);
    }
    
    /**
     * Get the time span object to the given date
     */
    Date.prototype.getTimeSpan = function (date) {
        return new TimeSpan(Math.abs(this.getTime() - date.getTime()));
    }
    
    /**
     * Shift the current time for a given time span
     * @param ts, the time span to be shifted
     */
    Date.prototype.shift = function (ts) {
        return new Date(this.getTime() + ts.span);
    }
    
    /**
     * Parse the string to the date time
     */
    Date.parseDate = function (str) {
        return new Date(Date.parse(str));
    }
}