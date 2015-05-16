function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateVN() {
    return generateRandomNumber(0, 9)
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
    var vn = generateVN() + ''
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
            data["error"] = error.message
            response.error(data)
        }
    })
})

Parse.Cloud.define("deleteConnection", function(request, response) {
    var data = {}
    var cid = request.params.cid
    var query = new Parse.Query("MyConnection")
    query.equalTo("objectId", cid)
    query.find({
        success: function(results) {
            results[0].destroy({
                success: function(connection) {
                    data["cid"] = connection.id
                    response.success(data)
                },
                error: function(myObject, error) {
                    response.error("deleting connection failed")
                }
            })
        },
        error: function() {
            response.error("finding connection failed")
        }
    })
})
