const express = require('express');
const UserController = require('../controllers/user');
const midAuth = require('../middlewares/authenticated');
const middlewareUpImage = require('../middlewares/uploadImage');
const midMulter = middlewareUpImage.uploadImage();

const router = express.Router();

// rutas de usuarios

router.get('/user/avatar/:filename', UserController.getAvatar);
router.get('/users', UserController.getusers);
router.get('/users/totalof-courses-bought/:courseId', UserController.getTotalOfCoursesBought);
router.get('/user/mycourses', midAuth.authenticated, UserController.getMyCourses);
router.get('/user/:userId', UserController.getuser);

router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.post(
    '/user/upload-avatar',
    [midAuth.authenticated, midMulter.single('file0')],
    UserController.uploadAvatar
);

router.put('/user', midAuth.authenticated, UserController.update);
router.put('/user/change-password', midAuth.authenticated, UserController.updatePassword);
router.put('/user/disableAccount', midAuth.authenticated, UserController.disableAccount);
router.put('/user/enableAccount/:identity', UserController.enableAccount);

router.put('/user/registerBuy/:courseId', midAuth.authenticated, UserController.registerBuy);

module.exports = router;
