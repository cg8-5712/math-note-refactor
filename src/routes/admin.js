const express = require('express');
const router = express.Router();
const multer = require('../config/multer');
const { validateDate, validateTitle, validateFile } = require('../middleware/validation');
const noteController = require('../controllers/noteController');
const imageController = require('../controllers/imageController');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// 登录相关路由 - 这些路由不需要认证
router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// 需要认证的路由
router.use(requireAuth);

// Dashboard routes
router.get('/', noteController.getDashboard);
router.post('/new', validateTitle, noteController.createNote);

// Note routes
router.get('/:date', validateDate, noteController.getNote);
router.post('/:date', 
  validateDate,
  validateTitle, 
  multer.array('images', 10),  // Add multer to handle potential image uploads
  noteController.updateNote
);
router.delete('/:date', validateDate, noteController.deleteNote);

// Image routes
router.get('/:date/images', validateDate, imageController.getImages);
router.delete('/:date/images/:image', validateDate, imageController.deleteImage);

module.exports = router;