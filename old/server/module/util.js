/**
 *
 */

/**
 * Generate a random UUID
 */
exports.UUID = function () {
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

/**
 * Pad the given num to given digits. The default digits is two
 */
exports.pad = function (num, digits) {
    
    //Check if the number is an integer
    if (num === parseInt(num, 10)) {
        
        //Initialize digits to default value
        if (!digits || digits <= 0) {
            digits = 2;
        }
        
        //Check if digits is an integer
        if (digits === parseInt(digits, 10)) {
            
            //Create a str
            var str = num.toString();
            
            //Iterate until the str has the length of digits
            while (str.toString().length < digits) {
                str = "0" + str;
            }
            
            //Return the string
            return str;
        }
        else {
            throw new Error("digits should be an integer");
        }
    }
    else {
        throw new Error("num should be an integer");
    }
}

/**
 * Generate lower case salt with specified digit. Default is 6
 */
exports.generateSalt = function (digit) {
    
    //If the digit does not exist then give it a default value of 6
    if (!digit) {
        digit = 6;
    }
    
    //Start generating salt
    var salt = "";
    for (var i = 0; i < digit; i++) {
        
        //Generate a random number
        var random = Math.floor(Math.random() * 36);
        
        //Change the random number to character
        if (random < 26) {
            salt += String.fromCharCode(97 + random);
        }
        else {
            salt += random - 26;
        }
    }
    
    //Return the generated salt
    return salt
}

/**
 * Generate a four digit random string consists of hex numbers.
 */
function s4() {
    var charList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f'];
    var str = "";
    for (var i = 0; i < 4; i++) {
        str += charList[Math.floor(Math.random() * charList.length)];
    }
    return str;
}

exports.Stack = Stack;

function Stack() {
    this._size = 0;
    this._head = null;
}

Stack.prototype.isEmpty = function () {
    return this._size == 0;
}

Stack.prototype.size = function () {
    return this._size;
}

Stack.prototype.push = function (element) {
    var node = new Node(element);
    if (this.isEmpty()) {
        this._head = node;
        this._size++;
    }
    else {
        node._next = this._head;
        this._head = node;
        this._size++;
    }
}

Stack.prototype.pop = function (element) {
    if (this.isEmpty()) {
        throw new Error("Empty Stack Exception");
    }
    else {
        var element = this._head._element;
        if (this._size == 1) {
            this._head = null;
            this._size = 0;
        }
        else {
            this._head = this._head._next;
            this._size--;
        }
        return element;
    }
}

Stack.prototype.peek = function () {
    if (this.isEmpty()) {
        throw new Error("Empty Stack Exception");
    }
    else {
        return this._head._element;
    }
}

exports.Queue = Queue;

function Queue() {
    this._size = 0;
    this._head = null;
    this._tail = null;
}

Queue.prototype.isEmpty = function () {
    return this._size == 0;
}

Queue.prototype.size = function () {
    return this._size;
}

Queue.prototype.push = function (element) {
    var node = new Node(element);
    if (this.isEmpty()) {
        this._head = node;
        this._tail = node;
        this._size++;
    }
    else {
        this._tail._next = node;
        this._size++;
    }
}

Queue.prototype.pop = function () {
    if (this.isEmpty()) {
        throw new Error("Empty Queue Exception");
    }
    else {
        var element = this._head._element;
        if (this._size == 1) {
            this._head = null;
            this._tail = null;
            this._size = 0;
        }
        else {
            this._head = this._head._next;
            this._size--;
        }
        return element;
    }
}

Queue.prototype.peek = function () {
    if (this.isEmpty()) {
        throw new Error("Empty Queue Exception");
    }
    else {
        return this._head._element;
    }
}

function Node(element) {
    this._element = element;
    this._next = null;
}
