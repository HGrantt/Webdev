var mongodb = require("mongodb");
var db = null;

exports.startdb = function() {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/tdp013';
    MongoClient.connect(url, function(err, _db) {
      /* istanbul ignore if */
        if (err) throw err;
        db = _db;
    });
};

exports.saveuser = function(user, callback) {
    if( !userformcheck(user) ) {
      callback(new Error("Invalid username or password"), null);
      return;
    };
    db.collection("users").find({ name: user.name }).toArray(function(err, docs){
        if (docs.length > 0)
        {
            callback(new Error("User already exists"),null);
            return;
        }
        db.collection("users").insert(user, function(err,success){
          /* istanbul ignore if */
            if(err){
                callback(err, null);}
            else {
                var userwall = {"name": user.name,
                               "posts": []};
                db.collection("walls").insert(userwall, function(err, success){
                  /* istanbul ignore if */
                    if(err){
                        callback(err, null);}
                    else {
                        callback(null,success);
                    }
                });
            }
        });
    });
};


exports.verifyuser = function(user, callback) {
  if( !userformcheck(user) ) {
    callback(new Error("Invalid username or password"), null);
    return;
  };
  db.collection("users").findOne({"name": user["name"]}, function(err,docs){
    if( docs == null){
      callback(new Error("No user found"), null);
    }
    else {
      if( docs["pass"] == user["pass"] ){
        callback(null, docs["name"]);
      }
      else {
        callback(new Error("Wrong Password"),null);
      }
    }
  });
};


exports.addpost = function(message, callback) {
    if( message.body.trim().length < 1 || message.body.length > 420) {
      callback(new Error("Invalid message"), null);
      return;
    }
    var addto = message.to;
    delete message.to;
    db.collection("walls").find({"name": addto}).toArray(function(err, docs){
        db.collection("walls").update({ "name": addto },{ $push: { "posts": message } }, function(err,success){
          /* istanbul ignore if */
            if(err){
                callback(err, null);
            }
            else{
                callback(null,{"name": addto});
            }
        });
    });
};

exports.getposts = function(user, callback){
    var getuser = user["name"];
    if( !/^[A-Za-z0-9]{3,12}$/.test(getuser) ) {
        callback(new Error("Invalid username"), null);
        return;
    }
    db.collection("walls").find({"name": getuser}).toArray(function(err, docs){
      /* istanbul ignore if */
        if(err){
            callback(err,null);
        }
        else if ( docs < 1 ) {
            callback(new Error("Did not find user"), null);
        }
        else{
            var posts = JSON.stringify(docs[0]["posts"]);
            callback(null, posts);
        }
    });
};

exports.getsearch = function(callback){
  db.collection("users").find().toArray(function(err,docs){
    /* istanbul ignore if */
    if(err){
      callback(err,null);
    }
    else{
      callback(null, docs);
    }
  });
};

exports.addfriend = function(search, callback){
  createBond(search["you"], search["friend"], function(you){
    createBond(search["friend"], search["you"], function(friend){
      if(you && friend)
      {
        callback(null, true);
      }
      else{
        callback(true, null);
      }
    });
  });
};

exports.unfriend = function(user, callback) {
    db.collection("users").find({"name": user["you"]}).toArray(function(err, res){
      if( res.length < 1 ){
        callback(new Error("No user found"), null);
        return;
      }
      var deleted = false;
      for(var i in res[0]["friends"]){
        if( res[0]["friends"][i] == user["friend"] ){
          res[0]["friends"].splice(i, 1);
          deleted = true;
          break;
        }
      }
      if ( !deleted ) {
        callback(new Error("Did not find user"), null);
      }
      else {
        db.collection("users").update({"name": user["you"]}, {$set: { "friends": res[0]["friends"]}}, function(err,docs){
          /* istanbul ignore if */
          if(err){ callback(err,null); }
          else { callback(null, res.friends); }
        });
      }
    });
  };



exports.getfriends = function(user, callback) {
    db.collection("users").findOne({"name": user["name"]}, function(err, res){
      if( res == null ){
        callback(new Error("User didn't exist"), null);
      }
      else if(err || res["friends"] == undefined){
            callback(err,null); }
        else { callback(null, res["friends"]); }
    });
};



function containsObj(obj, list) {
    for(var i in list ){
        if(obj == list[i]){
            return true;
        }
    }
    return false;
};

function createBond(user, friend, callback){

    db.collection("users").find({"name": user}).toArray(function(err,docs){
        if( docs.length < 1 ){
            callback(false);
        }
        else if( containsObj(friend, docs[0]["friends"]) || friend == user){
            callback(false);
        }
        else{
            db.collection("users").update({ "name": user },{ $push: { "friends": friend}}, function(err,succ){
              /* istanbul ignore if */
                if(err){
                    callback(false);
                }
                else{
                    callback(true);
                }
            });
        }
    });
};

function userformcheck(user){
  var name = /^[A-Za-z0-9]{3,12}$/.test(user.name);
  var pass = /^.{3,}$/.test(user.pass);
  if( name && pass) { return true; }
  else { return false; }
};
