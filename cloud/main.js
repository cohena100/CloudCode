
var TestObject = Parse.Object.extend("TestObject");

var Monster = Parse.Object.extend("Monster", {
        hasSuperHumanStrength: function () {
            return this.get("strength") > 18;
        },
        initialize: function (attrs, options) {
            this.sound = "Rawr"
        }
    }, {
        spawn: function(strength) {
            var monster = new Monster();
            monster.set("strength", strength);
            return monster;
    }
});

var MyConnection = Parse.Object.extend("MyConnection", {
        initialize: function (attrs, options) {
        }
    }, {
        instance: function(from, to, pin, name, phone, other) {
            var instance = new MyConnection();
            instance.set("from", from);
            instance.set("to", to);
            instance.set("pin", pin);
            instance.set("name", name);
            instance.set("phone", phone);
            instance.set("other", other);
            return instance;
    }
});

Parse.Cloud.define("hello", function(request, response) {
    var from = 
    var myConnection = MyConnection.instance();
    monster.save(null, {
        success: function(object) {
            response.success("success: " + monster.get("strength"));
        },
        error: function(object, error) {
            response.error("fail: " + error.message);
        }
    });
});


        if let currentUser = PFUser.currentUser() {
            currentUser.saveInBackgroundWithBlock({ (saved, error) -> Void in
                if (saved) {
                    PFCloud.callFunctionInBackground("hello", withParameters: [:]) { (result, error) -> Void in
                        if let error = error {
                            println("fail with error: \(error)")
                        } else if let result: AnyObject = result {
                            println("success with result: \(result)")
                        }
                    }
                }
            })
        }
