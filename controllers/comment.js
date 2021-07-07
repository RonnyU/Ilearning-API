const Video = require('../models/video');
const validator = require('validator');

const controller = {
    test(req, res) {
        return res.status(200).send({
            status: 'success',
        });
    },
    add(req, res) {
        const videoId = req.params.videoId;
        const userId = req.user.id;
        let validateTittle;
        let validateContent;

        try {
            Video.findById(videoId).exec((err, video) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'the process failed when trying to find a video',
                    });
                }
                if (!video) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'the video does not exists',
                    });
                }

                if (req.body.content) {
                    try {
                        validateTittle = !validator.isEmpty(req.body.title);
                        validateContent = !validator.isEmpty(req.body.content);
                    } catch (error) {
                        return res.status(200).send({
                            message: 'You must add something in the comment box',
                        });
                    }

                    if (validateTittle && validateContent) {
                        const comment = {
                            title: req.body.title,
                            content: req.body.content,
                            user: userId,
                        };

                        video.comments.push(comment);

                        video.save((err) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'error when trying to save the comment',
                                });
                            }

                            Video.findById(videoId)
                                .populate({ path: 'comments', populate: { path: 'user' } })
                                .exec((err, newVideo) => {
                                    if (err) {
                                        return res.status(500).send({
                                            status: 'error',
                                            message: 'error when trying to populate',
                                        });
                                    } else {
                                        return res.status(200).send({
                                            status: 'success',
                                            newVideo,
                                        });
                                    }
                                });
                        });
                    } else {
                        return res.status(200).send({
                            message: 'validation failed',
                        });
                    }
                }
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Something went wrong!',
                error: error.message,
            });
        }
    },

    update(req, res) {
        const commentId = req.params.commentId;
        let validateTittle;
        let validateContent;

        try {
            validateTittle = !validator.isEmpty(req.body.title);
            validateContent = !validator.isEmpty(req.body.content);
        } catch (error) {
            return res.status(200).send({
                message: 'there is nothing in the commentary box',
            });
        }

        if (validateTittle && validateContent) {
            Video.findOneAndUpdate(
                { 'comments._id': commentId },
                {
                    $set: {
                        'comments.$.title': req.body.title,
                        'comments.$.content': req.body.content,
                    },
                },
                { new: true },
                (err, videoUpdated) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'The procces has failed when traying to update the comment',
                        });
                    }
                    if (!videoUpdated) {
                        return res.status(404).send({
                            status: 'error',
                            message:
                                'There is not a comment under this id or the video does not exists anymore',
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        topic: videoUpdated,
                    });
                }
            );
        }
    },
    delete(req, res) {
        const videoId = req.params.videoId;
        const commentId = req.params.commentId;
        // Deleting comment from db

        Video.findById(videoId, (err, video) => {
            if (err) {
                res.send({
                    status: false,
                    err: err.message,
                });
            }

            if (video) {
                if (video.comments.id(commentId).user == req.user.id) {
                    Video.findByIdAndUpdate(
                        videoId,
                        { $pull: { comments: { _id: commentId } } },
                        (err) => {
                            if (err)
                                res.send({
                                    status: false,
                                    message: 'An error occurred while trying to delete comment.',
                                });
                            else res.send({ status: true, message: 'Comment succesfuly deleted.' });
                        }
                    );
                } else {
                    res.send({
                        status: false,
                        message:
                            'You can not delete this comment since you are not the user who created it',
                    });
                }
            } else {
                res.send({
                    status: false,
                    message: 'An error occurred while trying to find the video.',
                });
            }
        });
        // }
    },
    deleteCXC(req, res) {
        const { videoId } = req.params;
        const { commentId } = req.params;
        const { cxc } = req.params;

        Video.findById(videoId, (err, video) => {
            if (err) {
                res.send({
                    status: false,
                    err: err.message,
                });
            }

            if (video) {
                if (video.comments.id(commentId).comments.id(cxc).user == req.user.id) {
                    Video.findByIdAndUpdate(
                        videoId,
                        { $pull: { 'comments.$[].comments': { _id: cxc } } },
                        (err) => {
                            if (err)
                                res.send({
                                    status: false,
                                    message: 'An error occurred while trying to delete comment.',
                                });
                            else res.send({ status: true, message: 'Comment succesfuly deleted.' });
                        }
                    );
                } else {
                    res.send({
                        status: false,
                        message:
                            'You can not delete this comment since you are not the user who created it',
                    });
                }
            } else {
                res.send({
                    status: false,
                    message: 'An error occurred while trying to find the video.',
                });
            }
        });
        // }
    },

    getComments(req, res) {
        const videoId = req.params.videoId;

        Video.findById(videoId).exec((err, video) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error when trying to find the video',
                });
            }

            if (!video) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The video does not exists',
                });
            }

            return res.send({
                status: 'success',
                comments: video.comments,
            });
        });
    },

    // getComment(req, res) {
    //     const { videoId } = req.params;
    //     const { commentId } = req.params;

    //     Video.findById(videoId, (err, video) => {
    //         if (err) res.send({ status: false, message: 'Video dont exists.' + err });
    //         else {
    //             const auxComment = video.comments;
    //             for (let index = 0; index < auxComment.length; index++) {
    //                 const comment = auxComment[index];
    //                 if (comment.id == commentId) {
    //                     return res.send({
    //                         status: 'success',
    //                         comment,
    //                     });
    //                 }
    //             }
    //         }
    //         if (!video) {
    //             res.send({ status: false, message: "Video exists. But comment doesn't." });
    //         }
    //     });
    // },

    getComment(req, res) {
        const { videoId } = req.params;
        const { commentId } = req.params;
        // user.photos.id(photo._id);
        Video.findById(videoId)
            .populate({ path: 'comments', populate: { path: 'user' } })
            .exec((err, video) => {
                if (err) {
                    return res.send({
                        status: 'error',
                        error: err.message,
                    });
                }

                if (video) {
                    const comment = video.comments.id(commentId);
                    return res.send({
                        status: 'success',
                        comment,
                    });
                } else {
                    return res.send({
                        status: 'error',
                        message: 'something went wrong',
                    });
                }
            });
    },
    addMoreComments(req, res) {
        try {
            // Catching course id from request params
            const { videoId } = req.params;
            const { commentId } = req.params;
            const { content } = req.body;
            //console.log(req.body);
            if (validator.isEmpty(content)) {
                return res.status(200).send({
                    message: 'the comment is empty',
                });
            }

            Video.findById({ _id: videoId }, (err, video) => {
                if (err) {
                    return res.send({ status: false, err });
                } else {
                    const commentObject = {
                        content,
                        user: req.user.id,
                    };

                    video.comments.id(commentId).comments.push(commentObject);

                    video.save((err) => {
                        if (err) {
                            return res.status(500).send({
                                err: err.message,
                            });
                        }
                        return res.status(200).send({
                            status: 'success',
                            comments: video.comments.id(commentId).comments,
                        });
                    });
                }
            });
        } catch (error) {
            return res.status(500).send({ status: false, error: error.message });
        }
    },

    getCommentsInside(req, res) {
        const { videoId } = req.params;
        const { commentId } = req.params;

        Video.findById(videoId)
            .populate({
                path: 'comments',
                populate: { path: 'comments', populate: { path: 'user' } },
            })
            .exec((err, video) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error when trying to find the video',
                    });
                }

                if (!video) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'The video does not exists',
                    });
                }

                return res.send({
                    status: 'success',
                    comments: video.comments.id(commentId),
                });
            });
    },
    getCommentInside(req, res) {
        const { videoId } = req.params;
        const { commentId } = req.params;
        const { cxc } = req.params;

        Video.findById(videoId)
            .populate({
                path: 'comments',
                populate: { path: 'comments', populate: { path: 'user' } },
            })
            .exec((err, video) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error when trying to find the video',
                    });
                }

                if (!video) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'The video does not exists',
                    });
                }

                return res.send({
                    status: 'success',
                    comment: video.comments.id(commentId).comments.id(cxc),
                });
            });
    },
    updateCXC(req, res) {
        const { videoId } = req.params;
        const { commentId } = req.params;
        const { cxc } = req.params;
        const { content } = req.body;

        Video.findById(videoId)
            .populate({
                path: 'comments',
                populate: { path: 'comments', populate: { path: 'user' } },
            })
            .exec((err, video) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error when trying to find the video',
                    });
                }

                if (!video) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'The video does not exists',
                    });
                }

                const childCommment = video.comments.id(commentId).comments.id(cxc);
                childCommment['content'] = content;
                video.save((err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error when trying to save the comment',
                        });
                    } else {
                        return res.send({
                            status: 'success',
                            comment: childCommment,
                        });
                    }
                });
            });
    },
};

module.exports = controller;
