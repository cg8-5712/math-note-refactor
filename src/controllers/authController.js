const adminConfig = require('../config/admin');

class AuthController {
  showLoginForm(req, res) {
    if (req.session.isAuthenticated) {
      return res.redirect('/admin');
    }
    res.render('admin/login', {
      title: '管理员登录',
      error: req.flash('error')
    });
  }

  login(req, res) {
    const { password } = req.body;
    
    if (adminConfig.verifyPassword(password)) {
      req.session.isAuthenticated = true;
      res.redirect('/admin');
    } else {
      req.flash('error', '密码错误');
      res.redirect('/admin/login');
    }
  }

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
}

module.exports = new AuthController();