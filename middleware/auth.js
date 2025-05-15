const adminConfig = require('../config/admin');

function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/admin/login');
}

module.exports = { requireAuth };