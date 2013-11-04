// Dependencies
var express = require("express");
var orm = require("orm");
var http = require("http");
var app = express();

// Variables
var databaseFile = "database.sqlite3";
var port = 41156;
var address = "localhost";
var vgOptions = {
  host: "api.videogami.co",
  port: 80
};


// Database Setup
app.use(orm.express("sqlite://" + databaseFile, {
  define: function(db, models, next) {
    models.vote = db.define("vote", {
      clipID: String,
      vote: Number
    });
    models.vote.getVotes = function(clipID, value, callback) {
      this.find({ clipID: clipID, vote: value }, callback);
    };
    models.vote.setVote = function(clipID, value, callback) {
      this.create([{ clipID: clipID, vote: value }], callback);
    };

    db.sync(function(err) {
      if (err) throw err;
      console.log("Database Synced");
    });
    next();
  }
}));


// Index
app.get("/", function(req, res) {
  res.type("text/html");
  res.sendfile("./views/index.html");
});


// Clips
app.get("/clips", function(req, res) {

});

app.get("/clips/:id", function(req, res) {
  res.type("text/json");
});


// Upvotes
app.get("/clips/:id/upvote", function(req, res) {
  req.models.vote.getVotes(req.params.id, 1, function(err, upvotes) {
    numOfUpvotes = { upvotes: upvotes.length }
    res.json(numOfUpvotes);
  });
});

app.post("/clips/:id/upvote", function(req, res) {
  req.models.vote.setVote(req.params.id, 1, function(err, upvotes) {
    var upvote = upvotes[0];
    res.json(upvote);
  });
});


// Downvotes
app.get("/clips/:id/downvote", function(req, res) {
  req.models.vote.getVotes(req.params.id, -1, function(err, downvotes) {
    numOfDownvotes = { downvotes: downvotes.length }
    res.json(numOfDownvotes);
  });
});

app.post("/clips/:id/downvote", function(req, res) {
  req.models.vote.setVote(req.params.id, -1, function(err, downvotes) {
    var downvote = downvotes[0];
    res.json(downvote);
  });
});


// 404 Handler
app.get("*", function(req, res) {
  res.send("404 Not Found\n Whatttt?!?!", 404);
});


// Start server
app.listen(port, address);
console.log("Server running at %s:%d", address, port);
