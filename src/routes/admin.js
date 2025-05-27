const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const noteController = require('../controllers/noteController');
const imageController = require('../controllers/imageController');
const adminConfig = require('../config/admin');
const upload = require('../config/multer');

// Authentication routes
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

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Note routes
router.get('/', requireAuth, noteController.getDashboard);
router.get('/:date', requireAuth, noteController.getNote);
router.post('/notes', requireAuth, noteController.createNote);
router.post('/:date/upload', requireAuth, upload.array('images'), imageController.uploadImages);
router.post('/:date/restore', requireAuth, imageController.restoreImages);
router.post('/:date/reorder', requireAuth, imageController.updateImageOrder);  // Changed from PUT to POST
router.delete('/:date/images/:image', requireAuth, imageController.deleteImage);
router.post('/:date/update', requireAuth, (req, res, next) => {
  if (req.body._method === 'PUT') {
    return noteController.updateNote(req, res, next);
  }
  next();
});

// Image routes
router.get('/:date/images', requireAuth, imageController.getImages);
router.post('/:date/images', requireAuth, upload.array('images'), imageController.uploadImages);
router.put('/:date/images/order', requireAuth, imageController.updateImageOrder);
router.delete('/:date/images/:image', requireAuth, imageController.deleteImage);

module.exports = router;