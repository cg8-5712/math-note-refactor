import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
import fsPromises from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageController {
  async getImages(req, res, next) {
    const { date } = req.params;
    try {
      const imagesDir = path.join(__dirname, '../../public/images', date);
      const orderPath = path.join(imagesDir, 'order.json');
      
      let images = [];
      let order = [];

      try {
        // Get all image files
        const files = await fsPromises.readdir(imagesDir);
        images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        
        // Get order if exists
        try {
          const orderData = await fsPromises.readFile(orderPath, 'utf8');
          order = JSON.parse(orderData);
          // Filter out any images that no longer exist
          order = order.filter(filename => images.includes(filename));
        } catch (err) {
          // If order.json doesn't exist, use alphabetical order
          order = [...images].sort();
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fsPromises.mkdir(imagesDir, { recursive: true });
        } else {
          throw err;
        }
      }
      
      return res.json({
        images,
        order,
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: '没有上传文件' });
      }
      
      const { date } = req.params;
      const imagesDir = path.join(__dirname, '../../public/images', date);
      await fsPromises.mkdir(imagesDir, { recursive: true });
      
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        path: `/images/${date}/${file.filename}`
      }));
      
      return res.json({ 
        success: true, 
        files: uploadedFiles
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { date, image } = req.params;
      const imagePath = path.join(__dirname, '../../public/images', date, image);
      
      try {
        await fsPromises.unlink(imagePath);
        return res.json({ success: true });
      } catch (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ error: '图片不存在' });
        }
        throw err;
      }
    } catch (error) {
      next(error);
    }
  }

  async updateImageOrder(req, res, next) {
    try {
      const { date } = req.params;
      const { images } = req.body;
      
      if (!Array.isArray(images)) {
        return res.status(400).json({
          error: '无效的图片顺序数据',
          code: 'INVALID_ORDER_DATA'
        });
      }

      const imagesDir = path.join(__dirname, '../../public/images', date);
      const orderPath = path.join(imagesDir, 'order.json');
      const tempPath = `${orderPath}.tmp`;

      // Verify all images exist
      try {
        await Promise.all(images.map(async (image) => {
          const imagePath = path.join(imagesDir, image);
          await fsPromises.access(imagePath);
        }));
      } catch (err) {
        return res.status(400).json({
          error: '部分图片不存在',
          code: 'IMAGES_NOT_FOUND'
        });
      }

      // Write order file atomically
      await fsPromises.mkdir(path.dirname(orderPath), { recursive: true });
      await fsPromises.writeFile(tempPath, JSON.stringify(images, null, 2));
      await fsPromises.rename(tempPath, orderPath);

      return res.json({ 
        success: true,
        csrfToken: req.csrfToken()
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: '目录不存在',
          code: 'DIRECTORY_NOT_FOUND'
        });
      }
      next(error);
    }
  }
}

export default new ImageController();