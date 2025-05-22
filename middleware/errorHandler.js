const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images', req.params.date);
        fs.promises.mkdir(dir, { recursive: true })
            .then(() => cb(null, dir))
            .catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

module.exports = multer({ storage });