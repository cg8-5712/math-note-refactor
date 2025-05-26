const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const csrf = require('csurf');
const configureExpress = require('./src/config/express');

const app = express();

// 基础中间件配置
configureExpress(app);

// 安全中间件
app.use(helmet());

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session 中间件
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000
  }
}));

// CSRF 保护
const csrfProtection = csrf();
app.use(csrfProtection);

// 为所有模板添加 CSRF token
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// 路由
app.use('/', require('./src/routes/index'));
app.use('/admin', require('./src/routes/admin'));

// 错误处理
app.use(require('./src/middleware/errorHandler'));

module.exports = app;