const DateFormatter = require('../utils/dateFormatter');

const validateDate = (req, res, next) => {
  const { date } = req.params;
  
  // Check if date exists and has correct format (YYYYMMDD)
  if (!date || !/^\d{8}$/.test(date)) {
    return res.status(400).json({
      error: '无效的日期格式',
      code: 'INVALID_DATE_FORMAT'
    });
  }

  try {
    // Try to convert the date format
    DateFormatter.convertFromPlainDate(date);
    next();
  } catch (error) {
    return res.status(400).json({
      error: '无效的日期',
      code: 'INVALID_DATE'
    });
  }
};

const validateTitle = (req, res, next) => {
  console.log('validateTitle req.body:', req.body); // 调试用
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: '标题不能为空',
      code: 'INVALID_TITLE'
    });
  }
  if (title.length > 100) {
    return res.status(400).json({
      error: '标题不能超过100个字符',
      code: 'TITLE_TOO_LONG'
    });
  }
  next();
};

const validateFile = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: '没有上传文件',
      code: 'NO_FILES'
    });
  }

  next();
};

export default {
  validateDate,
  validateTitle,
  validateFile
};