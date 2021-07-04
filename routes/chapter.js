const express = require('express');
const ChapterController = require('../controllers/chapter');
const midAuth = require('../middlewares/authenticated');

const router = express.Router();

router.get('/course/getChapter/:courseId/:chapterId', ChapterController.getChapter);
router.get('/course/getChapters/:courseId', ChapterController.getChapters);

router.delete(
    '/course/deleteChapter/:courseId/:chapterId',
    midAuth.authenticated,
    ChapterController.deleteChapter
);
router.post('/course/addChapter/:courseId', midAuth.authenticated, ChapterController.addChapter);
router.delete(
    '/course/deleteLesson/:courseId/:chapterId/:lessonId',
    midAuth.authenticated,
    ChapterController.deleteLesson
);
router.put(
    '/course/updateChapter/:courseId/:chapterId',
    midAuth.authenticated,
    ChapterController.updateChapter
);
router.post(
    '/course/addLesson/:courseId/:chapterId',
    midAuth.authenticated,
    ChapterController.addLesson
);
router.put(
    '/course/updateLesson/:courseId/:chapterId/:lessonId',
    midAuth.authenticated,
    ChapterController.updateLesson
);
router.put(
    '/course/reorderLessons/:courseId',
    midAuth.authenticated,
    ChapterController.reorderLessons
);
router.put(
    '/course/reorderChapters/:courseId',
    midAuth.authenticated,
    ChapterController.reorderChapters
);

module.exports = router;
