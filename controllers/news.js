var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// A GET route for scraping the BBC website
app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with axios
    axios.get("https://www.bbc.com/news/world").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        // Now, we grab every buzzard-item within a div class, and do the following:
        $("buzzard-item").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text, summary, and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("h3")
                .text();
            result.summary = $(this)
                .children("p")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
        /// Send a message to the client
        res.send("Scrape Complete");
    });
});

//Render index and populate comments
app.get("/", function (req, res) {
    db.Article.find()
        .sort({ time: -1 })
        .populate("comments.comment")
        .then(function (dbArticle) {
            res.render("index", { result: dbArticle });
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function (req, res) {
    // Create a new comment and pass the req.body to the entry
    db.Comment.create(req.body)
        .then(function (dbComment) {
            // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: { comment: dbComment._id } } }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for deleting a comment
app.get("/comments/:id/:articleid", function (req, res) {
    console.log(req.body);
    db.Article.findOneAndUpdate(
        { _id: req.params.articleid },
        { $pull: { comments: { comment: req.params.id } } }
    )
        .then(function (data) {
            console.log(data);
            res.json(data);
        })
        .catch(function (err) {
            res.json(err);
        });
});