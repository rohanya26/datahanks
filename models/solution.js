
const mongoose = require('mongoose');

const domPurifier = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlPurify = domPurifier(new JSDOM().window);

var solutionSchema = new mongoose.Schema({
    text: String,

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    }

});

solutionSchema.pre('validate', function (next) {
    if (this.content) {
        this.content = htmlPurify.sanitize(this.content);
        // this.snippet = stripHtml(this.description.substring(0, 200)).result
    }
    next();
})





module.exports = mongoose.model("solution", solutionSchema);