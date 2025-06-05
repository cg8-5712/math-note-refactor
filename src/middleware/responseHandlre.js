const responseHandler = {
  success(res, data = null, message = 'ok') {
    return res.json({
      success: true,
      data,
      message,
      csrfToken: res.locals.csrfToken
    });
  },

  error(res, error, status = 400) {
    const errorMessage = error instanceof Error ? error.message : error;
    return res.status(status).json({
      success: false,
      error: errorMessage,
      csrfToken: res.locals.csrfToken
    });
  }
};

export default responseHandler;