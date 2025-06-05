const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { readNoteData } = require('../utils/noteData');

// 首页路由
router.get('/', async (req, res, next) => {
  try {
    const notes = await readNoteData();
    res.render('index', {
      title: '数学课堂板书系统',
      notes: notes
    });
  } catch (error) {
    next(error);
  }
});

// 笔记详情路由
router.get('/notes/:date', async (req, res, next) => {
  try {
    const date = req.params.date;
    if (!/^\d{8}$/.test(date)) {
      return res.status(400).render('error', {
        message: '无效的日期格式',
        error: { status: 400 }
      });
    }
    
    const imageDir = path.join(__dirname, '../../public/images', date);
    const orderPath = path.join(imageDir, 'order.json');
    
    // 获取所有图片文件
    let images = [];
    let orderedImages = [];
    
    try {
      const files = await fs.promises.readdir(imageDir);
      images = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));
      
      // 尝试读取 order.json
      try {
        const orderJson = await fs.promises.readFile(orderPath, 'utf8');
        const orderArray = JSON.parse(orderJson);
        
        // 使用 order.json 的顺序，同时添加未在 order.json 中的图片
        orderedImages = [
          ...orderArray.filter(filename => images.includes(filename)),
          ...images.filter(filename => !orderArray.includes(filename))
        ];
      } catch (err) {
        // 如果没有 order.json，使用默认排序
        orderedImages = [...images].sort();
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).render('error', {
          message: '笔记不存在',
          error: { status: 404 }
        });
      }
      throw error;
    }
    
    res.render('directory', {
      title: `${date}课程板书`,
      images: orderedImages.map(filename => `/images/${date}/${filename}`),
      date: date
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;