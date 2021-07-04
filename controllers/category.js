const validator = require('validator');
const Category = require('../models/category');

const controller = {
    test(req, res) {
        return res.status(200).send({
            message: 'Category controller',
        });
    },

    add(req, res) {
        const params = req.body;

        let validateCategoryName;
        let valiudateCategoryDesc;
        let validation;

        try {
            validateCategoryName = !validator.isEmpty(params.categoryName);
            valiudateCategoryDesc = !validator.isEmpty(params.categoryDesc);
        } catch (error) {
            return res.status(200).send({
                message: 'the request is missing data',
            });
        }

        if (validateCategoryName && valiudateCategoryDesc) {
            validation = true;
        } else {
            validation = false;
        }

        if (!validation) {
            return res.status(200).send({
                message: 'Category validation failed, please, check the data to send',
            });
        }

        const category = new Category();
        category.categoryName = params.categoryName;
        category.categoryDesc = params.categoryDesc;

        Category.findOne({ categoryName: category.categoryDesc }, (err, categoryFound) => {
            if (err) {
                return res.status(500).send({
                    message: 'error checking category duplication (errCategory-01)',
                    err,
                });
            }

            if (!categoryFound) {
                category.save((categorySaveErr, categoryStored) => {
                    if (categorySaveErr) {
                        return res.status(200).send({
                            message: 'Category save failed (errCategory-02)',
                        });
                    }
                    if (!categoryStored) {
                        return res.status(200).send({
                            message: 'The category has not saved',
                        });
                    }

                    return res.status(200).send({ status: 'success', user: categoryStored });
                }); // close save
            } else {
                return res.status(200).send({
                    message: 'This Category is already in the database',
                });
            }
        });
    },
    update(req, res) {
        const categoryId = req.params.categoryId;
        const params = req.body;
        let validateCategoryName;
        let valiudateCategoryDesc;
        let validation;

        try {
            validateCategoryName = !validator.isEmpty(params.categoryName);
            valiudateCategoryDesc = !validator.isEmpty(params.categoryDesc);
        } catch (error) {
            return res.status(200).send({
                message: 'the request is missing data',
            });
        }

        if (validateCategoryName && valiudateCategoryDesc) {
            validation = true;
        } else {
            validation = false;
        }

        if (!validation) {
            return res.status(200).send({
                message: 'Category validation failed, please, check the data to send',
            });
        }

        const update = {
            categoryName: params.categoryName,
            categoryDesc: params.categoryDesc,
        };

        Category.findOneAndUpdate(
            { _id: categoryId },
            update,
            { new: true },
            (err, categoryUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'error when trying to find and update the category',
                    });
                }
                if (!categoryUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'something went wrong, the category has not been updated',
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    topic: categoryUpdated,
                });
            }
        );
    },
    delete(req, res) {
        const categoryId = req.params.categoryId;

        Category.findByIdAndDelete({ _id: categoryId }, (err, categoryDeleted) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error when trying to find the category',
                });
            }
            if (!categoryDeleted) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The category does not exists',
                });
            }
            return res.status(200).send({
                status: 'success',
                topic: categoryDeleted,
            });
        });
    },

    getCategory(req, res) {
        //recoger del parametro de la ruta
        const categoryId = req.params.categoryId;

        Category.findById(categoryId).exec((err, category) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error when trying to find the category',
                });
            }

            if (!category) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The category does not exists',
                });
            }

            return res.status(200).send({
                status: 'success',
                category,
            });
        });
    },
    getCategories(req, res) {
        Category.find().exec((err, categories) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error when trying to find the categories',
                });
            }

            if (!categories) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The categories does not exists',
                });
            }

            return res.status(200).send({
                status: 'success',
                categories,
            });
        });
    },
};

module.exports = controller;
