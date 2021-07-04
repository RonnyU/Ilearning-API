const express = require('express');
const QuizController = require('../controllers/quiz');
const midAuth = require('../middlewares/authenticated');

const router = express.Router();

//quiz route
router.get('/testquiz', QuizController.test);
router.post('/quiz', QuizController.addquiz);
router.post('/question/:quizId', QuizController.addquestion);
router.post('/answer/:quizId/:questionId', QuizController.addanswer);

module.exports = router;
