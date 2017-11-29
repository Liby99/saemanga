const assert = require("assert");
const Mongo = require("keeling-js/lib/mongo");
const config = require("../data/mongo.json");

const USERNAME_1 = "scripttest_1";
const USERNAME_2 = "scripttest_2";
const PASSWORD = "12345678";
const WRONG_PASSWORD = "123456789";

function testUser() {
    console.log("Start Loading User Module... ");
    const User = require("../api/user");
    console.log("Passed");
    
    console.log("Testing Add User... ");
    User.addUser(USERNAME_1, PASSWORD, function (success) {
        assert.equal(success, true);
        console.log("Passed");
        
        console.log("Testing Has User 1... ");
        User.hasUser(USERNAME_1, function (has1) {
            assert.equal(has1, true);
            console.log("Passed");
            
            console.log("Testing Not Existing User 2... ");
            User.hasUser(USERNAME_2, function (has2) {
                assert.equal(has2, false);
                console.log("Passed");
                
                console.log("Testing Successful Login... ");
                User.login(USERNAME_1, PASSWORD, function (success) {
                    assert.equal(success, true);
                    console.log("Passed");
                    
                    console.log("Testing User Not Existed Login... ");
                    User.login(USERNAME_2, PASSWORD, function (success) {
                        assert.equal(success, false);
                        console.log("Passed");
                        
                        console.log("Testing Wrong Password Login... ");
                        User.login(USERNAME_1, WRONG_PASSWORD, function (s) {
                            assert.equal(s, false);
                            console.log("Passed");
                        });
                    });
                });
            });
        });
    });
}

function test() {
    console.log("Initiating Mongo Module... ");
    Mongo.init(config, function () {
        console.log("Success!");
        testUser();
    });
}

test();
