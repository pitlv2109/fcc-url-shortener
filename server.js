// Import dependencies
var express = require("express");
var mongodb = require("mongodb");
var fs = require("fs");

var app = express();
var mongoClient = mongodb.MongoClient;

// Database URL
//var dbUrl = "mongodb://localhost:27017/url-shortener";
var dbUrl = "mongodb://user1:123456789@ds029705.mlab.com:29705/url-shortener";

var urlJSON = {
  origional_url: "",
  shortened_url: "",
  key: ""
};

app.use (function(req, res) {
  var url = req.url.substring(1, req.url.toString().length);

	if (url === "favicon.ico") {
    	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    	res.end();
    	return;
  	}

  //  If request query is a url
  //    Check to see if the url is in the database
  //      If yes, retrieve it back to the user
  //      If no, insert to the database and retrieve it back
  if (url.indexOf(".") !== -1) {
    console.log("Got a shortener url request");

    if (url.indexOf("http://") === -1) {
      url = "http://" + url;
    } 

    // Connect to database
    mongoClient.connect(dbUrl, function (err, db) {
      if (err) throw err;

      // Connection established
      else {
        console.log("Database conncetion established");
        console.log("Finding " + url);

        // Get a reference to "urls" collection
        var collection = db.collection("urls");

        collection.find({origional_url: url}).toArray(function (err, result) {
          if (err) throw err;

          // If found
          else if (result.length) {
            console.log('Found:', result);
            res.json(result);
          } 
          // If not
          else {
            console.log('No document(s) found with defined "find" criteria!');
            console.log("Now inserting to the database");

            urlJSON.origional_url = url;
            urlJSON.key = "" + Math.floor(Math.random() * 1000000); // from 0 to 999999
            urlJSON.shortened_url = "https://fcc-pitlv2109-url-shortener.herokuapp.com/" + urlJSON.key;

            collection.insert(urlJSON, function (err, result) {
              if (err) throw err;
              else {
                console.log("Inserted!!!");
                res.json(urlJSON);
              }
              db.close();
            });
          }
      
        //Close connection
        db.close();
        });
      }
    });
  }

//814339
// bing 383890
  //  If request requery is a number
  //    Check to see if it's in the database
  //      If yes, retrieve it back to the user
  //      If no, print usage page
  else if (!isNaN(url)) {
    console.log("A number, will find in database");

    mongoClient.connect(dbUrl, function (err, db) {
      if (err) throw err;
      else {
        console.log("Database conncetion established");
        console.log("Finding " + url);

        // Get a reference to "urls" collection
        var collection = db.collection("urls");

        collection.find({key: url}).toArray(function (err, result) {
          if (err) throw err;
          // If found
          else if (result.length) {
            console.log('Found:', result);
            console.log("Transfering to " + result[0].origional_url);

            res.writeHead(301, {Location: result[0].origional_url});
            res.end();
            // open("" + result[0].origional_url); 
            // res.json(result);
          } 
          // If not
          else {
            console.log("Not Found! Printing usage page");
            var stream = fs.createReadStream("./public/index.html");
            stream.pipe(res);
          }
      
        //Close connection
        db.close();
        });
      }
    });
  }

  //TODO:
  //  If anything else, print usage page
  else {
    console.log("Invalid, printing usage page!");
    var stream = fs.createReadStream("./public/index.html");
    stream.pipe(res);
  }
  
  	//res.end("Hello");
});

//Use Heroku port
app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// app.listen(3000);
// console.log("Server running 3000");
