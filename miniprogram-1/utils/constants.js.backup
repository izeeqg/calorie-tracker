/**
 * 应用常量定义
 */

/**
 * 餐食类型枚举
 * @enum {number}
 */
const MEAL_TYPE = {
  /** 早餐 */
  BREAKFAST: 1,
  /** 午餐 */
  LUNCH: 2,
  /** 晚餐 */
  DINNER: 3,
  /** 宵夜 */
  MIDNIGHT_SNACK: 4,
  /** 零食 */
  SNACK: 5
};

/**
 * 餐食类型映射表
 * @type {Object}
 */
const MEAL_TYPE_TEXT = {
  1: '早餐',
  2: '午餐',
  3: '晚餐',
  4: '宵夜',
  5: '零食'
};

/**
 * 存储键名
 * @enum {string}
 */
const STORAGE_KEY = {
  /** 用户信息 */
  USER_INFO: 'user_info',
  /** 食物记录 */
  FOOD_RECORDS: 'food_records',
  /** 设置信息 */
  SETTINGS: 'settings',
  /** 用户令牌 */
  TOKEN: 'user_token',
  /** 游客模式标记 */
  GUEST_MODE: 'guest_mode'
};

/**
 * 默认目标卡路里值
 * @type {number}
 */
const DEFAULT_TARGET_CALORIES = 2000;

/**
 * 默认食物图片
 * @type {string}
 */
const DEFAULT_FOOD_IMAGE = '/images/food-default.png';

/**
 * 默认头像
 * @type {string}
 */
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

/**
 * 营养素类型
 * @enum {string}
 */
const NUTRIENT_TYPE = {
  /** 蛋白质 */
  PROTEIN: 'protein',
  /** 脂肪 */
  FAT: 'fat',
  /** 碳水化合物 */
  CARBS: 'carbs'
};

/**
 * 应用版本
 * @type {string}
 */
const APP_VERSION = '1.0.0';

/**
 * API基础URL
 * @type {string}
 */
// 开发环境配置
// const API_BASE_URL = 'http://localhost:8080/api';

// 生产环境配置 - 使用新域名 calorietracker.top
const API_BASE_URL = 'https://calorietracker.top/api';

// 备用配置 - 直接使用服务器IP（调试时使用）
// const API_BASE_URL = 'http://59.110.150.196/api';

/**
 * MinIO基础URL
 * @type {string}
 */
// 开发环境配置
// const MINIO_BASE_URL = 'http://localhost:9000';

// 生产环境配置 - 使用新域名 calorietracker.top
const MINIO_BASE_URL = 'https://calorietracker.top/files';

// 备用配置 - 直接使用服务器IP（调试时使用）
// const MINIO_BASE_URL = 'http://59.110.150.196/files';

/**
 * MinIO桶名称
 * @type {string}
 */
const MINIO_BUCKET = 'calorie-images';

/**
 * 生成MinIO文件URL
 * @param {string} fileName - 文件名
 * @return {string} 完整的MinIO文件URL
 */
const getMinioUrl = (fileName) => {
  return `${MINIO_BASE_URL}/${fileName}`;
};

/**
 * 清理并修复图片URL
 * @param {string} imageUrl - 原始图片URL
 * @return {string} 修复后的图片URL
 */
const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // 如果已经是完整的HTTP URL，直接返回
  if (imageUrl.startsWith('http')) {
    // 检查是否包含重复的calorie-images路径
    if (imageUrl.includes('/files/calorie-images/')) {
      // 移除重复的calorie-images路径
      return imageUrl.replace('/files/calorie-images/', '/files/');
    }
    return imageUrl;
  }
  
  // 如果是相对路径，需要拼接完整URL
  let cleanPath = imageUrl;
  
  // 移除开头的calorie-images路径（如果存在）
  if (cleanPath.startsWith('calorie-images/')) {
    cleanPath = cleanPath.replace('calorie-images/', '');
  }
  
  // 移除开头的斜杠
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${MINIO_BASE_URL}/${cleanPath}`;
};

/**
 * 生成静态资源URL
 * @param {string} fileName - 文件名
 * @return {string} 完整的静态资源URL
 */
const getStaticUrl = (fileName) => {
  return `https://calorietracker.top/static/${fileName}`;
};

module.exports = {
  MEAL_TYPE,
  MEAL_TYPE_TEXT,
  STORAGE_KEY,
  DEFAULT_TARGET_CALORIES,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_AVATAR,
  NUTRIENT_TYPE,
  APP_VERSION,
  API_BASE_URL,
  MINIO_BASE_URL,
  MINIO_BUCKET,
  getMinioUrl,
  getStaticUrl,
  fixImageUrl
}; 