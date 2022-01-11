const mongoose = require('mongoose');

const domPurifier = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlPurify = domPurifier(new JSDOM().window);


var blogSchema = new mongoose.Schema({
    name: String,
    content: String,
    image: String,
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

blogSchema.pre('validate', function (next) {
    if (this.content) {
        this.content = htmlPurify.sanitize(this.content);
        this.snippet = this.content.substring(0, 200);
    }
    next();
})

module.exports = mongoose.model("blog", blogSchema);