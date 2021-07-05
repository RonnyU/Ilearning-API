const validator = require('validator');
const Course = require('../models/course');
const User = require('../models/user');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { populate } = require('../models/course');

const controller = {
    test: (req, res) =>
        res.status(200).send({
            message: 'Sucessful test',
        }),
    save: (req, res) => {
        //getting the resquest parameters
        const params = req.body;
        console.log(req.body);
        const subcategories = req.body.subcategories;

        let validateTitle;
        let validateCourseDesc;
        let validateCoursePrice;

        // Validating data
        try {
            validateTitle = !validator.isEmpty(params.title);
            validateCourseDesc = !validator.isEmpty(params.courseDesc);
            validateCoursePrice =
                !validator.isEmpty(params.coursePrice.toString()) &&
                validator.isCurrency(params.coursePrice.toString());
        } catch (err) {
            return res.status(200).send({
                message: 'the request is missing data ' + err,
            });
        }
        if (subcategories.length == 0) {
            res.status(200).send({ status: false, error: 'Subcategories required.' });
        }
        if (validateTitle && validateCourseDesc && validateCoursePrice) {
            //Creating a new course object
            const course = new Course();

            course.title = params.title;
            course.purchases = 0;
            course.profits = 0;
            course.courseDesc = params.courseDesc;
            course.imagePath = null;
            course.videoPath = null;
            course.activeCourse = false;
            course.deleted = false;
            course.coursePrice = params.coursePrice;
            course.user = req.user.id;

            //Creating a new subcategory object

            for (let index = 0; index < subcategories.length; index++) {
                const element = subcategories[index];

                course.subcategory.push(element);
            }

            course.save((courseSaveErr, courseStored) => {
                if (courseSaveErr) {
                    return res.status(200).send({
                        message: 'Course save failed (errCourse-01)',
                        courseSaveErr,
                    });
                }
                if (!courseStored) {
                    return res.status(200).send({
                        message: 'the Course has not saved',
                    });
                }

                return res.status(200).send([{ status: true, course: courseStored }]);
            }); //close save
        } else {
            return res.status(200).send({
                status: false,
                message: 'Course validation failed, please, check the data to send',
            });
        }
    },
    getCreatedCourses(req, res) {
        User.find({ _id: req.user.id })
            .populate({
                path: 'createdCourses',
                match: { deleted: false },
                populate: {
                    path: 'chapter',
                    populate: {
                        path: 'lesson',
                        populate: {
                            path: 'video',
                            model: 'Video',
                        },
                    },
                },
            })
            .exec(function (err, courses) {
                if (err) {
                    res.send({ status: false, err });
                } else if (courses) {
                    res.send({ status: true, courses });
                } else {
                    res.send({ status: false, message: 'Not found' });
                }
            });
    },
    getCreatedCourse(req, res) {
        const { courseId } = req.params;
        Course.find({ _id: courseId })
            .populate({
                path: 'chapter',
                populate: {
                    path: 'lesson',
                    populate: {
                        path: 'video',
                        model: 'Video',
                        populate: {
                            path: 'comments',
                            populate: {
                                path: 'user',
                            },
                        },
                    },
                },
            })
            .exec(function (err, course) {
                res.send({ status: true, course });
            });
    },
    //Update
    updateCourse(req, res) {
        const courseId = req.params.courseId;
        const params = req.body;
        console.log(req.body);
        let validateTitle;
        let validateCourseDesc;

        let validateCoursePrice;
        let validation;

        // Validating data
        try {
            validateTitle = !validator.isEmpty(params.title);
            validateCourseDesc = !validator.isEmpty(params.courseDesc);
            validateCoursePrice =
                !validator.isEmpty(params.coursePrice.toString()) &&
                validator.isCurrency(params.coursePrice.toString());
        } catch (err) {
            return res.status(200).send({
                message: 'the request is missing data ' + err,
            });
        }
        if (validateTitle && validateCourseDesc && validateCoursePrice) {
            validation = true;
        } else {
            validation = false;
        }

        if (!validation) {
            return res.status(200).send({
                message: 'Course validation failed, please, check the data to send',
            });
        }

        const update = {
            title: params.title,
            courseDesc: params.courseDesc,
            coursePrice: params.coursePrice,
        };
        Course.findOneAndUpdate({ _id: courseId }, update, { new: true }, (err, courseUpdated) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error when trying to find and update the course',
                });
            }
            if (!courseUpdated) {
                return res.status(404).send({
                    status: 'error',
                    message: 'something went wrong, the course has not been updated',
                });
            }
            return res.status(200).send({
                status: true,
                course: courseUpdated,
            });
        });
    },
    delete(req, res) {
        const { courseId } = req.params;

        const object = {
            deleted: true,
            activeCourse: false,
        };

        Course.findByIdAndUpdate(courseId, object, { new: true }, (err, deleted) => {
            if (err) {
                return res.send({ status: false, err });
            } else {
                return res.send({ status: true });
            }
        });
    },

    getCourse(req, res) {
        //recoger del parametro de la ruta
        const courseId = req.params.courseId;

        Course.findById(courseId)
            .populate('user')
            .exec((err, course) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'error when trying to get the courses',
                    });
                }
                if (!course) {
                    return res.status(404).send({
                        status: false,
                        message: 'there are no courses to retreive',
                    });
                }

                return res.status(200).send({
                    status: true,
                    course,
                });
            });
    },

    getCourses(req, res) {
        //get the current page

        let page;

        if (
            !req.params.page ||
            req.params.page == 0 ||
            req.params.page == null ||
            req.params.page == undefined
        ) {
            page = 1;
        } else {
            page = parseInt(req.params.page);
        }

        //-1: to order from the newest to the oldest,  1: to order from the oldest to the newest
        const options = {
            sort: { createdAt: -1 },
            populate: 'user',
            limit: 10,
            page,
        };

        Course.paginate(
            { $and: [{ deleted: false, activeCourse: true }] },
            options,
            (err, courses) => {
                if (err) {
                    return res.status(500).send({
                        status: true,
                        message: 'error when trying to get the courses',
                    });
                }
                if (!courses) {
                    return res.status(404).send({
                        status: false,
                        message: 'there are no courses to retreive',
                    });
                }

                return res.status(200).send({
                    status: true,
                    courses: courses.docs,
                    totalDocs: courses.totalDocs,
                    totalPages: courses.totalPages,
                });
            }
        );
    },
    getCoursesByUser(req, res) {
        const userId = req.params.userId;
        Course.find({
            user: userId,
            deleted: false,
        })
            .populate('user')
            .sort([['date', 'descending']])
            .exec((err, courses) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'error when trying to get the courses',
                    });
                }
                if (!courses) {
                    return res.status(404).send({
                        status: false,
                        message: 'there are no courses to retreive',
                    });
                }

                return res.status(200).send({
                    status: true,
                    courses,
                });
            });
    },
    getCoursesByUserPaginated(req, res) {
        const userId = req.params.userId;

        let page;

        if (
            !req.params.page ||
            req.params.page == 0 ||
            req.params.page == null ||
            req.params.page == undefined
        ) {
            page = 1;
        } else {
            page = parseInt(req.params.page);
        }

        //-1: to order from the newest to the oldest,  1: to order from the oldest to the newest
        const options = {
            sort: { createdAt: -1 },
            populate: {
                path: 'subcategory',
                populate: {
                    path: 'category',
                },
            },
            limit: 10,
            page,
        };

        Course.paginate({ $and: [{ user: userId, deleted: false }] }, options, (err, courses) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error cargar los courses',
                });
            }
            if (!courses) {
                return res.status(404).send({
                    status: 'error',
                    message: 'no hay courses',
                });
            }
            //console.log(courses);
            return res.status(200).send({
                status: true,
                courses: courses.docs,
                totalDocs: courses.totalDocs,
                totalPages: courses.totalPages,
            });
        });
    },
    getCoursesByCurrentUser(req, res) {
        const userId = req.user.id;
        //console.log(userId);
        Course.find({
            user: userId,
            deleted: false,
        })
            .populate('user')
            .exec((err, courses) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'error when trying to get the courses',
                    });
                }
                if (!courses) {
                    return res.status(404).send({
                        status: false,
                        message: 'there are no courses to retreive',
                    });
                }
                console.log(courses);
                return res.status(200).send({
                    status: true,
                    courses,
                });
            });
    },

    searchCourses(req, res) {
        const { search } = req.params;

        Course.find({
            $or: [{ title: { $regex: search, $options: 'i' } }],
            activeCourse: true,
            deleted: false,
        })
            .populate({ path: 'user' })
            .exec((err, courses) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'Error on request when trying to search.',
                    });
                }
                if (!courses) {
                    return res.status(404).send({
                        status: false,
                        message: 'Nothing found.',
                    });
                }

                return res.status(200).send({
                    status: true,
                    courses,
                });
            });
    },
    getCourseImage(req, res) {
        const fileName = req.params.filename;
        const pathFile = path.join(__dirname, '../storage/courses/images/' + fileName);
        //* remember to change this method bc is deprecated
        fs.exists(pathFile, (exists) => {
            if (exists) {
                res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'the avatar does not exists ',
                });
            }
        });
    },
    uploadCourseImage(req, res) {
        // getting the data from the request
        const courseId = req.params.courseid;
        const file = req.file;
        let errLog;

        if (!file) {
            return res.status(404).send({
                status: 'error',
                message: 'No image has been selected...',
            });
        }
        Course.findById({ _id: courseId }, (err, course) => {
            if (err) {
                console.log(err);
            } else if (course) {
                fs.unlink('./storage/courses/images/' + course.imagePath, (err) => {
                    // If error ocurred
                    if (err) {
                        errLog += '\n' + err;
                        // But if everyrhing was fine, let's delete record from database
                    }
                    Course.findOneAndUpdate(
                        { _id: courseId },
                        { imagePath: file.filename },
                        { new: true },
                        (err, courseUpdated) => {
                            if (err) {
                                return res.status(500).send({
                                    status: false,
                                    message: 'an error occurred while updating the course',
                                    errLog,
                                });
                            }

                            if (!courseUpdated) {
                                return res.status(404).send({
                                    status: false,
                                    message: 'Course has not been saved',
                                    errLog,
                                });
                            }

                            return res.status(200).send({
                                status: true,
                                message: 'Image uploaded Successfully',
                                course: courseUpdated,
                            });
                        }
                    );
                });
            }
        });
    },
    uploadCourseVideoIntro(req, res) {
        // getting the data from the request
        const courseId = req.params.courseid;
        let errLog;

        //configuring path and filename
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './storage/courses/videos');
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + '-' + file.originalname);
            },
        });

        const upload = multer({
            storage,
            //validations
            fileFilter: (req, file, cb) => {
                const filetypes = /mov|mp4|avi|wmv/;
                const mimetype = filetypes.test(file.mimetype);
                const extname = filetypes.test(path.extname(file.originalname));

                if (mimetype && extname) {
                    return cb(null, true);
                }
                cb('Error: file is not valid');
            },
        }).single('file');
        //upload video to server
        upload(req, res, async function (err) {
            //catching multer errors
            if (err instanceof multer.MulterError) {
                res.status(500).send({
                    status: false,
                    message: 'A Multer error occurred when uploading.',
                });
                //Catching unknowns errors
            } else if (err) {
                res.status(500).send({
                    status: false,
                    message: 'Type of file not allowed.',
                });

                // Validating incoming files exists
            } else if (req.file == null) {
                res.send({ status: false, message: 'Missing files' });

                //If everything above goes well, files are now on server.
            } else {
                console.log(req.file);
                await Course.findByIdAndUpdate(
                    { _id: courseId },
                    { videoPath: req.file.filename },
                    (err, response) => {
                        if (err) {
                            return res.send({ status: false, err });
                        } else {
                            return res.send({ status: true, response });
                        }
                    }
                );
            }
        });
    },
    disableCourse(req, res) {
        const { courseId } = req.params;

        const object = {
            activeCourse: false,
        };

        Course.findByIdAndUpdate(courseId, object, { new: true }, (err, userUpdated) => {
            if (err) {
                return res.send({ status: false, message: err });
            } else {
                return res.send({ status: true, userUpdated });
            }
        });
    },
    enableCourse(req, res) {
        const { courseId } = req.params;

        const object = {
            activeCourse: true,
        };

        Course.findByIdAndUpdate(courseId, object, { new: true }, (err, userUpdated) => {
            if (err) {
                return res.send({ status: false, message: err });
            } else {
                return res.send({ status: true, userUpdated });
            }
        });
    },
};
module.exports = controller;
