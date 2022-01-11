var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var hank = require("./models/hank");
var Comment = require("./models/comment");
var user = require("./models/user");
var blog = require("./models/blog");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStratey = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");


require("dotenv").config();
const dburl = process.env.DB_URL;
var commentRoutes = require("./routes/comments");
var hankRoutes = require("./routes/hanks");
var indexRoutes = require("./routes/index");
var blogRoutes = require("./routes/blog");
var materialRoutes = require("./routes/material")
var problemRoutes = require('./routes/problem')
seedDB();
mongoose.connect("mongodb://localhost/Web_Ed", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use(flash());
app.use(
  require("express-session")({
    secret: "Hala Madrid y nada mass!!",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratey(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(indexRoutes);
app.use(hankRoutes);
app.use(commentRoutes);
app.use(blogRoutes);
app.use(materialRoutes);
app.use(problemRoutes)

// hank.create({
//         name: "Bilal Gorguin",
//         image: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NHx8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

//     }, function(err, hank) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("Newly created library");
//             console.log(hank)
//         }
//     }

// );
// var hanks = [
//     { name: "Data structures", image: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NHx8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }, { name: "signal processing", image: "https://images.unsplash.com/photo-1599727277707-b429a4994c15?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjV8fHNpZ25hbCUyMHByb2Nlc3N8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }, { name: "Electronic circuits", image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NHx8ZWxlY3Ryb25pY3N8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
// ]

// app.get("/", function(req, res) {
//     res.render("landing");
// })

// app.get("/hanks", function(req, res) {
//     // console.log(req.user);
//     hank.find({}, (err, hanks) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render(`hanks/hanks`, { hanks: hanks, currentUser: req.user });
//         }
//     });

// })

// app.post("/hanks", function(req, res) {
//     //get data from form and add to hanks array
//     var name = req.body.name;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var newhank = { name: name, image: image, description: desc }
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

// app.get("/hanks/new", function(req, res) {
//     res.render("hanks/new");
// })

// app.get("/hanks/:id", function(req, res) {
//     hank.findById(req.params.id).populate("comments").exec(function(err, foundhank) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(foundhank);
//             res.render("hanks/show", { hank: foundhank })
//         }
//     });
// })

// //=================
// app.get("/hanks/:id/comments/new", isLoggedIn, function(req, res) {

//     hank.findById(req.params.id, function(err, hank) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render("comments/new", { hank: hank });

//         }
//     })

// })

// app.post("/hanks/:id/comments", isLoggedIn, function(req, res) {
//     hank.findById(req.params.id, function(err, hank) {
//         if (err) {
//             console.log(err);
//             res.redirect("/hanks");
//         } else {
//             // console.log(req.body.Comment);
//             Comment.create(req.body.comment, function(err, comment) {
//                 if (err) {
//                     console.log(err)
//                 } else {
//                     hank.comments.push(comment);
//                     hank.save();
//                     res.redirect("/hanks/" + hank._id);
//                 }
//             })

//         }
//     })
// })

// //authentication route

// //show register form
// app.get("/register", function(req, res) {
//     res.render("register")
// });

// app.post("/register", function(req, res) {
//     var newUser = new user({ username: req.body.username });
//     user.register(newUser, req.body.password, function(err, user) {
//         if (err) {
//             console.log(err);
//             return res.render("register")
//         }
//         passport.authenticate("local")(req, res, function() {
//             res.redirect("/hanks");
//         })
//     })
// })

// //shoow login
// app.get("/login", function(req, res) {
//         res.render("login")
//     })
//     //app.post("/login", middleware, callback)
// app.post("/login", passport.authenticate("local", { successRedirect: "/hanks", failureRedirect: "/login" }), function(req, res) {
//     //res.send("LOGIN logic happens here")
// })

// //Logout
// app.get("/logout", function(req, res) {
//     req.logout();
//     res.redirect("/hanks")
// })

// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect("/login");
// }

app.listen(5500, function () {
  console.log("Web_Ed server has started");
});
