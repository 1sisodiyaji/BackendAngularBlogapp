const Article = require('../models/Article'); 
const {parser} = require("../config/Cloudinary");
const { findById } = require('../models/User');
const slugify = require("slugify"); 
const cloudinary = require('cloudinary').v2;

exports.Create_Article = async (req, res) => {
    console.log(req.body); 
    const id = req.userId;   
    if (!id) {
        return res.status(401).send("Unauthorized");
    }
    try {
        const { title, content, description, tags: rawTags, image } = req.body;   
        if (!title || !content || !description) {
            return res.status(400).json({ message: "Title, content, and description are required fields." });
        }  
        const slug = slugify(title, { lower: true, strict: true });

        let tags = [];
        if (rawTags) {
            try {
                tags = typeof rawTags === 'string' ? JSON.parse(rawTags) : rawTags;
            } catch (err) {
                return res.status(400).json({ message: "Tags must be a valid JSON array." });
            }
        }

        // Create a new article
        let article = new Article({
            title: title.trim(),
            slug: slug,
            idAuthor: id,
            description: description.trim(),
            content: content.trim(),
            tags: Array.isArray(tags) ? tags : [],
        });

        // Handle image upload if provided
        if (image) {
            try {
                const uploadResult = await cloudinary.uploader.upload(image);
                article.image = uploadResult.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ message: "Failed to upload image", error: error.message });
            }
        } else {
            article.image = 'https://res.cloudinary.com/ducw7orvn/image/upload/v1721941402/logo_dnkgj9.jpg';
        }
 
        const savedArticle = await article.save();
        res.status(200).json(savedArticle);

    } catch (err) {
        console.error("Error saving the article:", err.message);
        res.status(400).send(err.message);
    }
};
exports.GetAllData =  async (req, res) => {
    try {
        const articles = await Article.find().populate('idAuthor', 'name slug');
        res.status(200).json(articles);
    } catch (err) {
        console.error("Failed to fetch articles:", err.message);
        res.status(500).send("Failed to fetch articles");
    }
};
exports.GetBySlug =  async (req, res) => {
    const slug = req.params.slug;
if(!slug) {
    return res.status(400).send("Please provide a slug"); 
}
    try {
        const article = await Article.find({slug: slug}).populate('idAuthor', 'name slug');;
        
        if (!article) {
            return res.status(404).send("Article not found");
        }

        res.status(200).json(article);
    } catch (err) {
        console.error("Failed to fetch article:", err.message);
        res.status(500).send("Failed to fetch article");
    }
};
exports.getByAuthorId = async (req, res) => { 
   
    const id = req.userId; 
    
    try { 
        const articles = await Article.find({ idAuthor: id }).populate('idAuthor', 'slug name');;
        
        if (articles.length === 0) {
            return res.status(404).send("No articles found for this author");
        } 
        res.status(200).json(articles);
    } catch (err) {
        console.error("Failed to fetch articles by author:", err.message);
        res.status(500).send("Failed to fetch articles by author");
    }
};
exports.DeleteBlog =  async (req, res) => {
    const id = req.params.id;
    const userId = req.userId; 
    if(!id || !userId) {
        return res.status(400).send("Please provide an id"); 
    }

    const article = await Article.findById(id);
    if(!article) {
        return res.status(404).send("Article not found");
    }

    if ( article.idAuthor.toString()!== userId) {
        return res.status(401).send("Unauthorized to delete this article");
    }
    try {
        const deletedArticle = await Article.findByIdAndDelete(id);
        
        if (!deletedArticle) { 
            return  res.status(404).json({ message: 'Article not found' });
        }else{ 
            return  res.status(200).json({ message: 'Article deleted successfully' });
        }
    } catch (err) {
        console.error("Failed to delete article:", err.message); 
        return  res.status(500).json({ message: 'Failed to delete article' });
    }
};
exports.UpdateBlog = async (req, res) => {
    const userId = req.userId;
    const id = req.params.id;

    if (!id || !userId) {
        return res.status(400).send("Please provide an ID");
    }

    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).send("Article not found");
        }

        if (article.idAuthor.toString() !== userId) {
            return res.status(401).send("Unauthorized to update this article");
        }

        const { title, description, content, tags: rawTags, image } = req.body;

        // Update only the fields that are provided in the request body
        if (title) {
            article.title = title.trim();
            article.slug = slugify(title, {
                lower: true,
                strict: true
            });
        }
        if (description) article.description = description.trim();
        if (content) article.content = content.trim();

        let tags = [];
        if (rawTags) {
            try {
                tags = typeof rawTags === 'string' ? JSON.parse(rawTags) : rawTags;
                article.tags = Array.isArray(tags) ? tags : [];
            } catch (err) {
                return res.status(400).json({ message: "Tags must be a valid JSON array." });
            }
        }

        // Handle image upload if provided
        if (image) {
            try {
                const uploadResult = await cloudinary.uploader.upload(image);
                article.image = uploadResult.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ message: "Failed to upload image", error: error.message });
            }
        }

        const updatedArticle = await article.save();

        res.status(200).json(updatedArticle);
    } catch (err) {
        console.error("Failed to update article:", err.message);
        res.status(500).send("Failed to update article");
    }
};
exports.getByuserId = async (req, res) => { 
   
    const id = req.params.id; 
    
    try { 
        const articles = await Article.find({ idAuthor: id }).populate('idAuthor', 'slug name');;
        
        if (articles.length === 0) {
            return res.status(404).send("No articles found for this author");
        } 
        res.status(200).json(articles);
    } catch (err) {
        console.error("Failed to fetch articles by author:", err.message);
        res.status(500).send("Failed to fetch articles by author");
    }
};
exports.getById = async (req, res) => { 
   
    const id = req.params.id; 
    
    try { 
        const articles = await Article.findById(id).populate('idAuthor', 'slug name');
        if (articles.length === 0) {
            return res.status(404).send("No articles found for this author");
        } 
        res.status(200).json(articles);
    } catch (err) {
        console.error("Failed to fetch articles by author:", err.message);
        res.status(500).send("Failed to fetch articles by author");
    }
};