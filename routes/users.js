module.exports = function(app, user) {

    var async = require('async');
    var nodemailer = require('nodemailer');
    var crypto = require('crypto');

    var smtpTransport = nodemailer.createTransport("SMTP", {
        auth: {
            user: "chad.dumadag@gmail.com",
            pass: "jahlove2"
        }
    });

    app.get('/directory', listAllUsers);

    app.get('/addphotourl', updateAll);

    // app.post('/add-user', addUser);

    // temporary function to add user
    app.post('/add-user-temp', addusertemp);



    //temp delete to remove test items
    app.delete('/profile/:id', deleteUser);

    app.get('/profile/:username', showProfile);
    app.get('/profiles', showBasicProfiles);

    app.get('/retrieveArrayOf/:basicField', basicFieldValues);

    var custom_fields = require('../routes/custom_fields');

    function showProfile(req, res) {
        var username = req.params.username;
        var UsernameFieldLabel = "Username";
        var id;
        user.customFieldsModel.findOne({
            label: UsernameFieldLabel
        }, function(err, doc) {
            if (err) {
                console.log(err);
                res.send(500, err);
            } else {
                id = doc._id;
                user.Users.findOne({
                    field: {
                        $elemMatch: {
                            objectID: id,
                            assignedValue: username
                        }
                    },
                    isActive: 1
                }, null, function(error, employee) {
                    if (err) {

                    } else {
                        console.log(employee);
                        if (employee) {
                            res.send(200, employee);                           
                        } else {
                            res.send(404);
                        }
                    }
                });
            }
        });
    }


    //sample code to get specific value of a subdocument field

    function showUsername(req, res) {
        var username = req.params.username;
        var UsernameFieldLabel = "Username";
        var id;
        user.customFieldsModel.findOne({
            label: UsernameFieldLabel
        }, function(err, doc) {
            if (err) {
                console.log(err);
                res.send(500, err);
            } else {
                id = doc._id;
                user.Users.findOne({
                        field: {
                            $elemMatch: {
                                objectID: id,
                                assignedValue: username
                            }
                        },
                        isActive: 1
                    }, {
                        'field.assignedValue': 1,
                        field: {
                            $elemMatch: {
                                objectID: id,
                                assignedValue: username
                            }
                        },
                    },
                    function(error, employee) {
                        if (err) {} else {
                            if(employee) {
                                var test = ' ';
                                test = employee.field[0].assignedValue[0];
                                console.log(test);
                                res.send(200, employee);
                                console.log(username + ' retrieved.');
                            }
                        }
                    });
            }
        });
    }

    function basicFieldValues(req, res) {
        var model = user.customFieldsModel,
            basicField = req.params.basicField,
            basicFields = [],
            basicFieldId;

        async.parallel({
            username: function(callback) {
                getID('Username', model, function(id) {
                    callback(null, id);
                });
            },
            email: function(callback) {
                getID('Email', model, function(id) {
                    callback(null, id);
                });
            }
        }, function(err, result) {

            switch (basicField) {
                case 'username':
                    basicFieldId = result.username;
                    break;

                case 'email':
                    basicFieldId = result.email;
                    break;

                default:
                    res.send(404);
            }

            user.Users.aggregate([{
                $unwind: "$field"
            }, {
                $match: {
                    "field.objectID": basicFieldId
                }
            }, {
                $project: {
                    "field.assignedValue": 1
                }
            }], function(err, docs) {
                if (err) {
                    res.send(500, err);
                } else {

                    docs.forEach(function(data) {
                        basicFields.push(data.field.assignedValue[0]);
                    });

                    res.send(200, basicFields);
                }
            });
        });
    }

    function showBasicProfiles(req, res) {
        var name = req.query["name"];
        var model = user.customFieldsModel;

        async.parallel([
            function(callback) {
                getID('First Name', model, function(firstID) {
                    callback(null, firstID);
                });
            },
            function(callback) {
                getID('Last Name', model, function(lastID) {
                    callback(null, lastID);
                });
            },
            function(callback) {
                getID('Job Position', model, function(jobID) {
                    callback(null, jobID);
                });
            },
            function(callback) {
                getID('Username', model, function(userID) {
                    callback(null, userID);
                });
            }
        ], function(err, results) {
            if (name) {
                addBack(name, function(newname) {
                    user.Users.aggregate([{
                        $match: {
                            isActive: true,
                            fullName: {
                                $regex: newname,
                                $options: 'i'
                            }
                        }
                    }, {
                        $unwind: "$field"
                    }, {
                        $match: {
                            "field.objectID": {
                                $in: [results[0], results[1], results[2], results[3]]
                            },
                            fullName: {
                                $ne: 'Global Zeal Admin'
                            }
                        }
                    }, {
                        $group: {
                            _id: {
                                _id: "$_id",
                                fullName: "$fullName",
                                photo: "$photo"
                            }
                        }
                    }, {
                        $project: {
                            _id: "$_id._id",
                            "fullName": "$_id.fullName",
                            "photo": "$_id.photo",
                            "field": 1
                        }
                    }], function(error, doc) {
                        res.send(200, doc);
                        //console.log(doc);
                    });
                });

            } else {
                user.Users.aggregate([{
                    $match: {
                        isActive: true
                    }
                }, {
                    $unwind: "$field"
                }, {
                    $match: {
                        "field.objectID": {
                            $in: [results[0], results[1], results[2], results[3]]
                        },
                        fullName: {
                            $ne: 'Global Zeal Admin'
                        }
                    }
                }, {
                    $group: {
                        _id: {
                            _id: "$_id",
                            fullName: "$fullName",
                            photo: "$photo"
                        },
                        "field": {
                            $push: "$field.assignedValue"
                        }
                    }
                }, {
                    $project: {
                        _id: "$_id._id",
                        "fullName": "$_id.fullName",
                        "photo": "$_id.photo",
                        "field": 1
                        // "firstName": "$field.assignedValue  ",
                    }
                }], function(error, doc) {
                    res.send(200, doc);
                    //console.log(doc);
                });
            }
        })
    }

    //adds '/' to each special character to appear on string

    function addBack(str, callback) {
        var newname = str;
        var x = str.length;
        var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
        for (var i = 0, j = 0; i < str.length; i++, j++) {
            if (specialChars.indexOf(str.charAt(i)) != -1) {
                newname = newname.substring(0, j) + '\\' + newname.substring(j++, x++);
            } else {
                newname = newname.substring(0, j) + newname.substring(j, x);
            }
            if (i == str.length - 1) {
                callback(newname);
            }
        }
    }

    //gets the ID of a specific label in custom fields 

    function getID(_label, model, callback) {
        var id;
        model.findOne({
            label: _label
        }, function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                callback(doc._id);
            }
        });
    }

    function showFieldValue(userID, object_ID, callback) {
        console.log(userID + ' ' + object_ID);
        user.Users.findOne({
            _id: userID
        }, {
            'field.assignedValue': 1,
            field: {
                $elemMatch: {
                    objectID: object_ID
                }
            }
        }, function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                //console.log(doc);
                callback(doc.field[0].assignedValue[0]);
            }
        });
    }

    function listAllUsers(req, res) {
        var options = {};
        if (req.query.skip) {
            options.skip = req.query.skip;
        }
        if (req.query.limit) {
            options.limit = req.query.limit;
        }
        user.Users.find({
            isActive: 1
        }, null, options, function(err, docs) {
            if (err) {
                //console.log(err);
                res.send(500, err);
            } else {
                res.send(200, docs);
            }
        });
    }

    function sendEmail(to, from, subject, html) {
        var mailOptions = {
            to: to,
            from: from,
            subject: subject,
            html: html
        }

        smtpTransport.sendMail(mailOptions, function(err, res) {
            if (err) {
                console.log(err);
            } else {
		// console.log(res);
                console.log("Message sent: " + res.message);
            }
        });
    }

    function emailVerificationHTML(token) {
        var html = '<a href="http://localhost:8091/token/' + token + '">TEST EMAIL</a>';

        return html;
    }

    function addusertemp(req, res) {
        crypto.randomBytes(32, function(ex, buf) {
            var token = buf.toString('hex');
            req.body.token = token;

	    user.Users.create(req.body, function(err, doc) {
		// console.log(req.body);
		if (err) {
		    console.log(err);
		} else {
		    //  DUMMY EMAIL CREDENTIALS
		    var recipient = 'facebook.dummy.po@gmail.com'; // req.body.email
		    var sender = '<chad.dumadag@gmail.com>'; //
		    var subject = 'DUMMY EMAIL'; //
		    var htmlContent = emailVerificationHTML(req.body.token); // HTML Content

		    res.send(200, doc)
		    console.log('ID ' + doc._id + ' Added to Users');

		    sendEmail(recipient, sender, subject, htmlContent);

		    //Set fullname
                    async.parallel([
                        function(callback) {
			    getID('First Name', user.customFieldsModel, function(firstID) {
				callback(null, firstID);
                            });
                        },
                        function(callback) {
			    getID('Last Name', user.customFieldsModel, function(lastID) {
				callback(null, lastID);
                            });
                        }
		    ], function(error, results) {
			async.parallel([
			    function(callback) {
				showFieldValue(doc._id, results[0], function(firstName) {
				    callback(null, firstName);
				});
			    },
			    function(callback) {
				showFieldValue(doc._id, results[1], function(lastName) {
				    callback(null, lastName);
				});
                            }
			], function(er, result) {
			    var full = result[0] + ' ' + result[1];

			    user.Users.update({
				_id: doc._id
			    }, {
				fullName: full,
				photo: 'pics/SINet.gif'
			    }, function(e, d) {
				if (e) {
				    console.log(e);
				} else {
				    console.log('Fullname Added.');
				}
			    });
                        });
                    });
		}
	    });
        });
    }

    //curl -X DELETE 'http://localhost:8091/profile/[id]'

    function deleteUser(req, res) {
        var id = req.params.id;
        user.Users.findByIdAndRemove(id, function(err, doc) {
            if (err) {
                console.log(err);
                res.send(404, err);
            } else {
                res.send(200, doc);
            }
        });
    }


    //temp function to update all users for additional fields like photo

    function updateAll(req, res) {
        user.Users.update({
            "isActive": true
        }, {
            $set: {
                photo: 'pics/SINet.gif'
            }
        }, {
            multi: true
        }, function(err, doc) {
            res.send(200, doc);
        });
    }

    app.get('/profileTest/:username', function(req, res) {

        async.parallel({
            usernameId: function(callback) {
                user.customFieldsModel.findOne({
                    label: 'Username'
                }, function(err, docs) {
                    if (err) res.send(500, err);
                    callback(null, docs._id);
                });
            },
            customFields: function(callback) {
		user.customFieldsModel.find({ isActive: true }, function(err, docs) {
                    if (err) res.send(500, err);
                    callback(null, docs);
                });
            },
            userInfo: function(callback) {
                this.usernameId(function(err, usernameId) {
                    user.Users.aggregate([{
                        $match: {
                            "field.objectID": usernameId,
                            "field.assignedValue": req.params.username
                        }
                    }], function(err, docs) {
                        if (err) res.send(err);
                        callback(null, docs[0]);
                    });
                });
            }
        }, function(err, result) {
            res.send(200, result.userInfo);
        });

    });

    function getData(id, model, callback) {

        model.findOne({
            _id: id
        }, function(err, docs) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                callback(docs);
            }
        });

    }

}