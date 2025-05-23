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
router.get('/notes/:date', (req, res, next) => {
  try {
    const date = req.params.date;
    if (!/^\d{8}$/.test(date)) {
      return res.status(400).render('error', {
        message: '无效的日期格式',
        error: { status: 400 }
      });
    }
    
    const imageDir = path.join(__dirname, '../../public/images', date);
    const images = fs.readdirSync(imageDir)
      .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
      .map(file => `/images/${date}/${file}`);
      
    res.render('directory', {
      title: `${date}课程板书`,
      images: images,
      date: date
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;