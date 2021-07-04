const express = require('express');
const CourseController = require('../controllers/course');
const midAuth = require('../middlewares/authenticated');
const middlewareUpImage = require('../middlewares/uploadImage');
const midMulter = middlewareUpImage.uploadImage();

const router = express.Router();

//course route
router.get(
    '/course/courseByCurrentUser/:page?',
    midAuth.authenticated,
    CourseController.getCoursesByCurrentUser
);
router.get('/course/searchCourses/:search', CourseController.searchCourses);
router.get('/courses/:page?', CourseController.getCourses);
router.get('/course/:courseId', CourseController.getCourse);
router.get('/course/image/:filename', CourseController.getCourseImage);
router.get('/course/mycourses/:userId', CourseController.getCoursesByUser);
router.get('/course/mycourses-p/:userId/:page?', CourseController.getCoursesByUserPaginated);

router.get(
    '/course/edit/uniqueCourse/:courseId',
    midAuth.authenticated,
    CourseController.getCreatedCourse
);

//router.get('/course/image/:filename', CourseController.getCourseImage);
router.get('/test', CourseController.test);
router.post('/course', midAuth.authenticated, CourseController.save);
router.post(
    '/course/upload-image/:courseid',
    [midAuth.authenticated, midMulter.single('file')],
    CourseController.uploadCourseImage
);
router.post(
    '/course/upload-video/:courseid',
    midAuth.authenticated,
    CourseController.uploadCourseVideoIntro
);

router.put('/course/:courseId', midAuth.authenticated, CourseController.updateCourse);
router.put(
    '/course/disableCourse/:courseId',
    midAuth.authenticated,
    CourseController.disableCourse
);
router.put('/course/enableCourse/:courseId', midAuth.authenticated, CourseController.enableCourse);

router.delete('/course/deleteCourse/:courseId', midAuth.authenticated, CourseController.delete);

module.exports = router;
