const { Console } = require('console');
const express = require('express');
const multer = require('multer');
const path = require('path');
const CommentController = require('../controllers/comment');
const midAuth = require('../middlewares/authenticated');

const router = express.Router();

const store = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, '../storage/supportMaterial');
    },
    filename(req, file, cb) {
        cb(null, Date.now() + '.' + file.originalname);
    },
});

const upload = multer({ storage: store }).single('file');

// Category routes

router.get('/comments/:videoId', midAuth.authenticated, CommentController.getComments);

router.get('/comment/:videoId/:commentId', midAuth.authenticated, CommentController.getComment);
router.get(
    '/comment/comment/:videoId/:commentId/:cxc',
    midAuth.authenticated,
    CommentController.getCommentInside
);
router.get(
    '/comment/comments/:videoId/:commentId',
    midAuth.authenticated,
    CommentController.getCommentsInside
);

router.post('/comment/download', function (req, res, next) {
    //console.log(req);
    const filepath = path.join(__dirname, '../storage/supportMaterial') + '/' + req.body.filename;
    res.sendFile(filepath);
});

router.post('/comment/:videoId', midAuth.authenticated, CommentController.add);
router.post(
    '/comment/:videoId/:commentId',
    midAuth.authenticated,
    CommentController.addMoreComments
);

router.put('/comment/:commentId', midAuth.authenticated, CommentController.update);
router.put(
    '/comment/comment/:videoId/:commentId/:cxc',
    midAuth.authenticated,
    CommentController.updateCXC
);

router.delete('/comment/:videoId/:commentId', midAuth.authenticated, CommentController.delete);
router.delete(
    '/comment/comment/:videoId/:commentId/:cxc',
    midAuth.authenticated,
    CommentController.deleteCXC
);

module.exports = router;
