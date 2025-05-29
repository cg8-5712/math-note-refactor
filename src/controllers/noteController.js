const path = require('path');
const fsPromises = require('fs').promises;
const { readNoteData, saveNoteData } = require('../utils/noteData');
const DateFormatter = require('../utils/dateFormatter');

class NoteController {
  async getDashboard(req, res, next) {
    try {
      const notes = await readNoteData();
      res.render('admin/dashboard', { 
        title: '管理面板',
        notes: notes 
      });
    } catch (error) {
      next(error);
    }
  }

  async getNote(req, res, next) {
  try {
    const plainDate = req.params.date;  // YYYYMMDD format
    const formattedDate = DateFormatter.convertFromPlainDate(plainDate);
    
    const notes = await readNoteData();
    const note = notes.find(n => n.date === formattedDate);
    
    if (!note) {
      return res.status(404).render('error', { 
        message: '笔记不存在',
        error: { status: 404 }
      });
    }

    // 获取图片文件列表
    const imageDir = path.join(__dirname, '../../public/images', plainDate);
    let images = [];
    try {
      const files = await fsPromises.readdir(imageDir);
      images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    } catch (error) {
      console.log('No images found:', error);
    }

    res.render('admin/edit', { 
      title: '修改笔记',
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
      const dateInfo = DateFormatter.formatDate(new Date());
      const fullDate = DateFormatter.convertToFullDate(date);
      
      await fsPromises.appendFile(
        path.join(__dirname, '../../data/index.txt'),
        `${fullDate}|${title}|${dateInfo.timestamp}\n`,
        'utf8'
      );
      res.redirect('/admin');
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req, res, next) {
  try {
    const plainDate = req.params.date;
    const formattedDate = DateFormatter.convertFromPlainDate(plainDate);
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    
    const notes = await readNoteData();
    const noteExists = notes.some(note => note.date === formattedDate);
    
    if (!noteExists) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    const updatedNotes = notes.map(note => {
      if (note.date === formattedDate) {
        return {
          ...note,
          title,
          uploadDate: DateFormatter.formatDate(new Date()).timestamp
        };
      }
      return note;
    });
    
      await saveNoteData(updatedNotes);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const plainDate = req.params.date;
      const formattedDate = DateFormatter.convertFromPlainDate(plainDate);
      
      const notes = await readNoteData();
      const filteredNotes = notes.filter(note => note.date !== formattedDate);
      await saveNoteData(filteredNotes);

      const imageDir = path.join(__dirname, '../../public/images', plainDate);
      await this.deleteImageDirectory(imageDir);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async deleteImageDirectory(imageDir) {
    try {
      await fsPromises.access(imageDir);
      const files = await fsPromises.readdir(imageDir);
      for (const file of files) {
        await fsPromises.unlink(path.join(imageDir, file));
      }
      await fsPromises.rmdir(imageDir);
    } catch (error) {
      console.log('Image directory not found:', error);
    }
  }
}

module.exports = new NoteController();