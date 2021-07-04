const express = require('express');
const SubcategoryController = require('../controllers/subcategory');
const router = express.Router();

// Subcategory routes
router.get('/subcategory/:subcategoryId', SubcategoryController.getSubcategory);
router.get('/subcategories', SubcategoryController.getSubcategories);
router.get(
    '/subcategory/basedOnCategory/:categoryId',
    SubcategoryController.getSubcategoriesByCategory
);

module.exports = router;
