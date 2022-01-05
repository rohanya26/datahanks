var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var hankSchema = new Schema({
    name: String,
    image: String,
    description: String,
    link: String,
    snippet: {
        type: String
    },
    timeCreated: {
        type: Date,
        default: () => Date.now(),
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String,
        image: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]

});


module.exports = mongoose.model(`hank`, hankSchema);