var User = {
    $form: $("#login-form"),
    usernameReg: /^[A-Za-z0-9@\-\_\.\#\*]{4,16}$/
    passwordReg: /^[A-Za-z0-9@\-\_\.\#\*]{8,32}$/,
    initiate: function (callback) {
        this.initiateForm();
        callback();
    },
    initiateForm: function () {
        var self = this;
        this.$form.submit(function () {
            try {
                var obj = $(this).formData();
                var um = obj.username.match(self.usernameReg);
                var pm = obj.password.match(self.passwordReg);
                ajax({
                    
                });
            }
            catch (err) {
                console.log(err);
            }
            return false;
        });
    }
}
