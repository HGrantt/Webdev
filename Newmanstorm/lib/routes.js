var mongodb = require("mongodb");
var bodyParser = require("body-parser");

module.exports = function(app)
{
    var dbmodule = require('./database.js');
    var db = dbmodule.startdb();
    app.use(bodyParser.urlencoded({ extended: false}));
    app.use(bodyParser.json());
    app.use(require("express").static("../html"));

    app.post('/saveuser', function(req, res){
        var theuser = req.body;
        dbmodule.saveuser(theuser, function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if(err){ res.sendStatus(400); }
            else { res.sendStatus(200); }
        });
    });

    app.post('/verifyuser', function(req, res){
        var theuser = req.body;
        dbmodule.verifyuser(theuser, function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if(err){ res.sendStatus(400); }
            else { res.sendStatus(200); }
        });
    });

    app.post('/postmsg', function(req, res){
        var message = req.body;
        dbmodule.addpost( message , function(err,result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if(err){ res.sendStatus(400); }
            else { res.status(200).send(result); }
        });
    });

    app.post('/getposts', function(req, res){
        var user = req.body;
        dbmodule.getposts( user, function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if(err){ res.sendStatus(400); }
            else { res.status(200).send(result); }
        });
    });

    app.post('/getusers', function(req, res){
        dbmodule.getsearch( function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else {
                res.status(200).send(result);
            }
        });
    });

    app.get('/getfriends', function(req, res) {
        var user = { "name": req.query.name};
        dbmodule.getfriends(user, function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if (err) { res.sendStatus(400); }
            else {
                if( result==null){ res.status(200).send("");}
                else{ res.status(200).send(result); }
            }
        });
    });

    app.post('/addfriend', function(req, res){
        var users = req.body;
        dbmodule.addfriend( users, function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if(err){
                res.sendStatus(400); }
                else {
                    res.status(200).send(result);
                }
        });
    });

    app.post('/unfriend', function(req, res){
        var users = req.body;
        dbmodule.unfriend( users, function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else if(err){ res.sendStatus(400); }
            else { res.status(200).send(result); }
        });
    });

    app.post('/userexists', function(req, res){
        var name = req.body.name;
        var exists = false;
        dbmodule.getsearch(function(err, result){
          /* istanbul ignore if */
            if(err && err instanceof mongodb.MongoError) { res.sendStatus(500); }
            else {
                for(var i in result){
                    if(result[i]["name"] == name){
                        exists = true;
                    }
                }
                res.status(exists ? 200 : 400).send(exists);
            }
        });
    });


    app.all('*', function(req, res) {
        res.sendStatus(404);
    });
};
