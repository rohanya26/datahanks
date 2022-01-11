var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const { text } = require("body-parser");
var blog = require("../models/blog");
require("dotenv").config();


var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});


router.get("/blogs", isLoggedIn, function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        blog.find({ name: regex }, (err, blogs) => {
            if (err) {
                console.log(err);
            } else {
                res.render(`blogs/blogs`, { blogs: blogs, currentUser: req.user });
            }
        });

    } else {
        // console.log(req.user);
        blog.find({}, (err, blogs,) => {
            if (err) {
                console.log(err);
            } else {

                res.render(`blogs/blogs`, { blogs: blogs, currentUser: req.user });
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

router.post("/blogs", isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {

        // add cloudinary url for the image to the campground object under image property
        var name = req.body.name;
        var image = result.secure_url;
        var content = req.body.content;


        // add author to campground
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newblog = { name: name, content: content, image: image, author: author }
        blog.create(newblog, function (err, blog) {
            if (err) {
                // req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/blogs/' + blog.id);



        });
    });
});



router.get("/blogs/new", isLoggedIn, function (req, res) {
    res.render("blogs/new");
})

router.get("/blogs/:id", isLoggedIn, function (req, res) {
    blog.findById(req.params.id).populate("comments likes").exec(function (err, foundblog) {
        if (err) {
            req.flash('error', 'Sorry, that Content does not exist!');
            console.log(err);
        } else {
            console.log(foundblog);
            res.render("blogs/show", { blog: foundblog, currentUser: req.user })
        }
    });
})
router.post("/blogs/:id/like", isLoggedIn, function (req, res) {
    blog.findById(req.params.id, function (err, foundblog) {
        if (err) {
            console.log(err);
            return res.redirect("/blogs");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundblog.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundblog.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundblog.likes.push(req.user);
        }

        foundblog.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/blogs");
            }
            return res.redirect("/blogs/" + req.params.id);
        });
    });
});



//Edit
router.get("/blogs/:id/edit", checkBlogOwnership, function (req, res) {
    blog.findById(req.params.id, function (err, foundblog) {
        res.render("blogs/edit", { blog: foundblog });
    })

})


//Update
router.put("/blogs/:id", checkBlogOwnership, function (req, res) {

    blog.findByIdAndUpdate(req.params.id, req.body.body, function (err, updatedblog) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/hanks");

        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/blogs/" + req.params.id)
        }
    })
})


//destroy
router.delete("/blogs/:id", checkBlogOwnership, function (req, res) {
    blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs/");
        } else {
            // req.flash('error', campground.name + ' deleted!');
            res.redirect("/blogs/")
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

function checkBlogOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        blog.findById(req.params.id, function (err, blog) {

            if (blog.author.id.equals(req.user._id) || req.user.isAdmin) {
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
