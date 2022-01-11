var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var materialSchema = new Schema({
    name: String,
    description: String,
    recfile: String,
    content: String,
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
module.exports = mongoose.model(`material`, materialSchema);