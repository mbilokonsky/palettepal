var fs = require('fs');
var http = require('http');
var Canvas = require('canvas');
var Image = Canvas.Image;

var request = require('request');
var Twit = require("twit");
var ColorThief = require("color-thief");
var colorThief = new ColorThief();

var CONSUMER_KEY = process.env.PAL_CONSUMER_KEY;
var CONSUMER_SECRET = process.env.PAL_CONSUMER_SECRET;
var ACCESS_TOKEN = process.env.PAL_ACCESS_TOKEN;
var ACCESS_TOKEN_SECRET = process.env.PAL_ACCESS_SECRET;

if (!CONSUMER_KEY || ! CONSUMER_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
  console.error("You failed to provide the expected environment configuration variables.")
}

var T = new Twit({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  access_token: ACCESS_TOKEN,
  access_token_secret: ACCESS_TOKEN_SECRET
});

var stream = T.stream("statuses/filter", { track: '@palettepal' });
stream.on('tweet', function(tweet) {
  var source_tweet = tweet.id_str;
  var username = "@" + tweet.user.screen_name;
  if (!tweet.entities.media) { tweet.entities.media = []; }

  var photo_url = tweet.entities.media.reduce(function(acc, val) {
    if (acc) { return acc; }
    if (val.type === "photo") {
      return val.media_url;
    }

  }, null);

  if (photo_url) {
    console.log("User " + username + " wants me to look at: ", photo_url);
    var req = http.request(photo_url, function(res) {
      res.setEncoding('binary');
      var data = '';

      res.on('data', function(chunk) {
        data += chunk;
      });

      res.on('end', function() {
        var filename = "images/" + username + "_" + Date.now();
        fs.writeFile(filename, data, 'binary', function(err) {
          var palette = colorThief.getPalette(__dirname + "/" + filename, 5);
          fs.unlink(filename);

          var output = fs.createWriteStream(__dirname + "/" + filename + "_out.png");

          var canvas = new Canvas(500, 100);
          var ctx = canvas.getContext('2d');

          palette.forEach(function(color, index) {
            ctx.fillStyle = 'rgb(' + color[0] + "," + color[1] + "," + color[2] +")";
            ctx.fillRect(index * 100, 0, 100, 100);

            ctx.font = "15px Impact";
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText("#" + color[0].toString(16) + color[1].toString(16) + color[2].toString(16), (index * 100) + 5, 95);
          })

          var stream = canvas.pngStream();
          stream.on('data', function(chunk) {
            output.write(chunk);
          });

          stream.on('end', function() {
            setTimeout(function() {
              send_response(filename, username, source_tweet);
            }, 100);
          });
        })

      })
    });

    function send_response(filename, username, source_tweet) {
      var b64 = fs.readFileSync(__dirname + "/" + filename +"_out.png", { encoding: 'base64' });

      T.post('media/upload', {media_data: b64}, function(err, data, response) {
        if (err) { return console.error("Error uploading media", err); }
        var mediaIdStr = data.media_id_string;
        fs.unlink(filename + "_out.png");

        T.post('statuses/update', {in_reply_to_status_id: source_tweet, status: username, media_ids: [mediaIdStr]}, function(err, data, response) {
          if (err) { console.error(err); }
          else {console.log("[" + username + "] - replied successfully.")};
        });
      })
    }

    req.on('error', function(err) {
      console.log("image load error", err);
    });

    req.end();
  } else {

    if (tweet.in_reply_to_status_id) {
      // this is reply to a tweet I've already sent, ignore it - we don't want a conversation.
    } else {
      T.post('statuses/update', {in_reply_to_status_id: source_tweet, status: "Please send me a tweet with a photo attached as twitter media to get a palette."}, function(err, data, response) {
        if (err) { console.error(err); }
        else {console.log("[" + username + "] has received remedial instructions.")};
      });
    }
  }
});

console.log("Palette Pal is running!");