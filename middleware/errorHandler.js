const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
      message: err.message || '服务器错误',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  };
  
  module.exports = errorHandler;