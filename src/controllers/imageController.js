const path = require('path');
const fsPromises = require('fs').promises;

class ImageController {
  async getImages(req, res, next) {
    const { date } = req.params;
    try {
      const imagesDir = path.join(__dirname, '../../public/images', date);
      
      try {
        await fsPromises.access(imagesDir);
      } catch {
        return res.json([]);
      }
      
      const files = await fsPromises.readdir(imagesDir);
      const images = files.filter(file => 
        !file.endsWith('.json') && /\.(jpg|jpeg|png|gif)$/i.test(file)
      );
      
      res.json(images);
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: '没有上传文件' });
      }
      
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }));
      
      res.json({ success: true, files: uploadedFiles });
    } catch (error) {
      next(error);
    }
  }

  async updateImageOrder(req, res, next) {
    try {
      const { date } = req.params;
      const { images } = req.body;
      
      const orderPath = path.join(__dirname, '../../public/images', date, 'order.json');
      await fsPromises.writeFile(
        orderPath,
        JSON.stringify(images, null, 2)
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { date, image } = req.params;
      const imagePath = path.join(__dirname, '../../public/images', date, image);
      await fsPromises.unlink(imagePath);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ImageController();