var mongoose = require("mongoose");
const passposrtLocalMongoose = require('passport-local-mongoose')


var userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: String,

    FirstName: String,
    LastName: String,
    email: { type: String, unique: true, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    image: String,
    gitHubUsername: String,
    facebook: String,
    instagram: String,
    linkedIn: String,
    college: String,
    bio: String,
    profession: String,

    skills: [],
    isAdmin: {
        type: Boolean,
        default: false
    },
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification'
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

userSchema.plugin(passposrtLocalMongoose);





module.exports = mongoose.model("user", userSchema);