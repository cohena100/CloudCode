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

function uuid() {
    var d = new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0
        d = Math.floor(d/16)
        return (c=='x' ? r : (r&0x3|0x8)).toString(16)
    })
    return uuid
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
                error: function(object, error) {
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

Parse.Cloud.define("acceptInvitation", function(request, response) {
    var data = {}
    var vn = request.params.vn
    var query = new Parse.Query("MyConnection")
    query.equalTo("vn", vn)
    query.doesNotExist("acceptedAt")
    query.find({
        success: function(connections) {
            if (connections.length == 0) {
                response.error("connection not found")
                return
            }
            var connection = connections[0]
            connection.set("acceptedAt", new Date())
            var to = request.user
            connection.set("to", to)
            connection.save(null, {
                success: function(connection) {
                    data["vn"] = connection.get("vn")
                    data["cid"] = connection.id
                    var cid = request.params.cid
                    if (!cid) {
                        response.success(data)
                        return
                    }
                    var query = new Parse.Query("MyConnection")
                    query.equalTo("objectId", cid)
                    query.find({
                        success: function(connections) {
                            if (connections.length == 0) {
                                response.success(data)
                                return
                            }
                            var connection = connections[0]
                            connection.destroy({
                                success: function(connection) {
                                    response.success(data)
                                },
                                error: function(object, error) {
                                    response.success(data)
                                }
                            })
                        },
                        error: function(object, error) {
                            console.log("finding connection failed with error: " + error.message);
                            response.success(data)
                        }
                    })
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

Parse.Cloud.define("addEnterLocation", function(request, response) {
    var data = {}
    data["accuracy"] = 50.0
    data["radius"] = 70.0
    data["lid"] = uuid()
    response.success(data)
})
