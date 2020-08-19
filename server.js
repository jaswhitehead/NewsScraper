// Using the tools and techniques you learned so far,
// you will scrape a website of your choice, then place the data
// in a MongoDB database. Be sure to make the database and collection
// before running this exercise.

// Consult the assignment files from earlier in class
// if you need a refresher on Cheerio.

// Dependencies
var express = require("express");
// var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
const { text } = require("express");

// Initialize Express
var app = express();

var PORT = process.env.PORT || 3000;

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
//db.on("error", function(error) {
//  console.log("Database Error:", error);
// }); 

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// TODO: make two more routes

// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)
app.get("/all", function(req, res) {
  db.scrapedData.find({}, function(error, data){
    if(error) {
      console.log(error);
    } 
    else {
      res.json(data);
    }
  })
})

// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?

app.get("/scrape", function(req, res) {
  axios.get("https://athlonsports.com/tag/college-football").then(
    function(reponse){
      var $ = cheerio.load(response.data);

      $("field-content").each(function(i,element){

        var result = {};

        result.title = $(this)
        .children("a")
        .text();
        result.link = $(this)
        .children("a")
        .attr("href");

        db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});


require("./routes/htmlRoutes")(app);

/* -/-/-/-/-/-/-/-/-/-/-/-/- */


app.listen(PORT, function() {
  console.log("listening on port: " + PORT);
});
