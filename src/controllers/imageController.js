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
      
      return res.json(images);
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
    // 确保目录存在
    const imagesDir = path.join(__dirname, '../../public/images', date);
    await fsPromises.mkdir(imagesDir, { recursive: true });
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      path: path.relative(path.join(__dirname, '../../public'), file.path)
    }));
    
    return res.json({ 
      success: true, 
      files: uploadedFiles,
      message: '上传成功'
    });
  } catch (error) {
    next(error);
  }
}

async deleteImage(req, res, next) {
  try {
    const { date, image } = req.params;
    const imagePath = path.join(__dirname, '../../public/images', date, image);

    // 检查文件是否存在
    try {
      await fsPromises.access(imagePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: '图片不存在' });
      }
      throw error;
    }

      // 确认删除后再执行删除操作
      await fsPromises.unlink(imagePath);
      return res.json({ 
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateImageOrder(req, res, next) {
    try {
      const { date } = req.params;
      const { images } = req.body;
      
      if (!Array.isArray(images)) {
        return res.status(400).json({ error: '无效的图片顺序数据' });
      }

      const imageDir = path.join(__dirname, '../../public/images', date);
      
      try {
        await fsPromises.access(imageDir);
      } catch (error) {
        return res.status(404).json({ error: '图片目录不存在' });
      }

      // Verify all images exist
      for (const image of images) {
        try {
          await fsPromises.access(path.join(imageDir, image));
        } catch (error) {
          return res.status(400).json({ error: `图片 ${image} 不存在` });
        }
      }

      const orderPath = path.join(imageDir, 'order.json');
      await fsPromises.writeFile(
        orderPath,
        JSON.stringify(images, null, 2)
      );

      return res.json({ 
        success: true,
        message: '更新顺序成功'
      });
    } catch (error) {
      console.error('Update image order error:', error);
      return res.status(500).json({ error: '更新顺序失败' });
    }
  }

    // Add restore function
    async restoreImages(req, res, next) {
  try {
    const { date } = req.params;
    const { originalState } = req.body;
    
    if (!originalState || !originalState.images) {
      return res.status(400).json({ error: '无效的恢复数据' });
    }

    const imageDir = path.join(__dirname, '../../public/images', date);
    
    try {
      // Ensure directory exists
      await fsPromises.mkdir(imageDir, { recursive: true });
      
      // Get current files
      const currentFiles = await fsPromises.readdir(imageDir);
      const currentImages = currentFiles.filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      // Delete files that aren't in original state
      for (const file of currentImages) {
        if (!originalState.images.includes(file)) {
          await fsPromises.unlink(path.join(imageDir, file));
        }
      }

      // Update order.json
      const orderPath = path.join(imageDir, 'order.json');
      await fsPromises.writeFile(
        orderPath,
        JSON.stringify(originalState.images, null, 2)
      );

      return res.json({ 
        success: true,
        message: '已恢复原始状态'
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: '图片目录不存在' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}
}

module.exports = new ImageController();