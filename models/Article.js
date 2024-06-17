const mongoose = require("mongoose");
const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,  
    trim: true,
  },
  idAuthor: {
    type: String, 
    trim: true,
  },
  description: {
    type: String, 
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String, 
    trim: true,
  },
  image: {
    type: String,
  },
  tags: {
    type: Array, 
  },
});
ArticleSchema.index({ title: 1}, { unique: true });  


const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;