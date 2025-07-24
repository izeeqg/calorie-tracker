/**
 * 格式化日期时间
 * @param {Date} date - 需要格式化的日期对象
 * @return {string} 格式化后的时间字符串，格式为 YYYY/MM/DD HH:MM:SS
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 格式化数字，个位数前补0
 * @param {number} n - 需要格式化的数字
 * @return {string} 格式化后的字符串
 */
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 格式化日期（年-月-日）
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @return {string} 格式化后的日期字符串，格式为 YYYY-MM-DD
 */
const formatDate = date => {
  if (!date) return '';
  
  // 确保date是一个Date对象
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // 尝试将字符串转换为日期
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    // 处理时间戳
    dateObj = new Date(date);
  } else {
    // 无法处理的类型，返回空字符串
    console.warn('formatDate: 不支持的日期类型', typeof date, date);
    return '';
  }
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.warn('formatDate: 无效的日期', date);
    return String(date);
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`;
}

/**
 * 格式化日期时间（年-月-日 时:分）
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @return {string} 格式化后的日期时间字符串，格式为 YYYY-MM-DD HH:MM
 */
const formatDateTime = date => {
  if (!date) return '';
  
  // 确保date是一个Date对象
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // 尝试将字符串转换为日期
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    // 处理时间戳
    dateObj = new Date(date);
  } else {
    // 无法处理的类型，返回空字符串
    console.warn('formatDateTime: 不支持的日期类型', typeof date, date);
    return '';
  }
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.warn('formatDateTime: 无效的日期', date);
    return String(date);
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}`;
}

/**
 * 计算指定日期的时间戳（零点）
 * @param {Date} date - 日期对象
 * @return {number} 该日期0点的时间戳
 */
const getDayStartTimestamp = date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate.getTime();
}

/**
 * 获取本周开始日期（周日为一周的开始）
 * @param {Date} date - 日期对象
 * @return {Date} 本周开始的日期对象
 */
const getWeekStartDate = date => {
  const now = date || new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
}

/**
 * 深拷贝对象
 * @param {Object} obj - 需要拷贝的对象
 * @return {Object} 拷贝后的新对象
 */
const deepClone = obj => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
}

/**
 * 计算两个日期之间的天数差
 * @param {Date} date1 - 第一个日期
 * @param {Date} date2 - 第二个日期
 * @return {number} 天数差
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round(Math.abs((d1 - d2) / oneDay));
}

/**
 * 格式化时间戳或日期字符串为友好的时间格式
 * @param {number|string|Date} time - 时间戳、日期字符串或Date对象
 * @return {string} 格式化后的时间字符串
 */
const formatFriendlyTime = (time) => {
  if (!time) return '';
  
  let date;
  if (typeof time === 'string') {
    // 尝试解析日期字符串
    date = new Date(time);
  } else if (time instanceof Date) {
    date = time;
  } else {
    // 假设是时间戳
    date = new Date(time);
  }
  
  // 无效日期检查
  if (isNaN(date.getTime())) {
    return time.toString();
  }
  
  const now = new Date();
  const diff = now - date;
  const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // 今天的时间只显示时分
  if (dayDiff === 0) {
    return '今天 ' + [date.getHours(), padZero(date.getMinutes())].join(':');
  }
  
  // 昨天
  if (dayDiff === 1) {
    return '昨天 ' + [date.getHours(), padZero(date.getMinutes())].join(':');
  }
  
  // 7天内
  if (dayDiff < 7) {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return '周' + weekDays[date.getDay()] + ' ' + [date.getHours(), padZero(date.getMinutes())].join(':');
  }
  
  // 其他情况，显示年月日时分
  return [date.getFullYear(), padZero(date.getMonth() + 1), padZero(date.getDate())].join('/') + ' ' + 
         [date.getHours(), padZero(date.getMinutes())].join(':');
};

/**
 * 数字补零
 * @param {number} n - 需要格式化的数字
 * @return {string} 格式化后的字符串
 */
const padZero = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  formatDate,
  formatDateTime,
  getDayStartTimestamp,
  getWeekStartDate,
  deepClone,
  daysBetween,
  formatFriendlyTime,
  padZero
}
