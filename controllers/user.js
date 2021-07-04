const validator = require('validator');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const Course = require('../models/course');
const jwt = require('../services/jwt');

const saltRounds = 10;

const controller = {
    save(req, res) {
        // getting the resquest parameters
        const params = req.body;

        let validateIdentity;
        let validateName;
        let validateSurname;
        let validateEmail;
        let validatePassword;

        // Validating data
        try {
            validateIdentity = !validator.isEmpty(params.identity);
            validateName = !validator.isEmpty(params.name);
            validateSurname = !validator.isEmpty(params.surname);
            validateEmail = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            validatePassword = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: 'the request is missing data ',
            });
        }

        if (
            validateIdentity &&
            validateName &&
            validateSurname &&
            validateEmail &&
            validatePassword
        ) {
            // Creating a new user object
            const user = new User();

            user.identity = params.identity;
            user.name = params.name;
            user.surname = params.surname;
            user.gender = params.gender;
            user.phone = null;
            user.email = params.email.toLowerCase();
            user.password = params.password;
            user.location = null;
            user.profesion = '';
            user.userDesc = null;
            user.imagePath = null;
            user.createdCourses = [];
            user.coursesBought = [];
            user.activeProfile = 1;
            user.role = 'ROLE_STUDENT';

            // Asking if the user already exist in the dabase
            User.findOne({ identity: user.identity }, (err, userFound) => {
                if (err) {
                    return res.status(500).send({
                        message: 'error checking user duplication (errUser-01)',
                        err,
                    });
                }
                if (!userFound) {
                    bcrypt.hash(user.password, saltRounds, (bcryptErr, hash) => {
                        if (bcryptErr) {
                            return res.status(500).send({
                                message: 'password encryption failed',
                                bcryptErr,
                            });
                        }
                        user.password = hash;
                        user.save((userSaveErr, userStored) => {
                            if (userSaveErr) {
                                return res.status(200).send({
                                    message: 'User save failed (errUser-02)',
                                });
                            }
                            if (!userStored) {
                                return res.status(200).send({
                                    message: 'the user has not saved',
                                });
                            }

                            return res.status(200).send({ status: 'success', user: userStored });
                        }); // close save
                    }); // close bcrypt
                } else {
                    return res.status(200).send({
                        message: 'This user is already in the database',
                    });
                }
            }); // close validation isset(user)
        } else {
            return res.status(200).send({
                message: 'User validation failed, please, check the data to send',
            });
        }
    },

    login(req, res) {
        // getting the resquest parameters
        const params = req.body;

        //let validateEmail;
        let validateIdentity;
        let validatePassword;

        // Validating data
        try {
            //validateEmail = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            validateIdentity = !validator.isEmpty(params.identity);
            validatePassword = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: 'the request is missing data',
            });
        }

        // check for nulls if any field is invalid it returns a message
        if (!validateIdentity || !validatePassword) {
            return res.status(200).send({
                message: 'incorrect data, login failed',
            });
        }

        User.findOne({ identity: params.identity }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    message: 'login error (errUser-03)',
                    err,
                });
            }

            if (!user) {
                return res.status(404).send({ message: 'user does not exists' });
            }

            if (!user.activeProfile) {
                return res.status(200).send({ message: 'the user profile has been disable' });
            }

            bcrypt.compare(params.password, user.password, (bcryptErr, result) => {
                if (bcryptErr) {
                    return res.status(500).send({
                        message: 'password comparison failed',
                        bcryptErr,
                    });
                }
                if (result) {
                    // Creating token (jwt library)
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user),
                        });
                    }
                    // this line is using for removing the password in the user object so in that way the password will not be sent through the internet response
                    // user.password = undefined;
                    return res.status(200).send({
                        message: 'login sucessful',
                        user,
                    });
                }
                return res.status(200).send({
                    message: 'Wrong credentials',
                });
            });
        });
    },
    updatePassword(req, res) {
        const userId = req.user.id;
        const params = req.body;
        User.findById(userId).exec((userFindbyIdErr, user) => {
            if (userFindbyIdErr) {
                return res.status(500).send({
                    status: 'error',
                    message: 'User seach failed (updatePassword err-01)',
                });
            }
            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'User does not exists',
                });
            }

            bcrypt.compare(params.currentpassword, user.password, function (
                bcryptCompareErr,
                result
            ) {
                if (bcryptCompareErr) {
                    return res.status(500).send({
                        message: 'password comparation failed',
                        bcryptCompareErr,
                    });
                }
                if (result) {
                    bcrypt.hash(params.newpassword, saltRounds, function (bcryptHashErr, hash) {
                        if (bcryptHashErr) {
                            return res.status(500).send({
                                message: 'password encryptation failed',
                                bcryptHashErr,
                            });
                        }
                        user.password = hash;

                        user.save((userSaveErr, userUpdate) => {
                            if (userSaveErr) {
                                return res.status(200).send({
                                    message: 'an error occurred while saving the user',
                                });
                            }
                            if (!userUpdate) {
                                return res.status(200).send({
                                    message: 'something went wrong, user has not been saved',
                                });
                            }

                            return res.status(200).send({
                                status: 'success',
                                message: 'password changed successfully',
                            });
                        }); //close save
                    }); //close bcrypt
                } else {
                    return res.status(200).send({
                        message: 'Wrong credentials',
                    });
                }
            }); // close comparison
        });
    },

    uploadAvatar(req, res) {
        // getting the data from the request
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(404).send({
                status: 'error',
                message: 'No avatar has been selected...',
            });
        }

        User.findOneAndUpdate(
            { _id: userId },
            { imagePath: file.filename },
            { new: true },
            (err, userUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'an error occurred while updating the user',
                    });
                }

                if (!userUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'User has not been saved',
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'Avatar uploaded Successfully',
                    user: userUpdated,
                });
            }
        );
    },

    getAvatar(req, res) {
        const fileName = req.params.filename;
        const pathFile = path.join(__dirname, '../storage/users/avatar/' + fileName);
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
    getuser(req, res) {
        //recoger del parametro de la ruta
        const userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error when trying to find the user',
                });
            }

            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The user does not exists',
                });
            }

            return res.status(200).send({
                status: 'success',
                user,
            });
        });
    },
    getusers(req, res) {
        User.find().exec((err, users) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error when trying to find the users',
                });
            }

            if (!users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The users does not exists',
                });
            }

            return res.status(200).send({
                status: 'success',
                users,
            });
        });
    },
    registerBuy(req, res) {
        // Method that register a bought course if payment was good
        const userId = req.user.id;
        const courseId = req.params.courseId;
        User.findByIdAndUpdate(userId, { $push: { mycourses: courseId } }, (err) => {
            if (err) {
                res.send({
                    status: false,
                    message: 'An error occurred while trying to register the course bought. ' + err,
                });
            } else {
                Course.findById(courseId, (err, course) => {
                    if (err) {
                        res.send({
                            status: false,
                            message: 'The course does not exist' + err,
                        });
                    } else {
                        course.purchases += 1;
                        course.Profits += course.coursePrice;
                        course.save((err) => {
                            if (err) {
                                return res.status(500).send({
                                    status: false,
                                    message: 'Error when trying to save the course',
                                });
                            }

                            res.send({ status: true, message: 'Course succesfuly bought.' });
                        });
                    }
                });
            }
        });
    },
    update(req, res) {
        // Recoger datos del usuario
        const params = req.body;

        let validateName;
        let validateSurname;
        let validateEmail;
        // Validar datos
        try {
            // eslint-disable-next-line no-unused-vars
            validateName = !validator.isEmpty(params.name);
            // eslint-disable-next-line no-unused-vars
            validateSurname = !validator.isEmpty(params.surname);
            // eslint-disable-next-line no-unused-vars
            validateEmail = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar',
            });
        }

        // Eliminar propiedades innecesarias
        //delete params.password;

        const userId = req.user.id;

        // Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error al intentar identificarse',
                    });
                }

                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email no puede ser modificado',
                    });
                } else {
                    // Buscar y actualizar documento
                    User.findOneAndUpdate(
                        { _id: userId },
                        params,
                        { new: true },
                        (err, userUpdated) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error al actualizar usuario',
                                });
                            }

                            if (!userUpdated) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No se a actualizado el usuario',
                                });
                            }

                            // Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userUpdated,
                            });
                        }
                    );
                }
            });
        } else {
            // Buscar y actualizar documento
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario',
                    });
                }

                if (!userUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se a actualizado el usuario',
                    });
                }

                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated,
                });
            });
        }
    },
    getMyCourses(req, res) {
        const userId = req.user.id;

        User.findById(userId)
            .populate({ path: 'mycourses', populate: { path: 'user' } })
            .exec((err, user) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'error when trying to find the user',
                    });
                }

                if (!user) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'The user does not exists',
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    mycourses: user.mycourses,
                });
            });
    } /*

    /*
    getCoursesCreated(req, res) {
        const userId = req.user.id;

        User.findById(userId).exec((err, user) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error when trying to find the user',
                });
            }

            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The user does not exists',
                });
            }

            return res.status(200).send({
                status: 'success',
                createdCourses: user.createdCourses,
            });
        });
    },
*/,

    disableAccount(req, res) {
        const userId = req.user.id;
        const params = req.body;
        const object = {
            activeProfile: false,
        };

        User.findById(userId).exec((userFindbyIdErr, user) => {
            if (userFindbyIdErr) {
                return res.status(500).send({
                    status: 'error',
                    message: 'User seach failed (diableAccount err-01)',
                });
            }
            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'User does not exists',
                });
            }

            bcrypt.compare(params.currentpassword, user.password, function (
                bcryptCompareErr,
                result
            ) {
                if (bcryptCompareErr) {
                    return res.status(500).send({
                        message: 'password comparation failed',
                        bcryptCompareErr,
                    });
                }
                if (result) {
                    User.findByIdAndUpdate(userId, object, { new: true }, (err, userUpdated) => {
                        if (err) {
                            return res.send({ status: false, message: err });
                        } else {
                            return res.send({ status: true, userUpdated });
                        }
                    });
                } else {
                    return res.status(200).send({
                        message: 'Wrong credentials',
                    });
                }
            }); // close comparison
        });
    },
    enableAccount(req, res) {
        const identity = req.params.identity;

        const object = {
            activeProfile: true,
        };

        User.findOneAndUpdate({ identity }, object, { new: true }, (err, userUpdated) => {
            if (err) {
                return res.send({ status: false, message: err });
            } else {
                return res.send({ status: true, userUpdated });
            }
        });
    },
    // get the number of courses that the user have bought
    getTotalOfCoursesBought(req, res) {
        const courseId = req.params.courseId;
        console.log(courseId);
        User.where({ mycourses: courseId }).countDocuments(function (err, count) {
            if (err) {
                return res.status(200).send({
                    status: 'error',
                    message: 'No existe ningun curso con ese id',
                    err,
                });
            }

            if (count >= 1) {
                return res.status(200).send({
                    status: 'success',
                    count,
                });
            }
        });
        //console.log(total);
    },
};

module.exports = controller;
