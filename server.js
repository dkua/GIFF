// Dependencies
var express = require("express"),
    env = (function() {
      var Habitat = require("habitat");
      Habitat.load();
      return new Habitat();
    }()),
    app = express();
var orm = require("orm");
var http = require("http");
var SQLiteStore = require("connect-sqlite3")(express);


// Variables
var databaseFile = "database.sqlite3";


// Configurations
app.configure(function() {
  app.use("/static", express.static(__dirname + "/static"));
  app.set("port", process.env.PORT || 41156);
  app.use(express.cookieParser());
  app.use(express.session({
    store: new SQLiteStore,
    secret: env.get("SECRET"),
    cookie: {
      maxAge: 2678400000 // 31 day limit
    }
  }));
  // Database Setup
  app.use(orm.express("sqlite://" + databaseFile, {
    define: function(db, models, next) {
      models.vote = db.define("vote", {
        clipID: String,
        value: Number,
        sessionID: String
      });
      models.vote.getVote = function(clipID, sessionID, callback) {
        this.find({ clipID: clipID, sessionID: sessionID }, callback);
      };
      models.vote.getAllVotes = function(clipID, value, callback) {
        this.find({ clipID: clipID, value: value }, callback);
      };
      models.vote.setVote = function(clipID, value, sessionID, callback) {
        this.create([{ clipID: clipID, value: value, sessionID: sessionID }], callback);
      };

      db.sync(function(err) {
        if (err) throw err;
        console.log("Database Synced");
      });
      next();
    }
  }));
  app.use(app.router);
});


var vote = function(req, value, fn) {
  var result = { success: false };
  req.models.vote.getVote(req.params.id, req.sessionID, function(err, voteArray) {
    var currentVote = voteArray[0];
    if (typeof(currentVote) !== "undefined") {
      if (currentVote.value == value) {
        fn(false);
      } else {
        currentVote.save({ value: value }, function(err) {
          fn(true);
        });
      }
    } else {
      req.models.vote.setVote(req.params.id, value, req.sessionID, function(err, vote) {
        if (err) {
          fn(false);
        } else {
          fn(true);
        }
      });
    }
  });
}


// Index
app.get("/", function(req, res) {
  res.type("text/html");
  res.sendfile("./views/index.html");
});


// Vote
app.get("/clips/:id/vote", function(req, res) {
  req.models.vote.getVote(req.params.id, req.sessionID, function(err, voteArray) {
    var result = { value: 0 };
    var vote = voteArray[0];
    if (typeof(vote) !== "undefined") {
      result.value = vote.value;
    }
    res.json(result);
  });
});

app.get("/clips/:id/votes", function(req, res) {
  req.models.vote.getAllVotes(req.params.id, 1, function(err, upvotes) {
    req.models.vote.getVote(req.params.id, req.sessionID, function(err, voteArray) {
      var result = {}
      var vote = voteArray[0];
      if (typeof(vote) !== "undefined") {
        result.voted = vote.value;
      } else {
        result.voted = 0;
      }
      result.upvotes = upvotes.length;
      req.models.vote.getAllVotes(req.params.id, -1, function(err, downvotes) {
        result.downvotes = downvotes.length;
        res.json(result);
      });
    });
  });
});


// Upvotes
app.get("/clips/:id/upvote", function(req, res) {
  req.models.vote.getAllVotes(req.params.id, 1, function(err, upvotes) {
    numOfUpvotes = { upvotes: upvotes.length }
    res.json(numOfUpvotes);
  });
});

app.post("/clips/:id/upvote", function(req, res) {
  vote(req, 1, function(result) {
    console.log("Upvote for " + req.params.id);
    res.json({ success: result });
  });
});


// Downvotes
app.get("/clips/:id/downvote", function(req, res) {
  req.models.vote.getAllVotes(req.params.id, -1, function(err, downvotes) {
    numOfDownvotes = { downvotes: downvotes.length }
    res.json(numOfDownvotes);
  });
});

app.post("/clips/:id/downvote", function(req, res) {
  vote(req, -1, function(result) {
    console.log("Downvote for " + req.params.id);
    res.json({ success: result });
  });
});


// 404 Handler
app.get("*", function(req, res) {
  res.send("404 Not Found\n Whatttt?!?!", 404);
});


// Start server
app.listen(app.get("port"));
console.log("Server running on port %s", app.get("port"));
