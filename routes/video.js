const express = require('express');
const videoController = require('../controllers/video');
const middleware = require('../middlewares/authenticated');

const router = express.Router();

// SM = SupportMaterial

//Video Router

router.get('/test', videoController.test);
router.get('/video/getVideo/:filename', videoController.getVideo);
router.post('/video/addVideo', middleware.authenticated, videoController.addVideo);
router.post('/video/addVideoValues', middleware.authenticated, videoController.addVideoValues);
router.post('/video/map', middleware.authenticated, videoController.addVideoMap);
router.post(
    '/video/uploadSM/:videoId',
    middleware.authenticated,
    videoController.addSupportMaterial
);
router.post(
    '/video/deleteVideo/:videoId/:courseId',
    middleware.authenticated,
    videoController.deleteVideo
);
router.delete(
    '/video/deleteSM/:videoId/:SMId',
    middleware.authenticated,
    videoController.deleteSMFile
);

module.exports = router;
