var mongoose = require("mongoose");
var hank = require("./models/hank");
var Comment = require("./models/comment");


var data = [

    ]
    // { name: "Data structures", image: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NHx8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    // { name: "signal processing", image: "https://images.unsplash.com/photo-1599727277707-b429a4994c15?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjV8fHNpZ25hbCUyMHByb2Nlc3N8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    // { name: "Electronic circuits", image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NHx8ZWxlY3Ryb25pY3N8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }



function seedDB() {
    // hank.remove({}, function(err) {
    //     if (err) {
    //         console.log(err);

    //     }
    // console.log("removed hank!");

    data.forEach(function(seed) {
        hank.create(seed, function(err, hank) {
            if (err) {
                console.log(err)
            } else {
                console.log("added");
                Comment.create({
                    text: "this subject is very useful",
                    author: "homer"
                }, function(err, comment) {
                    if (err) {
                        console.log(err);

                    } else {
                        // console.log(typeof(comment));
                        hank.comments.push(comment);
                        hank.save();
                        console.log("created a new comment");

                    }

                });
            }
        });
    });


}

module.exports = seedDB;