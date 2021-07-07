/* eslint-disable no-undef */
const Quiz = require('../models/quiz');
const validator = require('validator');

const controller = {
    test: (req, res) =>
        res.status(200).send({
            message: 'Sucessful quiz',
        }),
    addquiz: (req, res) => {
        const params = req.body;

        let validateType;
        try {
            validateType = !validator.isEmpty(params.type);
        } catch (error) {
            return res.status(200).send({
                message: 'the request is missing data',
            });
        }
        if (validateType) {
            const quiz = new Quiz();

            quiz.type = params.type;
            quiz.qualification = null;
            //quiz.questions = null;

            quiz.save((quizSaveErr, quizStored) => {
                if (quizSaveErr) {
                    return res.status(200).send({
                        message: 'Quiz save failed (errQuiz-01)',
                        quizSaveErr,
                    });
                }
                if (!quizStored) {
                    return res.status(200).send({
                        message: 'the Quiz has not saved',
                    });
                }

                return res.status(200).send([{ status: true, quiz: quizStored }]);
            }); //close save
        } else {
            return res.status(200).send({
                status: false,
                message: 'Quiz validation failed, please, check the data to send',
            });
        }
    },

    addquestion: (req, res) => {
        try {
            // Catching quiz id from request params
            const { quizId } = req.params;
            const { question } = req.body;

            //console.log(req.params);
            //console.log(req.body);

            if (validator.isEmpty(question)) {
                return res.status(200).send({
                    message: 'the request is missing data ',
                });
            }

            const questionObject = {
                question,
            };
            Quiz.findByIdAndUpdate(quizId, { $push: { questions: questionObject } }, (err) => {
                if (err) {
                    res.send({
                        status: false,
                        message: 'An error occurred while trying to add the new question.',
                    });
                } else {
                    res.send({ status: true, message: 'question succesfuly added.' });
                }
            });
        } catch (error) {
            return res.status(500).send({ status: false, error });
        }
    },

    addanswer: (req, res) => {
        // Catching course id from request params
        const quizId = req.params.quizId;
        const questionId = req.params.questionId;
        const params = req.body;

        let validateAnswer;
        let validateResult;
        let existsQuestion = false;
        //Verification data exist
        Quiz.findById(quizId, (err, quiz) => {
            if (err) res.send({ status: false, message: 'Quiz doesnt exists.' + err });
            else {
                const auxQuiz = quiz.questions;
                for (let index = 0; index < auxQuiz.length; index++) {
                    const question = auxQuiz[index];
                    if (question.id == questionId) {
                        existsQuestion = true;
                    }
                }
                if (!existsQuestion) {
                    res.send({
                        status: false,
                        message: "The information received doesn't match with any document on db.",
                    });
                } else {
                    //Data validation
                    try {
                        validateAnswer = !validator.isEmpty(req.body.answer);
                        validateResult = !validator.isEmpty(req.body.result);
                    } catch (error) {
                        return res
                            .status(200)
                            .send({ status: false, message: 'Name cannot be empty value.' });
                    }
                    if (validateAnswer && validateResult) {
                        Quiz.findOne({ _id: quizId }).then(
                            (doc) => {
                                questions = doc.questions.id(questionId);

                                const answer = {
                                    answer: params.answer,
                                    result: params.result,
                                };
                                questions.answers.push(answer);
                                doc.save((err, saved) => {
                                    if (err) {
                                        return res.send(
                                            'The following error ocurred while trying to save changes. ' +
                                                err
                                        );
                                    } else if (saved) {
                                        return res.send({
                                            status: true,
                                            message: 'Answer added.',
                                        });
                                    }
                                });
                                //
                            },
                            (err) => {
                                if (err)
                                    res.send({
                                        status: false,
                                        message:
                                            'An error occurred while trying to update question. ' +
                                            err,
                                    });
                            }
                        );
                    } else {
                        res.send({ status: true, message: 'Error in data validation' });
                    }
                }
            }
        });
    },
};
module.exports = controller;
