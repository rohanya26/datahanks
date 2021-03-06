var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const { text } = require("body-parser");
const request = require("request");

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

router.get("/hanks", isLoggedIn, function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        hank.find({ name: regex }, (err, hanks) => {
            if (err) {
                console.log(err);
            } else {
                request("https://newsapi.org/v2/top-headlines?country=in&category=science&apiKey=9f2635ef8e1a400cbb1d80d0a7c360ea", (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        var data = JSON.parse(body)

                        res.render(`hanks/hanks`, { hanks: hanks, currentUser: req.user, data: data });
                    }
                })
            }
        });

    } else {
        // console.log(req.user);
        hank.find({}, (err, hanks,) => {
            if (err) {
                console.log(err);
            } else {
                request("https://newsapi.org/v2/top-headlines?country=in&category=science&apiKey=9f2635ef8e1a400cbb1d80d0a7c360ea", (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        var data = JSON.parse(body)

                        res.render(`hanks/hanks`, { hanks: hanks, currentUser: req.user, data: data });
                    }
                })


            }
        })

    }
});






router.post("/hanks", isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {

        var name = req.body.name;
        var image = result.secure_url;
        var desc = req.body.description;

        var snippet = desc.substring(0, 100);


        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newhank = { name: name, image: image, description: desc, author: author, snippet: snippet }
        hank.create(newhank, function (err, hank) {
            if (err) {
                // req.flash('error', err.message);
                return res.redirect('back');
            }
            console.log(snippet)
            res.redirect('/hanks/' + hank.id);
        });
    });

})

router.get("/hanks/new", isLoggedIn, function (req, res) {
    res.render("hanks/new");
})

router.get("/hanks/:id", isLoggedIn, function (req, res) {
    hank.findById(req.params.id).populate("comments likes").exec(function (err, foundhank) {
        if (err) {
            req.flash('error', 'Sorry, that Content does not exist!');
            console.log(err);
        } else {
            console.log(foundhank);
            res.render("hanks/show", { hank: foundhank, currentUser: req.user })
        }
    });
})
router.post("/hanks/:id/like", isLoggedIn, function (req, res) {
    hank.findById(req.params.id, function (err, foundhank) {
        if (err) {
            console.log(err);
            return res.redirect("/hanks");
        }


        var foundUserLike = foundhank.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundhank.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundhank.likes.push(req.user);
        }

        foundhank.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/hanks");
            }
            return res.redirect("/hanks/" + req.params.id);
        });
    });
});



//Edit
router.get("/hanks/:id/edit", checkHankOwnership, function (req, res) {
    hank.findById(req.params.id, function (err, foundhank) {
        res.render("hanks/edit", { hank: foundhank });
    })

})


//Update
router.put("/hanks/:id", checkHankOwnership, function (req, res) {

    hank.findByIdAndUpdate(req.params.id, req.body.hank, function (err, updatedhank) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/hanks");

        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/hanks/" + req.params.id)
        }
    })
})


//destroy
router.delete("/hanks/:id", checkHankOwnership, function (req, res) {
    hank.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/hanks/");
        } else {

            res.redirect("/hanks/")
        }
    })

})

router.get("/story/:title", (req, res) => {
    var para = req.params.title;
    request("https://newsapi.org/v2/top-headlines?country=in&category=science&apiKey=9f2635ef8e1a400cbb1d80d0a7c360ea", (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            console.log(data)
            data.articles.forEach((chundi) => {
                if (chundi.title == para) {
                    res.render(`story`, { currentUser: req.user, data: data, chundi: chundi });

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

function checkHankOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        hank.findById(req.params.id, function (err, hank) {

            if (hank.author.id.equals(req.user._id) || req.user.isAdmin) {
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
