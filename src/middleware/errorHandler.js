const errorHandler = (err, req, res) => {
  console.error(err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: '文件大小超过限制',
      code: 'FILE_TOO_LARGE'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: '上传文件数量超过限制',
      code: 'TOO_MANY_FILES'
    });
  }
  
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: '请求的资源不存在',
      code: 'NOT_FOUND'
    });
  }

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: '无效的请求令牌',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.code === 'EBADCSRFTOKEN') {
    // 为 XHR 请求返回特殊状态码
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(449).json({
        error: '令牌已过期，请重试',
        code: 'TOKEN_EXPIRED'
      });
    }
    // 非 XHR 请求直接刷新页面
    return res.redirect(req.headers.referer || '/');
  }
  
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器错误' 
    : err.message;

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      error: message,
      code: err.code || 'SERVER_ERROR'
    });
  }

  res.status(statusCode).render('error', {
    message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

export default errorHandler;