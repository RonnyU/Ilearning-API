const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = Schema(
    {
        categoryName: String,
        categoryDesc: String,
    },
    { versionKey: false }
);

module.exports = mongoose.model('Category', CategorySchema);
