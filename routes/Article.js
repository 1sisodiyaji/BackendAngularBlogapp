const express = require('express');
const { Create_Article, GetAllData,  getByAuthorId, DeleteBlog, UpdateBlog, GetBySlug, getByuserId, getById } = require('../controller/Article.Controller');
const authenticateToken = require('../middleware/Auth');
const router = express.Router();

router.post("/createarticle",authenticateToken, Create_Article);
router.get('/all' ,GetAllData);
router.get('/getbyslug/:slug',GetBySlug );
router.get('/getbyUserSlug/:id',getByuserId );
router.get('/getByid/:id',getById );
router.get('/getbyidAuthor',authenticateToken,getByAuthorId );
router.delete('/delete/:id' ,authenticateToken, DeleteBlog );
router.put('/update/:id',authenticateToken, UpdateBlog);

module.exports = router;