const mongoose = require('mongoose');

const { Schema } = mongoose;

const SupportMaterialSchema = Schema({
    title: String,
    supportMaterialDesc: String,
    supportMaterialPath: String,
});

const CxCSchema = Schema({
    content: String,
    user: { type: Schema.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const CommentSchema = Schema({
    title: String,
    content: String,
    comments: [CxCSchema],
    user: { type: Schema.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const VideoSchema = Schema(
    {
        videoDesc: String,
        videoPath: String,
        videoDuration: Number,
        comments: [CommentSchema],
        supportMaterial: [SupportMaterialSchema],
    },
    { versionKey: false }
);

module.exports = mongoose.model('Video', VideoSchema);
