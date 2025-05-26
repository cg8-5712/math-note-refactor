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
    if (typeof dateStr !== 'string') {
      return false;
    }

    if (!/^\d{4}$/.test(dateStr)) {
      return false;
    }

    const month = parseInt(dateStr.substring(0, 2));
    const day = parseInt(dateStr.substring(2, 4));
    
    if (month < 1 || month > 12) {
      return false;
    }
    
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    if (day < 1 || day > daysInMonth) {
      return false;
    }
    
    return true;
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
}

module.exports = DateFormatter;