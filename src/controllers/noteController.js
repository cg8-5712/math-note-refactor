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
      const { date } = req.params;
      const notes = await readNoteData();
      const note = notes.find(n => n.date === date);
      
      if (!note) {
        return res.status(404).render('error', { 
          message: '笔记不存在',
          error: { status: 404 }
        });
      }

      res.render('admin/edit', { 
        title: '修改笔记',
        note: note
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
      const { date } = req.params;
      const { title } = req.body;
      const dateInfo = DateFormatter.formatDate(new Date());
      
      const notes = await readNoteData();
      const updatedNotes = notes.map(note => {
        if (note.date === date) {
          return { ...note, title, uploadDate: dateInfo.timestamp };
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
      const { date } = req.params;
      
      const notes = await readNoteData();
      const filteredNotes = notes.filter(note => note.date !== date);
      await saveNoteData(filteredNotes);

      const imageDir = path.join(__dirname, '../../public/images', date.replace(/\./g, ''));
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