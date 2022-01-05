const mongoose = require('mongoose');

const domPurifier = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlPurify = domPurifier(new JSDOM().window);


var problemSchema = new mongoose.Schema({
    name: String,
    content: String,
    snippet: {
        type: String
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

problemSchema.pre('validate', function (next) {
    if (this.content) {
        this.content = htmlPurify.sanitize(this.content);
        // this.snippet = stripHtml(this.description.substring(0, 200)).result
    }
    next();
})

module.exports = mongoose.model("problem", problemSchema);