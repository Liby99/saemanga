/**
 * MySQL 
 */

var mysql = require("mysql");
var config = require("./../data/config.json");

/**
 * Mysql Module
 */
module.exports = {
    connection: null,
    config: {
        host: config["mysql_host"],
        user: config["mysql_username"],
        password: config["mysql_password"],
        database: config["mysql_database"]
    },
    connect: function () {
        var self = this;
        
        //Create connection
        this.connection = mysql.createConnection(this.config);
        
        //Connect and update status
        this.connection.connect(function (err) {
            if (err) {
                console.log("Error occurs when connecting to database: " + err);
                self.connect();
            }
        });

        this.connection.on("error", function (err) {
            console.log("Database error", err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log("Connection Lost. Trying to reconnect the database. ");
                self.connect();
            }
            else {
                throw err;
            }
        });
    },
    end: function () {
        
        //Disconnect and update status
        this.connection.end();
        this.connection = null;
    },
    query: function (queryStr, data, callback, endAfterCall) {
        
        //Check if the connection needs to be ended
        if (endAfterCall === undefined) {
            endAfterCall = true;
        }
        
        //Make sure the connection is constructed
        if (!this.connection) {
            this.connect();
        }
        
        //Start query
        this.connection.query(queryStr, data, function (err, result) {
            
            //Log error if exists
            if (err) {
                console.log(err);
            }
            
            //Callback
            if (callback) {
                callback(err, result);
            }
        });
        
        //End connection if required
        if (endAfterCall) {
            this.end();
        }
    }
}
