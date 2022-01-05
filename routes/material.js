var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const { text } = require("body-parser");
const request = require("request");
const material = require('../models/material')

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var fileFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|docx|pptx)$/i)) {
        return cb(null, true);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: fileFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dgqsspuik',
    api_key: '769591237185812',
    api_secret: '2LbwQJITy-6ctacKqWLSqLJDAKw'
});

router.get("/materials", function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        material.find({ name: regex }, (err, materials) => {
            if (err) {
                console.log(err);
            } else {
                res.render(`materials/hanks`, { materials: materials, currentUser: req.user });
            }
        });

    } else {
        // console.log(req.user);
        material.find({}, (err, materials,) => {
            if (err) {
                console.log(err);
            } else {

                res.render(`materials/materials`, { materials: materials, currentUser: req.user });
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

router.post("/materials", isLoggedIn, upload.single('recfile'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {
        // add cloudinary url for the image to the campground object under image property
        var name = req.body.name;
        var recfile = result.secure_url;
        var desc = req.body.description;

        // add author to campground
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newhank = { name: name, recfile: recfile, description: desc, author: author }
        material.create(newhank, function (err, material) {
            if (err) {
                // req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/materials/' + material.id);

        });
    });

})

router.get("/materials/new", isLoggedIn, function (req, res) {
    res.render("materials/new");
})

router.get("/materials/:id", function (req, res) {
    material.findById(req.params.id).populate("comments likes").exec(function (err, foundmaterial) {
        if (err) {
            req.flash('error', 'Sorry, that Content does not exist!');
            console.log(err);
        } else {
            console.log(foundmaterial);
            res.render("materials/show", { material: foundmaterial })
        }
    });
})
router.post("/materials/:id/like", isLoggedIn, function (req, res) {
    material.findById(req.params.id, function (err, foundmaterial) {
        if (err) {
            console.log(err);
            return res.redirect("/materials");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundmaterial.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundmaterial.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundmaterial.likes.push(req.user);
        }

        foundmaterial.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/materials");
            }
            return res.redirect("/materials/");
        });
    });
});



//Edit
router.get("/materials/:id/edit", checkHankOwnership, function (req, res) {
    material.findById(req.params.id, function (err, foundmaterial) {
        res.render("hanks/edit", { material: foundmaterial });
    })

})


//Update
router.put("/materials/:id", checkHankOwnership, function (req, res) {

    material.findByIdAndUpdate(req.params.id, req.body.material, function (err, updatedmaterial) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/materials");

        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/materials/" + req.params.id)
        }
    })
})


//destroy
router.delete("/materials/:id", checkHankOwnership, function (req, res) {
    material.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/materials/");
        } else {
            // req.flash('error', campground.name + ' deleted!');
            res.redirect("/materials/")
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

function checkHankOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        material.findById(req.params.id, function (err, material) {

            if (material.author.id.equals(req.user._id) || req.user.isAdmin) {
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
