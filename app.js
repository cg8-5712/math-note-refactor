const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { readNoteData } = require('./src/utils/noteData');
const app = express();

// 视图引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Add session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Root routes
app.get('/', async (req, res) => {
  const notes = await readNoteData();
  res.render('index', {
    title: '数学课堂板书系统',
    notes: notes
  });
});

// Admin routes
const adminRouter = require('./src/routes/admin');
app.use('/admin', adminRouter);

app.get('/notes/:date', (req, res) => {
  const date = req.params.date;
  if (!/^\d{8}$/.test(date)) {
    return res.status(400).render('error', {
        message: '无效的日期格式',
        error: { status: 400 }
    });
  }
  const imageDir = path.join(__dirname, 'public/images', date);
  const images = fs.readdirSync(imageDir)
    .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
    .map(file => `/images/${date}/${file}`);
  res.render('directory', {
    title: `${date}课程板书`,
    images: images,
    date: date
  });
});

// Error handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: '页面未找到',
    error: { status: 404 }
  });
});

module.exports = app;