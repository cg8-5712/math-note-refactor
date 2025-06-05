import readNoteData from '../utils/noteData.js';
import DateFormatter from '../utils/dateFormatter.js';
import path from 'path';
import fsPromises from 'fs/promises';

class AdminController {
  async index(req, res, next) {
    try {
      const notes = await readNoteData();
      res.render('admin/dashboard', {
        title: '管理面板',
        notes: notes.sort((a, b) => new Date(b.date) - new Date(a.date))
      });
    } catch (error) {
      next(error);
    }
  }

  async showNewForm(req, res) {
    res.render('admin/new', {
      title: '添加新笔记'
    });
  }

  async showEditForm(req, res, next) {
    try {
      const plainDate = req.params.date;
      const formattedDate = DateFormatter.convertFromPlainDate(plainDate);
      
      const notes = await readNoteData();
      const note = notes.find(n => n.date === formattedDate);
      
      if (!note) {
        return res.status(404).render('error', {
          message: '笔记不存在',
          error: { status: 404 }
        });
      }

      // Get images list
      const imageDir = path.join(__dirname, '../../public/images', plainDate);
      let images = [];
      try {
        const files = await fsPromises.readdir(imageDir);
        images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      } catch (error) {
        console.log('No images found:', error);
      }

      res.render('admin/edit', {
        title: '编辑笔记',
        note: {
          ...note,
          plainDate,
          images
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async createNote(req, res, next) {
    try {
      const { date, title } = req.body;
      
      // Validate date format (MMDD)
      if (!DateFormatter.isValidDate(date)) {
        return res.status(400).json({
          error: '无效的日期格式',
          code: 'INVALID_DATE_FORMAT'
        });
      }

      const dateInfo = DateFormatter.formatDate(new Date());
      const fullDate = DateFormatter.convertToFullDate(date);
      
      const notes = await readNoteData();
      
      // Check if note already exists
      if (notes.some(note => note.date === fullDate)) {
        return res.status(400).json({
          error: '该日期的笔记已存在',
          code: 'NOTE_EXISTS'
        });
      }

      // Add new note
      notes.push({
        date: fullDate,
        title,
        uploadDate: dateInfo.timestamp
      });

      await saveNoteData(notes);
      
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true });
      }
      
      res.redirect('/admin');
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const plainDate = req.params.date;
      const formattedDate = DateFormatter.convertFromPlainDate(plainDate);
      
      // Delete note data
      const notes = await readNoteData();
      const filteredNotes = notes.filter(note => note.date !== formattedDate);
      await saveNoteData(filteredNotes);

      // Delete associated images
      const imageDir = path.join(__dirname, '../../public/images', plainDate);
      try {
        await fsPromises.rm(imageDir, { recursive: true, force: true });
      } catch (error) {
        console.log('Failed to delete image directory:', error);
      }

      return res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();