const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: '文件大小超过限制' });
  }
  
  if (err.code === 'ENOENT') {
    return res.status(404).render('error', {
      message: '请求的资源不存在',
      error: { status: 404 }
    });
  }

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      message: '无效的请求令牌',
      error: { status: 403 }
    });
  }
  
  res.status(err.status || 500).render('error', {
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = errorHandler;