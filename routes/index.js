var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
var passport = require("passport");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var flash = require("connect-flash");
var multer = require('multer');
var request = require('request')
var blog = require("../models/blog");
var material = require('../models/material')

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
  cloud_name: 'dzycsiryh',
  api_key: '593438391767231',
  api_secret: 'ZX4WYUGGKSavV3A5ERHl5-sM3wc'
});

router.get("/", function (req, res) {
  res.render("landing");
});
//authentication route

//show register form
router.get("/register", function (req, res) {
  res.render("register");
});

router.post("/register", upload.single('image'), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {


    let username = req.body.username,
      FirstName = req.body.FirstName,
      LastName = req.body.LastName,
      email = req.body.email,
      image = result.secure_url,
      gitHubUsername = req.body.gitHubUsername,
      facebook = req.body.facebook,
      instagram = req.body.instagram,
      linkedIn = req.body.linkedIn,
      college = req.body.college,
      bio = req.body.bio,
      profession = req.body.profession
    var data = req.body.skills
    const skills = data.split(',')


    const newUser = {
      username: username,
      FirstName: FirstName,
      LastName: LastName,
      email: email,
      image: image,
      gitHubUsername: gitHubUsername,
      facebook: facebook,
      instagram: instagram,
      linkedIn: linkedIn,
      skills: skills,
      college: college,
      bio: bio,
      profession: profession
    }


    if (req.body.adminCode === "Web_Ed123") {
      newUser.isAdmin = true;
    }
    console.log(newUser);
    user.register(newUser, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        return res.render("register");
      }
      passport.authenticate("local")(req, res, function () {
        req.flash(
          "success",
          "Successfully Signed Up! Nice to meet you " + req.body.username
        );
        res.redirect("/hanks");
      });
    });
  })
});

//shoow login
router.get("/login", function (req, res) {
  res.render("login");
});
//app.post("/login", middleware, callback)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hanks",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome to Web_Ed!",
  }),
  function (req, res) {
    //res.send("LOGIN logic happens here")
  }
);

//Logout
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "See you later!");
  res.redirect("/hanks");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
function checkProfileOwnership(req, res, next) {
  user.findById(req.params.user_id, function (err, foundUser) {
    if (err || !foundUser) {
      res.redirect("/hanks");
    } else if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
      req.user = foundUser;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/hanks/" + req.params.user_id);
    }
  });
}

// forgot password
router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.post("/forgot", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        user.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "huntethan541@gmail.com",
            pass: 'smoothcriminal',
          },
        });
        var mailOptions = {
          to: user.email,
          from: "huntethan541@gmail.com",
          subject: "Node.js Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          console.log("mail sent");
          req.flash(
            "success",
            "An e-mail has been sent to " +
            user.email +
            " with further instructions."
          );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

router.get("/reset/:token", function (req, res) {
  user.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});

router.post("/reset/:token", function (req, res) {
  async.waterfall(
    [
      function (done) {
        user.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function (err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                  req.logIn(user, function (err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect("back");
            }
          }
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "huntethan541@gmail.com",
            pass: 'smoothcriminal',
          },
        });
        var mailOptions = {
          to: user.email,
          from: "huntethan541@gmail.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      },
    ],
    function (err) {
      res.redirect("/hanks");
    }
  );
});

// USER PROFILE
router.get("/users/:id", function (req, res) {
  user.findById(req.params.id, function (err, foundUser) {
    let posts = [];
    let studies = [];
    blog.find().where("author.id").equals(foundUser._id).exec(function (err, blogs) {
      if (err) {
        console.log(err)
      } else {

        posts.push(blogs)
      }
    })
    material.find().where("author.id").equals(foundUser._id).exec(function (err, materials) {
      if (err) {
        console.log(err)
      } else {

        studies.push(materials)
      }
    })



    // console.log(foundUser)
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    hank
      .find()
      .where("author.id")
      .equals(foundUser._id)
      .exec(function (err, hanks) {

        if (err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        } else {

          const options = {
            url: "https://api.github.com/users/" + foundUser.gitHubUsername + '/repos?sort=created:asc',
            headers: {
              'User-Agent': 'request'
            }
            ,
            authorization: "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"
          }
          // const url = "https://api.github.com/users/" + foundUser.gitHubUsername + '/repos?sort=created:asc';
          request(options, (error, response, body) => {
            // const headers = {
            //   authorization: "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",
            // }
            // console.log(body)
            var data = JSON.parse(body)
            // console.log(data)
            for (let i of data) {
              console.log(i.name)
            }

            res.render("users/show", { user: foundUser, hanks: hanks, data: data, posts: posts, studies: studies, currentUser: req.user });
          })
          // if (!error && response.statusCode == 200) {
          //   console.log(body)

          //   console.log(hi)










        }
      });
  });
});

//Edit Profile
router.get(
  "/users/:id/edit",
  isLoggedIn,
  checkProfileOwnership,
  function (req, res) {
    hank.findById(req.params.id, function (err, founduser) {
      if (err) {
        return res.redirect("/");
      } else {
        res.render("users/edit", { user: founduser });
      }
    });
  }
);

router.put("users/:id", checkProfileOwnership, (req, res) => {
  user.findByIdAndUpdate(req.params.id, req.body.user, (err, updateduser) => {
    if (err) {
      res.redirect("/users/:id");
    } else {
      res.redirect("/users/" + req.params.id);
    }
  });
});

module.exports = router;
