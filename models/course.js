const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

// Declaring Schemas

const SubcategorySchema = Schema({
    subcategoryName: String,
    subcategoryDesc: String,
    category: { type: Schema.ObjectId, ref: 'Category' },
});

const LessonSchema = Schema({
    position: Number,
    lessonName: String,
    lessonDesc: String,
    video: { type: Schema.ObjectId, ref: 'Video' },
});

const ChapterSchema = Schema({
    position: Number,
    chapterName: String,
    chapterDesc: String,
    lesson: [LessonSchema],
});

//  Declaring models (they do not have a real function for now)
// let Chapter = mongoose.model('Chapter', ChapterSchema);

const CourseSchema = Schema(
    {
        title: String,
        courseDesc: String,
        imagePath: String,
        videoPath: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        activeCourse: Boolean,
        coursePrice: Number,
        purchases: Number,
        profits: Number,
        user: { type: Schema.ObjectId, ref: 'User' },
        deleted: Boolean,
        chapter: [ChapterSchema],
        subcategory: [{ type: Schema.ObjectId, ref: 'User' }],
    },
    { versionKey: false }
);

// Load pagination
CourseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Course', CourseSchema);
