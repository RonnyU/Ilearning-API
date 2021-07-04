const Subcategory = require('../models/subcategory');
const controller = {
    getSubcategory(req, res) {
        //recoger del parametro de la ruta
        const subcategoryId = req.params.subcategoryId;

        Subcategory.findById(subcategoryId).exec((err, subcategory) => {
            if (err) {
                return res.status(500).send({
                    status: false,
                    message: 'error when trying to find the subcategory',
                });
            }

            if (!subcategory) {
                return res.status(404).send({
                    status: false,
                    message: 'The subcategory does not exists',
                });
            }

            return res.status(200).send({
                status: true,
                subcategory,
            });
        });
    },
    getSubcategories(req, res) {
        Subcategory.find().exec((err, subcategories) => {
            if (err) {
                return res.status(500).send({
                    status: false,
                    message: 'Error when trying to find the subcategories',
                });
            }

            if (!subcategories) {
                return res.status(404).send({
                    status: false,
                    message: 'The subcategories does not exists',
                });
            }

            return res.status(200).send({
                status: true,
                subcategories,
            });
        });
    },
    getSubcategoriesByCategory(req, res) {
        const { categoryId } = req.params;
        Subcategory.find({ category: categoryId }).exec((err, subcategories) => {
            if (err) {
                return res.status(500).send({
                    status: false,
                    message: 'Error when trying to find the subcategories',
                });
            }

            if (!subcategories) {
                return res.status(404).send({
                    status: false,
                    message: 'The subcategories does not exists',
                });
            }

            return res.status(200).send({
                status: true,
                subcategories,
            });
        });
    },
};
module.exports = controller;
