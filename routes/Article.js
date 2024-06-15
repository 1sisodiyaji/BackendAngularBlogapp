const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const multer = require('multer');
const path = require('path');

let filename = '';
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../src/assets/article'));
    },
    filename: (req, file, cb) => {
        let date = Date.now();
        let f1 = date + '.' + file.mimetype.split('/')[1];
        cb(null, f1);
        filename = f1;
    }
});
const upload = multer({ storage: myStorage });


router.post('/create', upload.single('image'), async (req, res) => {
    console.log("articel create");
    try {
        let data = req.body;
        let article = new Article(data);

        if (req.file) {
            article.image = req.file.filename;
        }else{
            res.status(201).send("please upload the picture");
        }

        if (data.tags) {
           article.tags = JSON.parse(data.tags);
        }else{
            res.status(201).send("please Choose some of the tags");
        }

        const savedArticle = await article.save();
        if(savedArticle){
            console.log("Your data is saved");
            res.status(200).send(savedArticle);
        }else{
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
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        
        if (!deletedArticle) {
            return res.status(404).send("Article not found");
        }

        res.status(200).send("Article deleted successfully");
    } catch (err) {
        console.error("Failed to delete article:", err.message);
        res.status(500).send("Failed to delete article");
    }
});
router.put('/update/:id', upload.single('image'), async (req, res) => {
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