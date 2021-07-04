const express = require('express');
const CategoryController = require('../controllers/category');
const midAuth = require('../middlewares/authenticated');
const router = express.Router();

// Category routes
router.get('/test', CategoryController.test);
router.post('/category', midAuth.authenticated, CategoryController.add);
router.put('/category/:categoryId', midAuth.authenticated, CategoryController.update);
router.delete('/category/:categoryId', midAuth.authenticated, CategoryController.delete);
router.get('/category/:categoryId', CategoryController.getCategory);
router.get('/categories', CategoryController.getCategories);

module.exports = router;
