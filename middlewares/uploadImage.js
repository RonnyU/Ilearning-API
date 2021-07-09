const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
//configuraciones extras de multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        console.log(req.originalUrl);
        if (req.originalUrl == '/api/user/upload-avatar') {
            cb(null, path.join(__dirname, '../storage/users/avatar'));
        } else {
            cb(null, path.join(__dirname, '../storage/courses/images'));
        }
    },

    filename(req, file = {}, cb) {
        cb(null, uuidv4() + path.extname(file.originalname).toLocaleLowerCase());
        console.log(file);

        /*     const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];

    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString("hex") + Date.now() + fileExtension);
    });

    cb(null, originalname); */
    },
});

const multerUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|JPEG|JPG|PNG|GIF/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: file is not valid');
    },
});

exports.uploadImage = function () {
    return multerUpload;
};
