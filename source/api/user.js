const Mongo = require("keeling-js/lib/mongo");
const Users = Mongo.db.collection("user");

module.exports = {
    addUser(username, password) {
        return Users.insert({
            "username": username,
            "password": password,
            "register_date_time": new Date(),
            "last_login": new Date(),
            "visit_amount": new Date()
        });
    },
    removeUser(username) {
        
    },
    changePassword(username, newPassword) {
        
    },
    checkPassword(username, password) {
        
    }
}
