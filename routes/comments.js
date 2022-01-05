var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const comment = require("../models/comment");
const blog = require('../models/blog')
const material = require('../models/material')
const problem = require('../models/problem')

//=================
router.get("/hanks/:id/comments/new", isLoggedIn, function (req, res) {

    hank.findById(req.params.id, function (err, hank) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { hank: hank });

        }
    })


})

router.get("/hanks/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res) {
    comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { hank_id: req.params.id, comment: foundComment });

        }
    })

})
//update
router.put("/hanks/:id/comments/:comment_id", function (req, res) {
    //res.send("you hit the update");
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/hanks/" + req.params.id);
        }
    })
})

///delete
router.delete("/hanks/:id/comments/:comment_id", function (req, res) {
    comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('error', 'Comment deleted!');
            res.redirect("/hanks/" + req.params.id);
        }
    })
})

router.post("/hanks/:id/comments", isLoggedIn, function (req, res) {
    hank.findById(req.params.id, function (err, hank) {
        if (err) {
            console.log(err);
            res.redirect("/hanks");
        } else {
            // console.log(req.body.Comment);
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    ///
                    comment.save();
                    hank.comments.push(comment);
                    hank.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect("/hanks/" + hank._id);
                }
            })

        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        comment.findById(req.params.comment_id, function (err, comment) {

            if (comment.author.id.equals(req.user._id) || req.user) {
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
//=================================================================================================================================
//material comments
router.get("/materials/:id/comments/new", isLoggedIn, function (req, res) {

    material.findById(req.params.id, function (err, material) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/material/new", { material: material });

        }
    })


})

router.get("/materials/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res) {
    comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/material/edit", { material_id: req.params.id, comment: foundComment });

        }
    })

})
//update
router.put("/materials/:id/comments/:comment_id", function (req, res) {
    //res.send("you hit the update");
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/materials/" + req.params.id);
        }
    })
})

///delete
router.delete("/materials/:id/comments/:comment_id", function (req, res) {
    comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('error', 'Comment deleted!');
            res.redirect("/materials/" + req.params.id);
        }
    })
})

router.post("/materials/:id/comments", isLoggedIn, function (req, res) {
    material.findById(req.params.id, function (err, material) {
        if (err) {
            console.log(err);
            res.redirect("/materials");
        } else {
            // console.log(req.body.Comment);
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    ///
                    comment.save();
                    material.comments.push(comment);
                    material.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect("/materials/" + material._id);
                }
            })

        }
    })
})

//---------------------------------------------------------------------------------------------
//blogcomments
router.get("/blogs/:id/comments/new", isLoggedIn, function (req, res) {

    blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/blog/new", { blog: blog });

        }
    })


})

router.get("/blogs/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res) {
    comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/blog/edit", { blog_id: req.params.id, comment: foundComment });

        }
    })

})
//update
router.put("/hanks/:id/comments/:comment_id", function (req, res) {
    //res.send("you hit the update");
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

///delete
router.delete("/blogs/:id/comments/:comment_id", function (req, res) {
    comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('error', 'Comment deleted!');
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

router.post("/blogs/:id/comments", isLoggedIn, function (req, res) {
    blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            // console.log(req.body.Comment);
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    ///
                    comment.save();
                    blog.comments.push(comment);
                    blog.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect("/blogs/" + blog._id);
                }
            })

        }
    })
})
//===============================================================
//problemSolutions
router.get("/problems/:id/comments/new", isLoggedIn, function (req, res) {

    problem.findById(req.params.id, function (err, problem) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/problem/new", { problem: problem });

        }
    })


})

router.get("/problems/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res) {
    comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/problem/edit", { hank_id: req.params.id, comment: foundComment });

        }
    })

})
//update
router.put("/problems/:id/comments/:comment_id", function (req, res) {
    //res.send("you hit the update");
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/problems/" + req.params.id);
        }
    })
})

///delete
router.delete("/problems/:id/comments/:comment_id", function (req, res) {
    comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('error', 'Comment deleted!');
            res.redirect("/problems/" + req.params.id);
        }
    })
})

router.post("/problems/:id/comments", isLoggedIn, function (req, res) {
    problem.findById(req.params.id, function (err, problem) {
        if (err) {
            console.log(err);
            res.redirect("/problems");
        } else {
            // console.log(req.body.Comment);
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    ///
                    comment.save();
                    problem.comments.push(comment);
                    problem.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect("/problems/" + problem._id);
                }
            })

        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        comment.findById(req.params.comment_id, function (err, comment) {

            if (comment.author.id.equals(req.user._id) || req.user) {
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

module.exports = router;