"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

// XXX - Your submission should work without this line
// var cs142models = require('./modelData/photoApp.js').cs142models;
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var cs142password = require('./cs142password.js')
var fs = require("fs");


mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

session.user_id = "";


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('Unauthorized');
        return;
    }
    User.find({}, function (err, queryResults) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return
        }
        var userFromDB = JSON.parse(JSON.stringify(queryResults));
        var userList = [];
        userFromDB.forEach(function (userDB) {
            var user = {};
            user._id = userDB._id;
            user.first_name = userDB.first_name;
            user.last_name = userDB.last_name;
            userList.push(user);
        })
        response.status(200).send(userList);
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('Unauthorized');
        return;
    }
    var id = request.params.id;
    User.findOne({'_id' : id}, ['_id','first_name','last_name','login_name','location','description','occupation','favorite_photos','recentActivity','recently_upload_photo','recent_uploaded_photo','photo_liked_list','photo_disliked_list','profile','friend_request_list','friend_list'],
        function(err, user){
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with _id ' + id +' not found.');
            response.status(400).send('Not found');
            return;
        }
        response.status(200).send(user);
    });
});

app.get('/userPhoto/:id', function(request, response) {
    var id = request.params.id;
    var sent_object = {}
    Photo.find({'user_id': id}, function(err, photos){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        };
        var comment_count = 0;
        if (photos.length > 0) {
            sent_object.mostRecentlyPhoto = photos[photos.length - 1];
            sent_object.mostCommentedPhoto = photos[0]
            var photoList = JSON.parse(JSON.stringify(photos));
            async.each(photoList, function(photo, photo_callback){
                if (photo.comments.length > comment_count){
                    comment_count = photo.comments.length;
                    sent_object.mostCommentedPhoto = photo
                };
                photo_callback();
            }, function (err){
                if (err) {
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                response.status(200).send(sent_object);
            });
        }
    });

});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('Unauthorized');
        return;
    }
    var id = request.params.id;
    Photo.find({'user_id' : id}, function(err, queryResults) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (queryResults.length === 0){
            console.log("The photo of user with _id " + id + " not found.");
            response.status(400).send("Not Found");
            return;
        }
        
        var asyncTasks = [];
        var photos = JSON.parse(JSON.stringify(queryResults));
        for (var i = 0; i < photos.length; i++){
            var photoFromDB = photos[i];
            var photo = {};
            photos[i] = photo;
            photo._id = photoFromDB._id;
            photo.date_time = formatDateTime(photoFromDB.date_time);
            photo.file_name = photoFromDB.file_name;
            photo.user_id = photoFromDB.user_id;
            photo.like = photoFromDB.like;
            photo.comments = [];
            var comments = photo.comments;
            photoFromDB.comments.forEach(function(commentFromDB){
                var comment = {};
                comments.push(comment);
                comment.user_id = photo.user_id;
                comment._id = commentFromDB._id;
                comment.date_time = commentFromDB.date_time;
                comment.comment = commentFromDB.comment;
                console.log(comment.comment)
                asyncTasks.push(function(callback){
                    User.find({"_id": commentFromDB.user_id}, function(err, users){
                        if (err) {
                            console.log('Database find() return error:');
                            console.log(JSON.stringify(err));
                        }
                        else if (users.length === 0){
                            console.log('User with _id' + commentFromDB.user_id + 'not found');
                        }
                        else{
                            var userFromDB = JSON.parse(JSON.stringify(users[0]));
                            var user = {}
                            user._id = userFromDB._id;
                            user.first_name = userFromDB.first_name;
                            user.last_name = userFromDB.last_name;
                            comment.user = user;
                        }
                        callback();
                    });
                });
            });
        }
        async.parallel(asyncTasks, function () {
            response.status(200).send(photos);
        });
    });
});

app.post('/admin/login', function(request, response){
    if (!request.body.login_name){
        return;
    }
    if (request.session.user_id) {
        User.findOne({_id:request.session.user_id}, function(err, user){
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.status(200).send(user);
        });
        return;
    }
    if (request.body.login_name === "session") {
        return;
    }
    User.findOne({login_name: request.body.login_name}, function(err, user) {
        if (user !== null) {
            if(cs142password.doesPasswordMatch(user.password_digest, user.salt, request.body.password)){
                request.session.user_id = user._id;
                session.user_id = user._id;
                response.status(200).send(user);
            } else {
                response.status(400).send("Password is not correct!");
            }
        } else {
            response.status(400).send(request.body.login_name + " is not a valid account");
        }
    });
});

app.post('/admin/logout', function(request, response){
    if (request.session.user_id) {
        request.session.destroy(function (err) {});
        session.user_id = "";
        response.status(200).send();
    } else{
        response.status(400).send("No user logged in.")
    }

});

app.post('/user', function(request, response) {
    var userName = request.body.login_name;
    if (userName === undefined) {
        response.status(400).send("User name is not defined.");
        return;
    }
    User.findOne({login_name: userName}, function(err, user) {
        if (user !== null) {
            response.status(400).send(userName + " already exists.");
            return;
        }
        var password = cs142password.makePasswordEntry(request.body.password);
        var newUser = {
            login_name: request.body.login_name,
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            description: request.body.description,
            location: request.body.location,
            occupation: request.body.occupation,
            password_digest: password.hash,
            salt: password.salt
        }

        User.create(newUser, function(err, createdUser) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            request.session.user_id = createdUser._id;
            session.user_id = createdUser._id;
            console.log(createdUser._id)
            response.status(200).send(createdUser);
        });
    });
})

app.post('/commentsOfPhoto/:photo_id', function(request, response){
    if (!request.session.user_id){
        response.status(401).send('Unauthorized.');
        return;
    }

    var photo_id = request.params.photo_id;
    var user_id = request.session.user_id;
    var comment = request.body.comment;

    if (comment) {
        Photo.findOne({_id: photo_id}, function(err, photo){
            if (err) {
                console.log('This photo does not exist.')
                response.status(400).send('This photo does not exist.')
            } else{
                var newComment = {
                    comment: comment,
                    user_id: user_id, 
                    date_time: new Date()
                };

                photo.comments = photo.comments.concat([newComment]);
                photo.save();
                console.log("comments:" + photo.comments)
                response.status(200).send(JSON.stringify(photo));
            }
        });
    } else {
        console.log('Please enter comment to submit.')
        response.status(400).send('Please enter comment to submit.')
    }
})

app.post('/deleteComment', function(request, response) {
    var comment_id = request.body.comment_id;
    var photo_id = request.body.photo_id;

    Photo.findOne({_id: photo_id}, function(err, photo){
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        } else if (photo === null) {
            response.status(400).send('Can not find this photo.');
            return;
        } else{
            for (var index = 0; index < photo.comments.length; index++) {
                if (photo.comments[index]._id.equals(comment_id)){
                    break;
                };
            };
        };
        if (index !== photo.comments.length){
            photo.comments.splice(index, 1);
            photo.save();
            response.status(200).end();
        } else{
            response.status(400).sned('No such comment.');
        };
        
    });
});

var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
app.post('/photos/new', function(request, response){
    processFormBody(request, response, function(err){
        if (err || !request.file ){
            response.status(400).send('No file.')
            return;
        }

        if (request.file.fieldname !== 'uploadedphoto'){
            response.status(400).send('There is no file.')
            return;
        }
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                console.log(err);
                response.status(400).send('Error in uploading photo.');      
            }

            var newPhoto = {
                file_name : filename,
                user_id : request.session.user_id,
                comments : [],
                date_time: new Date()
            }
            Photo.create(newPhoto, function(err, photo){
                if (err) {
                    console.log(err);
                    response.status(400).send('Error in creating photo.');
                }
                photo.save();
                console.log(photo)
                response.status(200).send(photo);
            });
            User.findOne({_id:request.session.user_id}, function(err, user) {
                user.recent_uploaded_photo = 'images/' + filename;
                user.save()
            });  
        });
    });
})

app.post('/deletePhoto', function (request, response){
    var photo_id = request.body.photo_id;
    var user_id = request.session.user_id;

    Photo.findOne({_id: photo_id}, function(err, photo){
        if(err) {
            response.status(400).send(JSON.stringify(err));
            return;
        };
        if(photo===null){
            response.status(400).send('Could not find this photo.')
            return;
        };
        Photo.remove({_id:photo_id}, function(err){
            console.log(err)
        });
        response.status(200).send();
    });
});

app.post('/deleteUser', function(request, response){
    var user_id = request.body.user._id;
    if(request.session.user_id != user_id){
        response.status(401).send('No authority.')
        return;
    };
    User.findOne({_id: user_id}, function(err, user){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if(user === null){
            response.status(400).send('No such user.');
            return;
        }
        Photo.remove({user_id:user_id}, function(err) {});
        User.remove({_id:user_id}, function(err) {})
        request.session.destroy(function(err) {});
        response.status(200).send();
    });
});

app.post('/likePhoto/:photoId', function(request, response){
    if (!request.session.user_id) {
        response.status(401).send('Unauthorized');
        return;
    }
    var photoId = request.params.photoId;
    var user_id = request.session.user_id
    Photo.findOne({_id:photoId}, function(err, photo){
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photo === null) {
            response.status(400).send('Photo not found');
            return;
        }
        var index = -1;
        for (var i = 0; i < photo.like.length; i++){
            if (photo.like[i].equals(request.session.user_id)){
                index = i;
            };
        };
        if (index === -1){
            photo.like = photo.like.concat(user_id);

        } else {
            photo.like.remove(user_id);
        };
        photo.save(function(err){
            console.log(err)
        });
        response.status(200).send(photo);
    })
});

function formatDateTime(dateTime){
    var part1 = dateTime.slice(0,10);
    var part2 = dateTime.slice(11,16);
    return part1 + " " + part2;

}

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


