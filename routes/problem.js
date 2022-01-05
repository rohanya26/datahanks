var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const { text } = require("body-parser");
var problem = require("../models/problem")


router.get("/problems", function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        problem.find({ name: regex }, (err, problems) => {
            if (err) {
                console.log(err);
            } else {
                res.render(`problems/problems`, { problems: problems, currentUser: req.user });
            }
        });

    } else {
        // console.log(req.user);
        problem.find({}, (err, problems,) => {
            if (err) {
                console.log(err);
            } else {

                res.render(`problems/problems`, { problems: problems, currentUser: req.user });
            }
        })

    }
});





// router.post("/hanks", isLoggedIn,upload.single('image'), function(req, res) {
//     //get data from form and add to hanks array 
//     var name = req.body.name;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var link = req.body.link;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     var newhank = { name: name, image: image, description: desc, author: author, link: link }
//         //hanks.push(newhank);

//     hank.create(newhank, (err, newlyCreated) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(req.body);
//             res.redirect("/hanks")
//         }
//     });





// })

router.post("/problems", isLoggedIn, function (req, res) {

    // add cloudinary url for the image to the campground object under image property
    var name = req.body.name;

    var content = req.body.content;


    // add author to campground
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newproblem = { name: name, content: content, author: author }
    problem.create(newproblem, function (err, hank) {
        if (err) {
            // req.flash('error', err.message);
            return res.redirect('back');
        }
        res.redirect('/problems/' + hank.id);



    });
});



router.get("/problems/new", isLoggedIn, function (req, res) {
    res.render("problems/new");
})

router.get("/problems/:id", function (req, res) {
    problem.findById(req.params.id).populate("comments likes").exec(function (err, foundproblem) {
        if (err) {
            req.flash('error', 'Sorry, that Content does not exist!');
            console.log(err);
        } else {
            console.log(foundproblem);
            res.render("problems/show", { problem: foundproblem, currentUser: req.user })
        }
    });
})
router.post("/problems/:id/like", isLoggedIn, function (req, res) {
    problem.findById(req.params.id, function (err, foundproblem) {
        if (err) {
            console.log(err);
            return res.redirect("/problems");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundproblem.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundproblem.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundproblem.likes.push(req.user);
        }

        foundproblem.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/problems");
            }
            return res.redirect("/problems/");
        });
    });
});



//Edit
router.get("/problems/:id/edit", checkproblemOwnership, function (req, res) {
    problem.findById(req.params.id, function (err, foundproblem) {
        res.render("problems/edit", { problem: foundproblem });
    })

})


//Update
router.put("/problems/:id", checkproblemOwnership, function (req, res) {

    problem.findByIdAndUpdate(req.params.id, req.body.body, function (err, updatedproblem) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/hanks");

        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/problems/" + req.params.id)
        }
    })
})


//destroy
router.delete("/problems/:id", checkproblemOwnership, function (req, res) {
    problem.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/problems/");
        } else {
            // req.flash('error', campground.name + ' deleted!');
            res.redirect("/problems/")
        }
    })

})
// router.delete("/hanks/:id/comments/:comment_id", function(req, res) {
//     comment.findByIdAndRemove(req.params.comment_id, function(err) {
//         if (err) {
//             res.redirect("back");
//         } else {
//             res.redirect("/hanks/" + req.params.id);
//         }
//     })
// })



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkproblemOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        problem.findById(req.params.id, function (err, problem) {

            if (problem.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();

            } else {
                res.redirect("back");
            }

        })

    } else {
        // console.log("YOU NEED TO BE LOGGED IN TO DO THAT!!!");
        // res.send("YOU NEED TO BE LOGGED IN TO DO THAT!!!");
        res.redirect("back");
    }
}


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");

};
module.exports = router;
