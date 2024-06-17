const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); 
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer and cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-app', // Folder name on Cloudinary
    format: async (req, file) => 'jpg', // supports promises as well
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const parser = multer({ storage: storage });
  




router.post("/createarticle", parser.single('image'), async (req, res) => {
    console.log("article create");
    try {
      let data = req.body;
      let article = new Article(data);
  
      if (req.file) {
        article.image = req.file ? req.file.path : 'default.jpg';
      }
  
      if (data.tags) {
        article.tags = JSON.parse(data.tags);
      }
  
      const savedArticle = await article.save();
      if (savedArticle) {
        console.log("Your data is saved");
        res.status(200).send(savedArticle);
      } else {
        console.log("Your data is not saved");
        res.status(500).send("coding error");
      }
  
    } catch (err) {
      console.error("Your data is not saved:", err.message);
      res.status(400).send(err.message);
    }
  });
router.get('/all' , async (req, res) => {
    try {
        const articles = await Article.find();
        res.status(200).json(articles);
    } catch (err) {
        console.error("Failed to fetch articles:", err.message);
        res.status(500).send("Failed to fetch articles");
    }
});
router.get('/getbyid/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).send("Article not found");
        }

        res.status(200).json(article);
    } catch (err) {
        console.error("Failed to fetch article:", err.message);
        res.status(500).send("Failed to fetch article");
    }
});

router.get('/getbyidAuthor/:id', async (req, res) => {
    console.log(req.params.id);
    try {
        const articles = await Article.find({ idAuthor: req.params.id });
        
        if (articles.length === 0) {
            return res.status(404).send("No articles found for this author");
        }

        res.status(200).json(articles);
    } catch (err) {
        console.error("Failed to fetch articles by author:", err.message);
        res.status(500).send("Failed to fetch articles by author");
    }
});

router.delete('/delete/:id', async (req, res) => {
    console.log(req.params.id);
    console.log("deleted profile section ");
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        
        if (!deletedArticle) { 
            return  res.status(404).json({ message: 'Article not found' });
        }else{
            console.log("article deleted successfully");
            return  res.status(200).json({ message: 'Article deleted successfully' });
        }
    } catch (err) {
        console.error("Failed to delete article:", err.message); 
        return  res.status(500).json({ message: 'Failed to delete article' });
    }
});
router.put('/update/:id', parser.single('image'), async (req, res) => {
    console.log("update article");
    try {
        const { title, description, content, tags } = req.body;

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).send("Article not found");
        }

        // Update only the fields that are provided in the request body
        if (title) article.title = title;
        if (description) article.description = description;
        if (content) article.content = content;
        if (tags) article.tags = tags.split(',');

        // Handle image upload if a file is provided
        if (req.file) {
            article.image = req.file.filename; // Assuming multer has saved the file
        }

        const updatedArticle = await article.save();

        res.status(200).json(updatedArticle);
    } catch (err) {
        console.error("Failed to update article:", err.message);
        res.status(500).send("Failed to update article");
    }
});



module.exports = router;