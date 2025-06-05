import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import config from './config';

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const dir = path.join(config.paths.images, req.params.date);
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.upload.allowedTypes.includes(ext)) {
    return cb(new Error('只允许上传图片文件！'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles
  }
});

module.exports = upload;