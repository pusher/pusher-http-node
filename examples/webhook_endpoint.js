var express = require("express");
var Pusher = require("../lib/pusher");

// provide auth details via the PUSHER_URL environment variable
var pusher = new Pusher({ url: process.env["PUSHER_URL"]});

var app = express();
app.use(function(req, res, next) {
  req.rawBody = "";
  req.setEncoding("utf8");

  req.on("data", function(chunk) {
    req.rawBody += chunk;
  });

  req.on("end", function() {
    next();
  });
});

app.post("/webhook", function(req, res){
  var webhook = pusher.webhook(req);
  console.log("data:", webhook.getData());
  console.log("events:", webhook.getEvents());
  console.log("time:", webhook.getTime());
  console.log("valid:", webhook.isValid());
  res.send("OK");
});

app.listen(3000);
