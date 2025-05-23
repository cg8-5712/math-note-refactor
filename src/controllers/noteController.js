const path = require('path');
const fsPromises = require('fs').promises;
const { readNoteData, saveNoteData } = require('../utils/noteData');
const { formatDate } = require('../utils/dateFormatter');

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

  async createNote(req, res, next) {
    try {
      const { date, title } = req.body;
      const currentYear = new Date().getFullYear();
      const month = date.substring(0, 2);
      const day = date.substring(2, 4);
      const fullDate = `${currentYear}.${month}.${day}`;
      const dateInfo = formatDate(new Date());
      
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
      const dateInfo = formatDate(new Date());
      
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
      
      // Delete note from index.txt
      const notes = await readNoteData();
      const filteredNotes = notes.filter(note => note.date !== date);
      await saveNoteData(filteredNotes);

      // Delete associated image folder
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