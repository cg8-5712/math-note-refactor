function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  // 保存原始请求URL
  req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

module.exports = { requireAuth };