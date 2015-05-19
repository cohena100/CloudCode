function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateVN() {
    var digit1 = generateRandomNumber(0, 9)
    var digit2 = generateRandomNumber(0, 9)
    var digit3 = generateRandomNumber(0, 9)
    var digit4 = generateRandomNumber(0, 9)
    return '' + digit1 + digit2 + digit3 + digit4
}

var MyConnection = Parse.Object.extend("MyConnection", {
        initialize: function(attrs, options) {
        }
    }, {
        instance: function(from, vn) {
            var instance = new MyConnection()
            instance.set("from", from)
            instance.set("vn", vn)
            return instance
    }
})

Parse.Cloud.define("invite", function(request, response) {
    var vn = generateVN()
    var from = request.user
    var connection = MyConnection.instance(from, vn)
    var data = {}
    connection.save(null, {
        success: function(object) {
            data["vn"] = connection.get("vn")
            data["cid"] = connection.id
            response.success(data)
        },
        error: function(object, error) {
            response.error("object creation failed with error: " + error.message)
        }
    })
})

Parse.Cloud.define("deleteConnection", function(request, response) {
    var data = {}
    var cid = request.params.cid
    var query = new Parse.Query("MyConnection")
    query.equalTo("objectId", cid)
    query.find({
        success: function(connections) {
            if (connections.length == 0) {
                    data["cid"] = cid
                    response.success(data)
                    return
            }
            connections[0].destroy({
                success: function(connection) {
                    data["cid"] = connection.id
                    response.success(data)
                },
                error: function(myObject, error) {
                    response.error("deleting connection failed with error: " + error.message)
                }
            })
        },
        error: function(object, error) {
            response.error("finding connection failed with error: " + error.message)
        }
    })
})

Parse.Cloud.define("connections", function(request, response) {
    var data = []
    var from = request.user
    var query = new Parse.Query("MyConnection")
    query.equalTo("from", from)
    query.find({
        success: function(connections) {
             for (var i = 0; i < connections.length; ++i) {
                data.push(connections[i].id)
            }
            response.success(data)
        },
        error: function(object, error) {
            response.error("finding connection failed with error: " + error.message)
        }
    })
})

Parse.Cloud.define("inviteAgain", function(request, response) {
    var data = {}
    var cid = request.params.cid
    var query = new Parse.Query("MyConnection")
    query.equalTo("objectId", cid)
    query.find({
        success: function(connections) {
            if (connections.length == 0) {
                response.error("connection not found")
                return
            }
            var connection = connections[0]
            connection.set("vn", generateVN())
            connection.save(null, {
                success: function(connection) {
                    data["vn"] = connection.get("vn")
                    data["cid"] = connection.id
                    response.success(data)
                },
                error: function(object, error) {
                    response.error("connection update failed with error: " + error.message)
                }
            })
        },
        error: function(object, error) {
            response.error("finding connection failed with error: " + error.message)
        }
    })
})

