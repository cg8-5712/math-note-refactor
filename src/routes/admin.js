import express from 'express';
import multer from '../config/multer.js';
import validation from '../middleware/validation.js';
import noteController from '../controllers/noteController.js';
import imageController from '../controllers/imageController.js';
import authController from '../controllers/authController.js';
import requireAuth from '../middleware/auth.js';  // Changed to named import

const router = express.Router();
const { validateDate, validateTitle, validateFile } = validation;

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
  multer.array('images', 10),  // Add multer to handle potential image uploads
  validateTitle, 
  noteController.updateNote
);
router.delete('/:date', validateDate, noteController.deleteNote);

// Image routes
router.get('/:date/images', validateDate, imageController.getImages);
router.delete('/:date/images/:image', validateDate, imageController.deleteImage);

export default router;