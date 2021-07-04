const mongoose = require('mongoose');

const { Schema } = mongoose;

// Declaring Schemas

const AnswersSchema = Schema({
    answer: String,
    result: Boolean,
});

const QuestionsSchema = Schema({
    question: String,
    answers: [AnswersSchema],
});

const QuizSchema = Schema(
    {
        type: String,
        questions: [QuestionsSchema],
        qualification: String,
    },
    { versionKey: false }
);
module.exports = mongoose.model('Quiz', QuizSchema);
