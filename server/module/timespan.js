/**
 *
 */

/**
 * Export the TimeSpan class
 */
module.exports = function (arg) {
    return new TimeSpan(arg);
}

/**
 * The TimeSpan class constructor
 * Initialize the span
 * @param arg, if arg is an integer, then directly add it to the span
 *             else, then read the tick second and so on to add it to the span
 */
function TimeSpan(args) {

    //Initiate the global parameters
    this.initiate();
    
    //Check if the given argument is an integer
    if (args === parseInt(args, 10)) {
        
        //Set the span
        this.span = args;
    }
    else {
    
        //Initiate the scalar of ticks
        var scalar = 1;

        //Set the span
        this.span = 0;
        this.span += (args["tick"] || 0);
        this.span += (args["second"] || 0) * (scalar *= this.TICKS_PER_SECOND);
        this.span += (args["minute"] || 0) * (scalar *= this.SECOND_PER_MINUTE);
        this.span += (args["hour"] || 0) * (scalar *= this.MINUTE_PER_HOUR);
        this.span += (args["day"] || 0) * (scalar *= this.HOUR_PER_DAY);
        this.span += (args["month"] || 0) * (scalar *= this.DAY_PER_MONTH);
        this.span += (args["year"] || 0) * (scalar *= this.MONTH_PER_YEAR)
    }
}

/**
 * The Prototype of TimeSpan class
 */
TimeSpan.prototype = {
    initiate: function () {
        this.TICKS_PER_SECOND = 1000;
        this.SECOND_PER_MINUTE = 60;
        this.MINUTE_PER_HOUR = 60;
        this.HOUR_PER_DAY = 24;
        this.DAY_PER_WEEK = 7;
        this.DAY_PER_MONTH = 30;
        this.MONTH_PER_YEAR = 12;
    },
    getSecond: function () {
        return this.span / this.TICKS_PER_SECOND;
    },
    getMinute: function () {
        return this.getSecond() / this.SECOND_PER_MINUTE;
    },
    getHour: function () {
        return this.getMinute() / this.MINUTE_PER_HOUR;
    },
    getDay: function () {
        return this.getHour() / this.HOUR_PER_DAY;
    },
    getWeek: function () {
        return this.getDay() / this.DAY_PER_WEEK;
    },
    getMonth: function () {
        return this.getDay() / this.DAY_PER_MONTH;
    },
    getYear: function () {
        return this.getMonth() / this.MONTH_PER_YEAR;
    }
}
