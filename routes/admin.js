const express = require('express');
const router = express.Router();
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const adminConfig = require('../config/admin');
const { readNoteData, saveNoteData } = require('../utils/noteData');
const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images', req.params.date);
        // Use fs.promises.mkdir but handle the callback properly
        fs.promises.mkdir(dir, { recursive: true })
            .then(() => cb(null, dir))
            .catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Get images for a date
router.get('/:date/images', requireAuth, async (req, res) => {
  const { date } = req.params;
  try {
    const imagesDir = path.join(__dirname, '../public/images', date);
    
    try {
      await fsPromises.access(imagesDir);
    } catch {
      return res.json([]);
    }
    
    const files = await fsPromises.readdir(imagesDir);
    // Filter out JSON files and only keep image files
    const images = files.filter(file => 
      !file.endsWith('.json') && /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    
    res.json(images);
  } catch (error) {
    console.error('Error reading images:', error);
    res.status(500).json({ error: 'Failed to load images' });
  }
});

// Upload new images
router.post('/:date/images', requireAuth, upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '没有上传文件' });
        }
        
        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            path: file.path
        }));
        
        res.json({ 
            success: true, 
            files: uploadedFiles 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: '上传失败' });
    }
});

// Update image order
router.put('/:date/images/order', requireAuth, async (req, res) => {
    const { date } = req.params;
    const { images } = req.body;
    
    try {
        const orderPath = path.join(__dirname, '../public/images', date, 'order.json');
        await fsPromises.writeFile(
            orderPath,
            JSON.stringify(images, null, 2)
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to save order:', error);
        res.status(500).json({ error: '保存顺序失败' });
    }
});

// Delete image
router.delete('/:date/images/:image', requireAuth, async (req, res) => {
    const { date, image } = req.params;
    
    try {
        const imagePath = path.join(__dirname, '../public/images', date, image);
        await fsPromises.unlink(imagePath);
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to delete image:', error);
        res.status(500).json({ error: '删除失败' });
    }
});

router.get('/login', (req, res) => {
  res.render('admin/login', { title: '管理员登录' });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (adminConfig.verifyPassword(password)) {
    req.session.isAuthenticated = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', { 
      title: '管理员登录',
      error: '密码错误'
    });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const notes = await readNoteData();
  res.render('admin/dashboard', { 
    title: '管理面板',
    notes: notes 
  });
});

router.get('/:date', requireAuth, async (req, res) => {
  const { date } = req.params;
  const notes = await readNoteData();
  const note = notes.find(n => n.date === date);
  
  if (!note) {
    return res.status(404).render('error', { message: '笔记不存在' });
  }

  res.render('admin/edit', { 
    title: '修改笔记',
    note: note
  });
});

router.post('/notes', requireAuth, async (req, res) => {
  const { date, title } = req.body;
  const currentYear = new Date().getFullYear();
  
  // Convert MMDD to YYYY.MM.DD
  const month = date.substring(0, 2);
  const day = date.substring(2, 4);
  const fullDate = `${currentYear}.${month}.${day}`;
  
  const dateInfo = formatDate(new Date());
  const newNote = `${fullDate}|${title}|${dateInfo.timestamp}\n`;
  
  try {
    await fsPromises.appendFile(
      path.join(__dirname, '../data/index.txt'), 
      newNote, 
      'utf8'
    );
    res.redirect('/admin');
  } catch (error) {
    console.error('Failed to save note:', error);
    res.status(500).render('error', {
      message: '保存失败',
      error: error
    });
  }
});

router.put('/:date', requireAuth, async (req, res) => {
  const { date } = req.params;
  const { title } = req.body;
  const dateInfo = formatDate(new Date());
  
  try {
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
    res.status(500).json({ error: '更新失败' });
  }
});

router.delete('/:date', requireAuth, async (req, res) => {
  const { date } = req.params;
  
  try {
    // Delete note from index.txt
    const notes = await readNoteData();
    const filteredNotes = notes.filter(note => note.date !== date);
    await saveNoteData(filteredNotes);

    // Delete associated image folder
    const imageDir = path.join(__dirname, '../public/images', date.replace(/\./g, ''));
    try {
      await fsPromises.access(imageDir);
      // Remove all files in directory first
      const files = await fsPromises.readdir(imageDir);
      for (const file of files) {
        await fsPromises.unlink(path.join(imageDir, file));
      }
      // Then remove the directory
      await fsPromises.rmdir(imageDir);
    } catch (error) {
      // If directory doesn't exist, just ignore the error
      console.log('Image directory not found:', error);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return {
    Date: `${month}.${day}`,
    displayDate: `${month}.${day}`,
    timestamp: `${year}.${month}.${day} ${hours}:${minutes}`
  };
}

module.exports = router;