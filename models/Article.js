const mongoose = require('mongoose');
 const Article =  mongoose.model('Article', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    idAuthor: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }, description: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    image:{
    type: String,
    required: true,
    },
    tags:{
        type: Array,
        required: true,
    }
});

module.exports = Article;