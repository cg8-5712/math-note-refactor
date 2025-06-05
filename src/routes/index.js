import express from 'express';
import { readNoteData } from '../utils/noteData.js';
import noteController from '../controllers/noteController.js';

const router = express.Router();

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
router.get('/notes/:date', noteController.viewNote);

export default router;