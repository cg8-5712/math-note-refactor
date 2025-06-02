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
      
      console.log('\n==================================');
      console.log('Update Note Request Information:');
      console.log('==================================');
      console.log('Request Body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Method:', req.method);
      console.log('URL:', req.url);

      // 获取并验证标题
      const title = req.body.title;
      console.log('\nTitle Validation:');
      console.log('----------------------------------');
      console.log('Title value:', title);
      console.log('Title type:', typeof title);
      console.log('Is empty?', !title);
      console.log('Is string?', typeof title === 'string');
      console.log('Trimmed length:', title?.trim?.()?.length);
      
      // 标题验证
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        const validationDetails = {
          title,
          type: typeof title,
          isEmpty: !title,
          isString: typeof title === 'string',
          trimmedLength: title?.trim?.()?.length,
          rawBody: req.body
        };
        
        console.log('\nValidation Failed:');
        console.log('----------------------------------');
        console.log(validationDetails);
        
        return res.status(400).json({ 
          success: false,
          error: '标题不能为空',
          debug: validationDetails
        });
      }

      // Parse image order
      let imageOrder = [];
      try {
        imageOrder = JSON.parse(req.body.imageOrder || '[]');
        console.log('\nImage Order:');
        console.log('----------------------------------');
        console.log(imageOrder);
      } catch (error) {
        console.error('Invalid image order data:', error);
      }

      // Handle file uploads
      if (req.files?.length > 0) {
        console.log('\nHandling file uploads:', req.files.length, 'files');
        const imagesDir = path.join(__dirname, '../../public/images', plainDate);
        await fsPromises.mkdir(imagesDir, { recursive: true });
      }

      // Update note data
      const notes = await readNoteData();
      const noteIndex = notes.findIndex(note => note.date === formattedDate);
      
      if (noteIndex === -1) {
        console.log('\nNote not found:', formattedDate);
        return res.status(404).json({ 
          success: false,
          error: '笔记不存在' 
        });
      }

      notes[noteIndex] = {
        ...notes[noteIndex],
        title: title.trim(),
        uploadDate: DateFormatter.formatDate(new Date()).timestamp
      };

      console.log('\nUpdated note:', notes[noteIndex]);

      // Update image order
      if (imageOrder.length > 0) {
        const imagesDir = path.join(__dirname, '../../public/images', plainDate);
        const orderPath = path.join(imagesDir, 'order.json');

        await fsPromises.mkdir(path.dirname(orderPath), { recursive: true });
        await fsPromises.writeFile(orderPath, JSON.stringify(imageOrder, null, 2));
        console.log('\nImage order updated:', orderPath);
      }

      await saveNoteData(notes);
      console.log('\nNote data saved successfully');
      
      return res.json({ 
        success: true, 
        message: '保存成功',
        csrfToken: req.csrfToken()
      });
    } catch (error) {
      console.error('\nError in updateNote:');
      console.error('----------------------------------');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
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

      return res.json({ success: true });
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