/**
 * 日期格式化工具类
 */
class DateFormatter {
  /**
   * 格式化日期为多种显示格式
   * @param {Date} date - 要格式化的日期对象
   * @returns {Object} 包含不同格式的日期字符串
   * @throws {Error} 如果输入的不是有效的Date对象
   */
  static formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid date object');
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return {
      date: `${month}.${day}`,
      displayDate: `${month}月${day}日`,
      fullDate: `${year}.${month}.${day}`,
      timestamp: `${year}.${month}.${day} ${hours}:${minutes}`,
      sortableDate: `${year}${month}${day}`,
      isoDate: date.toISOString()
    };
  }

  /**
   * 验证MMDD格式的日期字符串
   * @param {string} dateStr - 需要验证的日期字符串
   * @returns {boolean} 是否是有效的日期
   */
  static isValidDate(dateStr) {
    // 修改验证逻辑以支持MMDD和YYYYMMDD两种格式
    if (typeof dateStr !== 'string') return false;
    
    if (dateStr.length === 4) {
      // MMDD format
      return /^\d{4}$/.test(dateStr);
    } else if (dateStr.length === 8) {
      // YYYYMMDD format
      return /^\d{8}$/.test(dateStr);
    }
    return false;
  }
  
  // 添加年份处理方法
  static inferYear(dateStr) {
    if (dateStr.length === 8) {
      return dateStr.substring(0, 4);
    }
    return new Date().getFullYear().toString();
  }

  /**
   * 将MMDD格式转换为标准日期格式
   * @param {string} dateStr - MMDD格式的日期字符串
   * @returns {string} YYYY.MM.DD格式的日期
   * @throws {Error} 如果日期格式无效
   */
  static convertToFullDate(dateStr) {
    if (!this.isValidDate(dateStr)) {
      throw new Error('Invalid date format: must be MMDD format');
    }
    
    const currentYear = new Date().getFullYear();
    const month = dateStr.substring(0, 2);
    const day = dateStr.substring(2, 4);
    
    return `${currentYear}.${month}.${day}`;
  }

  /**
   * 解析完整日期字符串为Date对象
   * @param {string} fullDate - YYYY.MM.DD格式的日期字符串
   * @returns {Date} 日期对象
   * @throws {Error} 如果日期格式无效
   */
  static parseFullDate(fullDate) {
    const pattern = /^(\d{4})\.(\d{2})\.(\d{2})$/;
    const matches = fullDate.match(pattern);

    if (!matches) {
      throw new Error('Invalid full date format: must be YYYY.MM.DD');
    }

    const [_, year, month, day] = matches;
    const date = new Date(year, parseInt(month) - 1, day);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date values');
    }

    return date;
  }

  /**
   * 将YYYYMMDD格式转换为带点的日期格式
   * @param {string} dateStr - YYYYMMDD格式的日期字符串
   * @returns {string} YYYY.MM.DD格式的日期
   * @throws {Error} 如果日期格式无效
   */
  static convertFromPlainDate(dateStr) {
    if (!/^\d{8}$/.test(dateStr)) {
      throw new Error('Invalid date format: must be YYYYMMDD format');
    }
    
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    // Validate date
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date values');
    }
    
    return `${year}.${month}.${day}`;
  }

  /**
   * 将带点的日期格式转换为纯数字格式
   * @param {string} dateStr - YYYY.MM.DD格式的日期字符串
   * @returns {string} YYYYMMDD格式的日期
   */
  static convertToPlainDate(dateStr) {
    return dateStr.replace(/\./g, '');
  }
}

export default DateFormatter;