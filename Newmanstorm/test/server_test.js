var should = require("should");
var request = require('superagent');
var url = 'http://localhost:3000';
var server = require('../lib/server.js');
var db = null;

var cleardb = function(done){
    db.collection("users").drop(function(err) {
        db.collection("walls").drop(function(err) {
            done();
        });
    });
};

describe('Server', function() {
  before(function(done) {
    server();
    var mongodb = require("mongodb");
    var mongoclient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/tdp013';
    mongoclient.connect(url, function(err, _db) {
      if(err) throw err;
      db = _db;
      cleardb(done);
    });
  });

  describe('Saveuser', function() {
    //beforeEach(cleardb);
    it('Should save user to users and walls', function(done){
      var username = "Username";
      var password = "secret";
      request
      .post(url + "/saveuser")
      .set('Content-Type', 'application/json')
      .send({"name": username, "pass": password})
      .end(function(err, res){
        res.status.should.equal(200);
        db.collection("walls").find().toArray(function(err,docs){
          docs[0]["name"].should.equal("Username");
          db.collection("users").find().toArray(function(err,docs){
            docs[0]["name"].should.equal("Username");
            docs[0]["pass"].should.equal("secret");
            done();
          });
        });
      });
    });
    it("Should return error User already exists", function(done){
      request
      .post(url + "/saveuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Username", "pass": "secret"})
      .end(function(err,res){
        res.status.should.equal(400);
        done();
      });
    });
    it("Should return status 400", function(done){
      request
      .post(url + "/saveuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Invalid!", "pass": "ye"})
      .end(function(err, res){
        res.status.should.equal(400);
        done();
      });
    });
  });
  describe('Verifyuser', function() {
    it("Should find user and return 200", function(done){
      request
      .post(url + "/verifyuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Username", "pass": "secret"})
      .end(function(err,res){
        res.status.should.equal(200);
        done();
      });
    });
    it("Should find user, wrong pass return 400", function(done){
      request
      .post(url + "/verifyuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Username", "pass": "public"})
      .end(function(err,res){
        res.status.should.equal(400);
        done();
      });
    });
    it("Should not find user, proper format, and return 400", function(done){
      request
      .post(url + "/verifyuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Proper", "pass": "format"})
      .end(function(err,res){
        res.status.should.equal(400);
        done();
      });
    });
    it("Should not find user, invalid format, and return 400", function(done){
      request
      .post(url + "/verifyuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Er", "pass": "or"})
      .end(function(err,res){
        res.status.should.equal(400);
        done();
      });
    });
  });
  describe("Postmsg", function(){
    it("Should create message, return 200 and be found in db", function(done){
      var message = "A good message";
      request
      .post(url + "/postmsg")
      .set('Content-Type', 'application/json')
      .send({"to": "Username", "body": message, "from": "Username", "time": "13:37"})
      .end(function(err, res){
        res.status.should.equal(200);
        db.collection("walls").find().toArray(function(err,docs){
          docs[0]["name"].should.equal("Username");
          docs[0]["posts"][0]["body"].should.equal(message);
          docs[0]["posts"][0]["from"].should.equal("Username");
          docs[0]["posts"][0]["time"].should.equal("13:37");
          done();
        });
      });
    });
    it("Should return 400, empty message", function(done){
      request
      .post(url + "/postmsg")
      .set('Content-Type', 'application/json')
      .send({"to": "Username", "body": " ", "from": "Username", "time": "13:37"})
      .end(function(err, res){
        res.status.should.equal(400);
        done()
      });
    });
    it("Should return 400, long message", function(done){
      var message = Array(422).join('o');
      request
      .post(url + "/postmsg")
      .set('Content-Type', 'application/json')
      .send({"to": "Username", "body": message, "from": "Username", "time": "13:37"})
      .end(function(err, res){
        res.status.should.equal(400);
        done();
      });
    });
  });
  describe("Getposts", function(){
    it("Should find user and return 200", function(done){
      request
      .post(url + "/getposts")
      .set('Content-Type', 'application/json')
      .send({"name": "Username"})
      .end(function(err, res){
        JSON.parse(res.text)[0]["body"].should.equal("A good message");
        res.status.should.equal(200);
        done();
      });
    });
    it("Should not find user and return 400", function(done){
      request
      .post(url + "/getposts")
      .set('Content-Type', 'application/json')
      .send({"name": "Waldo"})
      .end(function(err, res){
        res.status.should.equal(400);
        done()
      });
    });
    it("Should not find user, invalid name, and return 400", function(done){
      request
      .post(url + "/getposts")
      .set('Content-Type', 'application/json')
      .send({"name": "Waldo?!"})
      .end(function(err, res){
        res.status.should.equal(400);
        done()
      });
    });
  });
  describe("Getusers", function(){
    it("Should find all users and return 200", function(done){
      request
      .post(url + "/getusers")
      .end(function(err,res){
        res.body[0]["name"].should.equal("Username");
        done();
      });
    });
  });
  describe("Addfriend", function(){
    before(function(done){
      request
      .post(url + "/saveuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Newman", "pass": "secret"})
      .end(function(err, res){
        done();
      });
    });
    it("Should create a friendship and return status 200", function(done){
      request
      .post(url + "/addfriend")
      .set('Content-Type', 'application/json')
      .send({"friend": "Newman", "you": "Username"})
      .end(function(err,res){
        db.collection("users").find().toArray(function(err,docs){
          docs[0]["friends"][0].should.equal("Newman");
          docs[1]["friends"][0].should.equal("Username");
          done();
        });
      });
    });
    it("Should not find user and return 400", function(done){
      request
      .post(url + "/addfriend")
      .set('Content-Type', 'application/json')
      .send({"friend": "Noman", "you": "Notname"})
      .end(function(err,res){
        db.collection("users").find().toArray(function(err,docs){
          should(docs[0]["friends"]).not.ok;
          done();
        });
      });
    });
    it("Should see that user tries to add himself and return 400", function(done){
      request
      .post(url + "/addfriend")
      .set('Content-Type', 'application/json')
      .send({"friend": "Newman", "you": "Newman"})
      .end(function(err,res){
        res.status.should.equal(400);
        done();
      });
    });
  });
  describe("Getfriends", function(){
    it("Should return all friends of user and status 200", function(done){
      request
      .get(url + "/getfriends?name=" + "Username")
      .end(function(err, res){
        JSON.parse(res.text)[0].should.equal("Newman");
        done();
      });
    });
    before(function(done){
      request
      .post(url + "/saveuser")
      .set('Content-Type', 'application/json')
      .send({"name": "Forever", "pass": "Alone"})
      .end(function(err, res){
        done();
      });
    });
    it("Should return empty friends and status 200", function(done){
      request
      .get(url + "/getfriends?name=" + "Forever")
      .end(function(err, res){
        res.status.should.equal(200);
        res.text.should.equal('');
        done();
      });
    });
    it("Should return 400, user doesnt exist", function(done){
      request
      .get(url + "/getfriends?name=" + "Empty")
      .end(function(err, res){
        res.status.should.equal(400);
        done();
      });
    });
  });
  describe("Unfriend", function(){
    it("Should remove from friendlist and return 200", function(done){
      request
      .post(url + "/unfriend")
      .set('Content-Type', 'application/json')
      .send({"you": "Username", "friend": "Newman"})
      .end(function(err,res){
        db.collection("users").findOne({"name": "Username"}, function(err,docs){
          docs["friends"].length.should.equal(0);
          res.status.should.equal(200);
          done();
        });
      });
    });
    it("Should not find friend in list and return 400", function(done){
      request
      .post(url + "/unfriend")
      .set('Content-Type', 'application/json')
      .send({"you": "Username", "friend": "Newman"})
      .end(function(err,res){
        db.collection("users").findOne({"name": "Username"}, function(err,docs){
          docs["friends"].length.should.equal(0);
          res.status.should.equal(400);
          done();
        });
      });
    });
    it("Should not find user and return 400", function(done){
      request
      .post(url + "/unfriend")
      .set('Content-Type', 'application/json')
      .send({"you": "Nouser", "friend": "Newman"})
      .end(function(err,res){
        res.status.should.equal(400);
        done()
      });
    });
  });
  describe("Userexists", function(){
    it("Should find user and return 200 and true", function(done){
      request
      .post(url + "/userexists")
      .set('Content-Type', 'application/json')
      .send({"name": "Username"})
      .end(function(err,res){
        res.status.should.equal(200);
        res.text.should.equal("true");
        done();
      });
    });
    it("Should not find user and return 400 and false", function(done){
      request
      .post(url + "/userexists")
      .set('Content-Type', 'application/json')
      .send({"name": "Noname"})
      .end(function(err,res){
        res.status.should.equal(400);
        res.text.should.equal("false");
        done();
      });
    });

  });
  describe("Bad routes", function(){
    it('Should return status 404, unvalid route', function(done){
      request
      .post(url + "/thisisunvalid")
      .set('Content-Type', 'application/json')
      .send({"name": "notvalid"})
      .end(function(err,res){
        res.status.should.equal(404);
        done();
      });
    });

  });
});
