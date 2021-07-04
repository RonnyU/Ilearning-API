const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubcategorySchema = Schema(
    {
        subcategoryName: String,
        subcategoryDesc: String,
        category: { type: Schema.ObjectId, ref: 'Category' },
    },
    { versionKey: false }
);

module.exports = mongoose.model('Subcategory', SubcategorySchema);
