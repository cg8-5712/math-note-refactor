const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const adminConfig = require('../config/admin');
const { readNoteData, saveNoteData } = require('../utils/noteData');
const multer = require('multer');
const fs = require('fs').promises;

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = `public/images/${req.params.date}`;
        fs.mkdir(dir, { recursive: true })
            .then(() => cb(null, dir))
            .catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Get images for a date
router.get('/notes/:date/images', requireAuth, async (req, res) => {
    const { date } = req.params;
    const dir = `public/images/${date}`;
    
    try {
        const files = await fs.readdir(dir);
        res.json(files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)));
    } catch (error) {
        res.json([]);
    }
});

// Upload new images
router.post('/notes/:date/images', requireAuth, upload.array('images'), async (req, res) => {
    res.json({ success: true });
});

// Update image order
router.put('/notes/:date/images/order', requireAuth, async (req, res) => {
    const { date } = req.params;
    const { images } = req.body;
    
    try {
        // Save the order somewhere (e.g., in a JSON file)
        await fs.writeFile(
            `public/images/${date}/order.json`,
            JSON.stringify(images)
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '保存顺序失败' });
    }
});

// Delete image
router.delete('/notes/:date/images/:image', requireAuth, async (req, res) => {
    const { date, image } = req.params;
    
    try {
        await fs.unlink(`public/images/${date}/${image}`);
        res.json({ success: true });
    } catch (error) {
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

router.post('/notes', requireAuth, async (req, res) => {
  const { date, title } = req.body;
  const dateInfo = formatDate(new Date());
  const newNote = `${dateInfo.fullDate}|${title}|${dateInfo.timestamp}\n`;
  
  try {
    await fs.appendFile('data/index.txt', newNote);
    res.redirect('/admin');
  } catch (error) {
    res.status(500).render('error', {
      message: '保存失败',
      error: error
    });
  }
});

router.put('/notes/:date', requireAuth, async (req, res) => {
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

router.delete('/notes/:date', requireAuth, async (req, res) => {
  const { date } = req.params;
  
  try {
    const notes = await readNoteData();
    const filteredNotes = notes.filter(note => note.date !== date);
    await saveNoteData(filteredNotes);
    res.json({ success: true });
  } catch (error) {
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