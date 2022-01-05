

const mongoose = require('mongoose');

const domPurifier = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlPurify = domPurifier(new JSDOM().window);

var commentSchema = new mongoose.Schema({
    text: String,
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
        username: String
    }

});

commentSchema.pre('validate', function (next) {
    if (this.content) {
        this.content = htmlPurify.sanitize(this.content);
        // this.snippet = stripHtml(this.description.substring(0, 200)).result
    }
    next();
})





module.exports = mongoose.model("Comment", commentSchema);