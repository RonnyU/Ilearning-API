/* eslint-disable no-undef */
const Course = require('../models/course');
const validator = require('validator');
const { find } = require('../models/course');

const controller = {
    addChapter(req, res) {
        try {
            // Catching course id from request params
            const { courseId } = req.params;
            const { chapterName } = req.body;
            const { chapterDesc } = req.body;
            let position;

            console.log(req.body);

            if (validator.isEmpty(chapterName)) {
                return res.status(200).send({
                    message: 'the request is missing data ',
                });
            }

            Course.findById({ _id: courseId }, (err, course) => {
                if (err) {
                    return res.send({ status: false, err });
                } else {
                    position = course.chapter.length + 1;
                    const chapterObject = {
                        position,
                        chapterName,
                        chapterDesc,
                    };
                    Course.findByIdAndUpdate(
                        courseId,
                        { $push: { chapter: chapterObject } },
                        (err) => {
                            if (err) {
                                res.send({
                                    status: false,
                                    message:
                                        'An error occurred while trying to add the new chapter.',
                                });
                            } else {
                                res.send({ status: true, message: 'Chapter succesfuly added.' });
                            }
                        }
                    );
                }
            });
        } catch (error) {
            return res.status(500).send({ status: false, error });
        }
    },
    deleteChapter(req, res) {
        try {
            //Catching id of chapter and course
            const { chapterId } = req.params;
            const { courseId } = req.params;
            let existsVideo = false;
            let existsChapter = false;
            // Verify if exists related documents
            Course.findById(courseId, (err, course) => {
                if (err) res.send({ status: false, message: 'Course dont exists.' + err });
                else {
                    const auxCourse = course.chapter;
                    for (let index = 0; index < auxCourse.length; index++) {
                        const chapter = auxCourse[index];
                        if (chapter.id == chapterId) {
                            existsVideo = true;
                            existsChapter = true;
                        }
                    }
                    if (!existsVideo || !existsChapter)
                        res.send({ status: false, message: "Course exists. But chapter doesn't." });
                    else {
                        // Deleting cahpter from db
                        Course.findByIdAndUpdate(
                            courseId,
                            { $pull: { chapter: { _id: chapterId } } },
                            (err) => {
                                if (err)
                                    res.send({
                                        status: false,
                                        message:
                                            'An error occurred while trying to delete chapter.',
                                    });
                                else
                                    res.send({
                                        status: true,
                                        message: 'Chapter succesfuly deleted.',
                                    });
                            }
                        );
                    }
                }
            });
        } catch (error) {
            res.send({ status: false, error });
        }
    },
    //comentario de prueba
    addLesson(req, res) {
        // Catching course id from request params
        const { chapterId, courseId } = req.params;
        const params = req.body;
        let { position } = req.body;
        position = position - 1;
        console.log(position);
        let lessonPosition;

        console.log(req.params);
        console.log(req.body);

        let validateLessonName;
        let existsChapter = false;
        //Verification data exist
        Course.findById(courseId, (err, course) => {
            if (err) {
                res.send({ status: false, message: 'Course doesnt exists.' + err });
            } else {
                const auxCourse = course.chapter;
                for (let index = 0; index < auxCourse.length; index++) {
                    const chapter = auxCourse[index];
                    if (chapter.id == chapterId) {
                        existsChapter = true;
                    }
                }
                if (!existsChapter) {
                    res.send({
                        status: false,
                        message: "The information received doesn't match with any document on db.",
                    });
                } else {
                    //Data validation
                    try {
                        validateLessonName = !validator.isEmpty(req.body.lessonName);
                    } catch (error) {
                        return res
                            .status(200)
                            .send({ status: false, message: 'Name cannot be empty value.' });
                    }
                    if (validateLessonName) {
                        // Lesson insert in database
                        Course.findOne({ _id: courseId }).then(
                            (doc) => {
                                chapter = doc.chapter.id(chapterId);
                                lessonPosition = chapter.lesson.length + 1;
                                const lesson = {
                                    position: lessonPosition,
                                    lessonName: params.lessonName,
                                    lessonDesc: params.lessonDesc,
                                };
                                chapter.lesson.push(lesson);
                                doc.save((err, saved) => {
                                    if (err) {
                                        return res.send(
                                            'The following error ocurred while trying to save changes. ' +
                                                err
                                        );
                                    } else if (saved) {
                                        return res.send({
                                            status: true,
                                            message: 'Lesson added.',
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
                                            'An error occurred while trying to update chapter. ' +
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
    deleteLesson(req, res) {
        try {
            //Catching id of lesson, chapter and course
            const { chapterId } = req.params;
            const { courseId } = req.params;
            const { lessonId } = req.params;

            let existsVideo = false;
            let existsChapter = false;

            // Verify if exists related documents
            Course.findById(courseId, (err, course) => {
                if (err) res.send({ status: false, message: 'Course dont exists.' + err });
                else {
                    const auxCourse = course.chapter;
                    for (let index = 0; index < auxCourse.length; index++) {
                        const chapter = auxCourse[index];
                        if (chapter.id == chapterId) {
                            existsVideo = true;
                            existsChapter = true;
                        }
                    }
                    if (!existsVideo || !existsChapter) {
                        res.send({
                            status: false,
                            message:
                                "The information recieved doesn't match with any document on db.",
                        });
                    } else {
                        // Deleting lesson from chapter form course from db
                        Course.findByIdAndUpdate(
                            { _id: courseId },
                            { $pull: { 'chapter.$[].lesson': { _id: lessonId } } },
                            (err) => {
                                if (err)
                                    res.send({
                                        status: false,
                                        message:
                                            'An error occurred while trying to delete lesson. ' +
                                            err,
                                    });
                                else
                                    res.send({
                                        status: true,
                                        message: 'Lesson succesfuly deleted.',
                                    });
                            }
                        );
                    }
                }
            });
        } catch (error) {
            res.send({ status: false, error });
        }
    },
    updateChapter(req, res) {
        try {
            const courseId = req.params.courseId;
            const chapterId = req.params.chapterId;
            const params = req.body;

            let validateChapterName;
            let validateChapterDesc;
            let validation;
            let existsChapter = false;

            Course.findById(courseId, (err, course) => {
                if (err) res.send({ status: false, message: 'Course doesnt exists.' + err });
                else {
                    const auxCourse = course.chapter;
                    for (let index = 0; index < auxCourse.length; index++) {
                        const chapter = auxCourse[index];
                        if (chapter._id == chapterId) {
                            existsChapter = true;
                        }
                    }
                    if (!existsChapter) {
                        res.send({
                            status: false,
                            message:
                                "The information received doesn't match with any document on db.",
                        });
                    } else {
                        //Validating Data
                        try {
                            validateChapterName = !validator.isEmpty(params.chapterName);
                        } catch (err) {
                            return res.status(200).send({
                                message: 'the request is missing data ' + err,
                            });
                        }
                        if (validateChapterName) {
                            validation = true;
                        } else {
                            validation = false;
                        }
                        if (!validation) {
                            return res.status(200).send({
                                message: 'Chapter validation failed, please, check the data sent',
                            });
                        }

                        const update = {
                            chapterName: params.chapterName,
                            chapterDesc: params.chapterDesc,
                        };
                        Course.findOne({ _id: courseId }).then(
                            (doc) => {
                                chapter = doc.chapter.id(chapterId);
                                chapter['chapterName'] = update.chapterName;
                                chapter['chapterDesc'] = update.chapterDesc;
                                doc.save();
                                return res.send({ status: true, message: 'Chapter updated' });
                            },
                            (err) => {
                                if (err)
                                    return res.send({
                                        status: false,
                                        message:
                                            'An error occurred while trying to update chapter. ' +
                                            err,
                                    });
                            }
                        );
                    }
                }
            });
        } catch (error) {
            return res.send({ status: false, error: error.message });
        }
    },
    async updateLesson(req, res) {
        try {
            const { courseId } = req.params;
            const { chapterId } = req.params;
            const { lessonId } = req.params;
            const { lessonName, lessonDesc } = req.body;
            //Validating if data is correctly filled
            if (
                lessonName == undefined ||
                lessonDesc == undefined ||
                lessonName.trim() == '' ||
                lessonDesc.trim() == ''
            ) {
                res.send({
                    status: false,
                    message: 'Missing data.',
                });
            } else {
                const update = {
                    lessonName,
                    lessonDesc,
                };
                //To validate after, if leeson and chapter was found or not.
                await Course.findOne({ _id: courseId }).then(
                    (doc) => {
                        lesson = doc.chapter.id(chapterId).lesson.id(lessonId);
                        lesson['lessonName'] = update.lessonName;
                        lesson['lessonDesc'] = update.lessonDesc;
                        doc.save();
                        return res.send({
                            status: true,
                            message: 'Chapter updated',
                        });
                    },
                    (err) => {
                        if (err)
                            return res.send({
                                status: false,
                                message: 'An error occurred while trying to update chapter. ' + err,
                            });
                    }
                );
            }
        } catch (error) {
            return res.send({ status: false, error: error.message });
        }
        //Capturing parameters and body from request header
    },
    async reorderLessons(req, res) {
        try {
            const { courseId } = req.params;
            const { position, lessonsArray, chapterId } = req.body;
            console.log(position);

            if (courseId == undefined || position == undefined) {
                return res.send({ status: false, message: 'Params or body expected' });
            } else {
                for (let i = 0; i < lessonsArray.length; i++) {
                    lessonId = lessonsArray[i];
                    console.log(lessonId);
                    await Course.findOne({ _id: courseId }).then(
                        (doc) => {
                            auxLesson = doc.chapter.id(chapterId).lesson.id(lessonId);
                            auxLesson['position'] = i + 1;
                            doc.save();
                        },
                        (err) => {
                            if (err)
                                return res.send({
                                    status: false,
                                    message:
                                        'An error occurred while trying to update lesson. ' + err,
                                });
                        }
                    );
                }
                return res.send({ status: true, course: 'hola' });
            }
        } catch (error) {
            return res.send({ status: false, error: error.message });
        }
    },
    async reorderChapters(req, res) {
        try {
            const { courseId } = req.params;
            const { chapterIds } = req.body;

            if (courseId == undefined || chapterIds == undefined) {
                return res.send({ status: false, message: 'Params or body expected' });
            } else {
                for (let i = 0; i < chapterIds.length; i++) {
                    chapterId = chapterIds[i];
                    console.log(chapterId);
                    await Course.findOne({ _id: courseId }).then(
                        (doc) => {
                            auxCourse = doc.chapter.id(chapterId);
                            auxCourse['position'] = i + 1;
                            doc.save();
                        },
                        (err) => {
                            if (err)
                                return res.send({
                                    status: false,
                                    message:
                                        'An error occurred while trying to update chapter. ' + err,
                                });
                        }
                    );
                }
                return res.send({ status: true, course: 'hola' });
            }
        } catch (error) {
            return res.send({ status: false, error });
        }
    },
    getChapters(req, res) {
        const courseId = req.params.courseId;

        Course.findById(courseId).exec((err, course) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error when trying to find the chapters',
                });
            }

            if (!course) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The chapters does not exists',
                });
            }

            return res.send({
                status: 'success',
                chapter: course.chapter,
            });
        });
    },

    getChapter(req, res) {
        //Catching id of chapter and course
        const { chapterId } = req.params;
        const { courseId } = req.params;

        Course.findById(courseId, (err, course) => {
            if (err) res.send({ status: false, message: 'Course doesnt exists.' + err });
            else {
                const auxCourse = course.chapter;
                for (let index = 0; index < auxCourse.length; index++) {
                    const chapter = auxCourse[index];
                    if (chapter.id == chapterId) {
                        return res.send({
                            status: 'success',
                            chapter,
                        });
                    }
                }
                if (!course) {
                    res.send({ status: false, message: "Course exists. But chapter doesn't." });
                }
            }
        });
    },
};

module.exports = controller;
