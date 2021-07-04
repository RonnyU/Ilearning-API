const Video = require('../models/video');
const Course = require('../models/course');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getVideoDurationInSeconds } = require('get-video-duration');

const controller = {
    test(req, res) {
        return res.status(200).send({
            status: 'success',
            message: 'connected',
        });
    },
    addVideo(req, res) {
        //configuring path and filename
        console.log('ADDVIUDEO');
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(__dirname, '../storage/courses/videos'));
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
        }).single('file0');
        //upload video to server
        upload(req, res, function (err) {
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
                    err,
                });

                // Validating incoming files exists
            } else if (req.file == null) {
                res.send({ status: false, message: 'Missing files' });

                //If everything above goes well, files are now on server.
            } else {
                console.log(req.file);
                res.status(200).send({
                    status: true,
                    message: 'Video succesfully uploaded to server.',
                    videoPath: req.file.destination + '/' + req.file.filename,
                    fileName: req.file.filename,
                });
            }
        });
    },
    addVideoValues(req, res) {
        const { videoDesc, videoPath } = req.body;

        if (
            videoDesc == undefined ||
            videoDesc.trim() == '' ||
            videoPath == undefined ||
            videoPath.trim() == ''
        ) {
            res.send({
                status: false,
                message: 'Missing data.',
            });
        } else {
            let videoDuration = 0;
            getVideoDurationInSeconds(videoPath).then((duration) => {
                console.log('Este es el video duration: ', duration);
                videoDuration += duration;

                const video = new Video();
                video.videoDesc = videoDesc;
                video.videoPath = videoPath;
                video.videoDuration = videoDuration;
                video.comments = [];
                video.supportMaterial = [];

                video.save((err, video) => {
                    if (err) {
                        return res.send({
                            status: false,
                            message: 'Video was not uploaded.',
                        });
                    } else if (video) {
                        res.send({ status: true, video });
                    }
                });
            });
        }
    },
    addVideoMap(req, res) {
        const { chapterId, lessonId, courseId, videoId } = req.body;
        console.log(chapterId, ' ', lessonId, ' ', courseId, ' ', videoId);
        if (chapterId == undefined || lessonId == undefined || !courseId || !videoId) {
            return res.send({ status: false, message: 'Missing data' });
        } else {
            Course.findOne({ _id: courseId }).then(
                (doc) => {
                    const lesson = doc.chapter.id(chapterId).lesson.id(lessonId);
                    lesson['video'] = videoId;
                    doc.save();
                    return res.send({ status: true, message: 'Video added succesfully.' });
                },
                (err) => {
                    if (err)
                        return res.send({
                            status: false,
                            message: 'An error occurred while trying to update lesson. ' + err,
                        });
                }
            );
        }
    },
    getVideo(req, res) {
        console.log('GETVIDEO');
        const fileName = req.params.filename;
        const pathFile = path.join(__dirname, '../storage/courses/videos/' + fileName);
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
    // method that allows to save in server phisical files and respective path in database
    addSupportMaterial(req, res) {
        // Just making sure the id match with an existing video on database
        const id = req.params.videoId;

        Video.findById(id, function (err) {
            if (err) {
                res.send({
                    status: false,
                    message: 'Theres no existing videos on database with the given id.',
                });
            } else {
                //Setting a files directory and a file unique name
                const storage = multer.diskStorage({
                    destination: (req, file, cb) => {
                        cb(null, './storage/supportMaterial');
                    },
                    filename: (req, file, cb) => {
                        cb(null, Date.now() + '-' + file.originalname);
                    },
                });

                //creating const upload that allows to save phisical files on server
                const upload = multer({ storage }).array('file0', 5);
                //Implementing "upload()" with error Handling
                upload(req, res, function (err) {
                    //catching multer errors
                    console.log(req.files);
                    if (err instanceof multer.MulterError) {
                        res.status(500).send({
                            status: false,
                            message:
                                "A Multer error occurred when uploading. Make sure, you're not exceeding the max number of files to upload (5 files)",
                        });

                        //Catching unknowns errors
                    } else if (err) {
                        res.status(500).send({
                            status: false,
                            message: 'An unknown error occurred when uploading.',
                        });

                        // Validating incoming files exists
                    } else if (req.files[0] == null) {
                        res.send({ status: false, message: 'Missing files' });

                        //If everything above goes well, files are now on server. Now we're about to save files path on database
                    } else {
                        //catching video id from params, and declaring vector for save all the files info we need
                        const { videoId } = req.params;
                        const materials = [];

                        //Filling array with all the files information comming from client
                        for (let index = 0; index < req.files.length; index++) {
                            const file = req.files[index];

                            const sp = {
                                title: file.originalname,
                                supportMaterialDesc: file.mimetype,
                                supportMaterialPath: file.destination + '/' + file.filename,
                            };

                            materials.push(sp);
                        }
                        // Iterating previously filled array, now to push, one by one on database
                        for (let index = 0; index < materials.length; index++) {
                            const material = materials[index];

                            // Inserting data on database
                            //Creating async function to tell server this can take a while. In the mean time, do another server things
                            // eslint-disable-next-line no-inner-declarations
                            async function insertar() {
                                await Video.findByIdAndUpdate(
                                    videoId,
                                    { $push: { supportMaterial: material } },
                                    { new: true }
                                );
                            }
                            insertar();
                        }

                        // If everything it's okay, let's tell the client that everything was good
                        res.status(200).send({
                            status: true,
                            message: 'files were succesfuly saved',
                        });
                    }
                });
            }
        });
    },
    // Method that allows to delete support Material from videos
    deleteSMFile(req, res) {
        // Catching params from URL
        const { videoId } = req.params;
        const { SMId } = req.params;
        //Declaring var for store the file path in a while
        let path = '';

        // Let's ensure that the video exists on database
        Video.findById(videoId, function (err, doc) {
            // Oops. Seems like the video doesn't exists.
            if (err) {
                res.send({ status: false, message: 'Video not found on database.' });

                // Well, video was found on database. Let's continue
            } else {
                // const that contains the array of support material comming from database
                const supMats = doc.supportMaterial;

                // Verifying that support material provide by client, exists on databse
                for (let index = 0; index < supMats.length; index++) {
                    const sm = supMats[index];

                    if (sm._id == SMId) {
                        // If exists, set the path of the file, to our previously declared var path
                        path = sm.supportMaterialPath;
                    }
                }

                // If don't, let's tell this to our client
                if (path == '') {
                    res.send({
                        status: false,
                        message:
                            "Video was found, but there's no a support Material with current id on this video",
                    });

                    // But if the path was found, let's delete this file both, from server and database
                } else {
                    // This delete the file from server
                    fs.unlink(path, (err) => {
                        // If error ocurred
                        if (err) {
                            res.send({
                                status: false,
                                message:
                                    'The following error ocurred while trying to delete the file, from the disk. ' +
                                    err,
                            });

                            // But if everyrhing was fine, let's delete record from database
                        } else {
                            // eslint-disable-next-line no-inner-declarations
                            async function delSM() {
                                await Video.findByIdAndUpdate(
                                    videoId,
                                    { $pull: { supportMaterial: { _id: SMId } } },
                                    function (err) {
                                        // Catching eventual error
                                        if (err) {
                                            res.send({
                                                status: false,
                                                message:
                                                    'File deteled from server, but something went wrong when trying to delete it from database. ' +
                                                    err,
                                            });

                                            // Telling client the operation was very good
                                        } else {
                                            res.send({
                                                status: true,
                                                message:
                                                    'File correctly removed from server and database.',
                                            });
                                        }
                                    }
                                );
                            }
                            // Making use of async method
                            delSM();
                        }
                    });
                }
            }
        });
        // Making use of video search method
    },
    deleteVideo(req, res) {
        try {
            const { videoId, courseId } = req.params;
            const { chapterId, lessonId } = req.body;
            let errorLog = '';

            Video.findById({ _id: videoId }, (err, success) => {
                if (err) {
                    res.send({ status: false, err });
                } else if (success) {
                    fs.unlink(success.videoPath, (err) => {
                        // If error ocurred
                        if (err) {
                            errorLog += '. ' + err;
                        }

                        // But if everyrhing was fine, let's delete record from database
                        Course.findById({ _id: courseId }, (err, course) => {
                            if (err) {
                                res.send({ status: false, err, errorLog });
                            } else if (course) {
                                const lesson = course.chapter.id(chapterId).lesson.id(lessonId);
                                lesson['video'] = undefined;
                                lesson.save((error, doc) => {
                                    if (error) {
                                        return res.send({ status: false, error, errorLog });
                                    } else if (doc) {
                                        Video.findByIdAndRemove(
                                            { _id: videoId },
                                            (failed, worked) => {
                                                if (failed) {
                                                    return res.send({
                                                        status: false,
                                                        message:
                                                            'Video couldn´t be deleted. ' + failed,
                                                        errorLog,
                                                    });
                                                } else if (worked) {
                                                    return res.send({
                                                        status: true,
                                                        worked,
                                                        errorLog,
                                                    });
                                                }
                                            }
                                        );
                                    }
                                });
                            }
                        });
                    });
                } else {
                    return res.send({ status: false, message: 'Video not found' });
                }
            });
        } catch (error) {
            return res.status(500).send({ status: false, error });
        }
    },

    getSM(req, res) {
        const videoId = req.params.videoId;

        Video.findById({ _id: videoId }, (err, success) => {
            if (err) {
                console.log('NOOO');
            } else {
                console.log('Exito');
            }
        });
    },
};

module.exports = controller;
