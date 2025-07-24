/**
 * API服务层
 * 处理数据存储和请求操作
 */
const constants = require('./constants');
const util = require('./util');
const loading = require('./loading');

/**
 * 获取用户信息
 * @return {Object|null} 用户信息对象或null
 */
const getUserInfo = () => {
  // 从缓存获取用户信息
  const storageUserInfo = wx.getStorageSync(constants.STORAGE_KEY.USER_INFO);
  if (storageUserInfo) {
    return storageUserInfo;
  }
  
  // 如果缓存中没有用户信息，则返回null
  return null;
};

/**
 * 保存用户信息
 * @param {Object} userInfo - 用户信息对象
 */
const saveUserInfo = (userInfo) => {
  wx.setStorageSync(constants.STORAGE_KEY.USER_INFO, userInfo);
};

/**
 * 获取用户令牌
 * @return {string|null} 用户令牌或null
 */
const getToken = () => {
  return wx.getStorageSync(constants.STORAGE_KEY.TOKEN) || null;
};

/**
 * 检查是否为游客模式
 * @return {boolean} 是否为游客模式
 */
const isGuestMode = () => {
  return wx.getStorageSync(constants.STORAGE_KEY.GUEST_MODE) || false;
};

/**
 * 设置游客模式
 * @param {boolean} isGuest - 是否为游客模式
 */
const setGuestMode = (isGuest) => {
  wx.setStorageSync(constants.STORAGE_KEY.GUEST_MODE, isGuest);
  
  // 如果设置为游客模式，清除可能存在的token，确保状态一致
  if (isGuest) {
    clearToken();
    console.log('已设置为游客模式，并清除了可能存在的token');
  }
};

/**
 * 清除游客模式
 */
const clearGuestMode = () => {
  wx.removeStorageSync(constants.STORAGE_KEY.GUEST_MODE);
};

/**
 * 保存用户令牌
 * @param {string} token - 用户令牌
 */
const saveToken = (token) => {
  wx.setStorageSync(constants.STORAGE_KEY.TOKEN, token);
};

/**
 * 清除用户令牌
 */
const clearToken = () => {
  wx.removeStorageSync(constants.STORAGE_KEY.TOKEN);
};

/**
 * 微信登录
 * @param {Object} userInfo - 用户信息（可选）
 * @return {Promise} 包含登录结果的Promise
 */
const wxLogin = (userInfo = {}) => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送code到后端换取token
          wx.request({
            url: constants.API_BASE_URL + '/user/login',
            method: 'POST',
            data: {
              code: res.code,
              nickName: userInfo.nickName || '食刻用户',
              avatarUrl: userInfo.avatarUrl || constants.DEFAULT_AVATAR,
              gender: userInfo.gender || 0
            },
            success: (result) => {
              console.log('登录API响应:', result);
              console.log('HTTP状态码:', result.statusCode);
              console.log('响应数据:', result.data);
              
              if (result.data.code === 0) {
                const loginResult = result.data.data;
                const token = loginResult.token;
                saveToken(token);
                // 保存完整的用户信息
                saveUserInfo(loginResult);
                resolve(token);
              } else {
                console.error('登录业务错误:', result.data);
                reject(new Error(result.data.message || '登录失败'));
              }
            },
            fail: (err) => {
              console.error('登录请求失败:', err);
              console.error('错误详情:', JSON.stringify(err));
              reject(new Error('网络错误，请检查网络连接: ' + JSON.stringify(err)));
            }
          });
        } else {
          reject(new Error('微信登录失败'));
        }
      },
      fail: () => {
        reject(new Error('微信登录失败'));
      }
    });
  });
};

/**
 * 检查并确保登录状态
 * @return {Promise} 包含登录结果的Promise
 */
const ensureLogin = async () => {
  const token = getToken();
  if (token) {
    return token;
  }
  
  // 如果是游客模式，返回特殊标识
  if (isGuestMode()) {
    return 'guest_token';
  }
  
  // 如果没有token，抛出错误，让用户手动登录
  throw new Error('用户未登录');
};

/**
 * 通用HTTP请求方法
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求URL
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求数据
 * @param {boolean} [options.auth=true] - 是否需要认证
 * @param {boolean} [options.loading=true] - 是否显示加载中提示
 * @return {Promise} 包含响应结果的Promise
 */
const request = async (options) => {
  const {
    url,
    method = 'GET',
    data = {},
    auth = true,
    loading: showLoading = true
  } = options;
  
  // 显示加载提示
  if (showLoading) {
    loading.showLoading();
  }
  
  // 构建请求头
  const header = {
    'Content-Type': 'application/json'
  };
  
  // 添加认证Token
  if (auth) {
    try {
      const token = await ensureLogin();
      // 如果是游客模式，跳过需要认证的请求
      if (token === 'guest_token') {
        if (showLoading) loading.hideLoading();
        throw new Error('游客模式下暂时无法使用此功能，请登录后再试');
      }
      header['Authorization'] = token;
    } catch (error) {
      if (showLoading) loading.hideLoading();
      throw error;
    }
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: url.startsWith('http') ? url : constants.API_BASE_URL + url,
      method,
      data,
      header,
      success: (res) => {
        if (showLoading) loading.hideLoading();
        
        // 处理响应
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 200) {
            // 统一处理返回的数据格式（后端有可能返回code=0或code=200）
            resolve(res.data.data);
          } else if (res.data.code === 401) {
            // 认证失败，清除token并跳转到登录页面
            console.log('认证失败，清除token并跳转到登录页面');
            clearToken();
            
            // 跳转到登录页面
            wx.navigateTo({
              url: '/pages/login/index'
            });
            
            reject(new Error('认证失败，请重新登录'));
          } else {
            // 处理其他业务错误
            console.error('业务错误:', res.data.message);
            
            // 特殊情况：返回"操作成功"但code不为0也不为200
            if (res.data.message && res.data.message.includes('操作成功')) {
              // 这是一个奇怪的情况，后端返回了成功消息但code不对，我们将其视为成功
              console.log('后端返回了操作成功但code不正确，视为成功:', res.data);
              resolve(res.data.data || {});
              return;
            }
            
            // 其他类型的业务错误，直接返回错误信息
            reject(new Error(res.data.message || '请求失败'));
          }
        } else {
          reject(new Error(`请求失败(${res.statusCode})`));
        }
      },
      fail: (err) => {
        if (showLoading) loading.hideLoading();
        reject(new Error('网络错误，请检查网络连接'));
      }
    });
  });
};

/**
 * 通用文件上传方法
 * @param {Object} options - 上传选项
 * @param {string} options.url - 上传URL
 * @param {string} options.filePath - 文件路径
 * @param {string} [options.name='file'] - 文件字段名
 * @param {Object} [options.formData] - 额外表单数据
 * @param {boolean} [options.loading=true] - 是否显示加载中提示
 * @return {Promise} 包含上传结果的Promise
 */
const uploadFile = async (options) => {
  const {
    url,
    filePath,
    name = 'file',
    formData = {},
    loading: showLoading = true
  } = options;
  
  // 显示加载提示
  if (showLoading) {
    loading.showLoading();
  }
  
  // 确保登录状态
  let token;
  try {
    token = await ensureLogin();
  } catch (error) {
    if (showLoading) loading.hideLoading();
    throw new Error('登录失败，请重试');
  }
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url.startsWith('http') ? url : constants.API_BASE_URL + url,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token
      },
      success: (res) => {
        if (showLoading) loading.hideLoading();
        
        try {
          const result = JSON.parse(res.data);
          if (result.code === 0) {
            resolve(result.data);
          } else if (result.code === 401) {
            // 认证失败，清除token并重新登录
            clearToken();
            wxLogin().then(() => {
              // 重新发起上传
              uploadFile(options).then(resolve).catch(reject);
            }).catch(err => {
              reject(new Error('登录失败，请重试'));
            });
          } else {
            reject(new Error(result.message || '上传失败'));
          }
        } catch (error) {
          reject(new Error('解析结果失败'));
        }
      },
      fail: (err) => {
        if (showLoading) loading.hideLoading();
        reject(new Error('网络错误，请检查网络连接'));
      }
    });
  });
};

/**
 * 获取所有食物记录
 * @return {Array} 食物记录数组
 */
const getFoodRecords = () => {
  return wx.getStorageSync(constants.STORAGE_KEY.FOOD_RECORDS) || [];
};

/**
 * 添加食物记录
 * @param {Object} record - 食物记录对象
 */
const addFoodRecord = (record) => {
  const records = getFoodRecords();
  records.unshift(record);
  wx.setStorageSync(constants.STORAGE_KEY.FOOD_RECORDS, records);
};

/**
 * 删除食物记录
 * @param {number} index - 记录索引
 * @return {boolean} 是否删除成功
 */
const deleteFoodRecord = (index) => {
  const records = getFoodRecords();
  if (index < 0 || index >= records.length) {
    return false;
  }
  
  records.splice(index, 1);
  wx.setStorageSync(constants.STORAGE_KEY.FOOD_RECORDS, records);
  return true;
};

/**
 * 清空所有食物记录
 */
const clearAllFoodRecords = () => {
  wx.removeStorageSync(constants.STORAGE_KEY.FOOD_RECORDS);
};

/**
 * 获取用户设置
 * @return {Object} 用户设置对象
 */
const getSettings = () => {
  return wx.getStorageSync(constants.STORAGE_KEY.SETTINGS) || {
    targetCalories: constants.DEFAULT_TARGET_CALORIES
  };
};

/**
 * 保存用户设置
 * @param {Object} settings - 设置对象
 */
const saveSettings = (settings) => {
  wx.setStorageSync(constants.STORAGE_KEY.SETTINGS, settings);
};

/**
 * 保存用户设置到服务器
 * @param {Object} settings - 用户设置对象
 * @return {Promise} 保存结果
 */
const saveUserSettingsToServer = (settings) => {
  return request({
    url: '/user/settings',
    method: 'POST',
    data: settings,
    loading: false
  });
};

/**
 * 从服务器获取用户设置
 * @return {Promise} 用户设置
 */
const getUserSettingsFromServer = () => {
  return request({
    url: '/user/settings',
    method: 'GET',
    loading: false
  });
};

/**
 * 获取特定日期的食物记录
 * @param {string} dateStr - 日期字符串(YYYY-MM-DD格式)
 * @return {Array} 符合日期的记录数组
 */
const getFoodRecordsByDate = (dateStr) => {
  const allRecords = getFoodRecords();
  if (!dateStr) return allRecords;
  
  return allRecords.filter(record => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    const recordDateStr = util.formatDate(recordDate);
    return recordDateStr === dateStr;
  });
};

/**
 * 获取今日卡路里总和
 * @return {number} 今日卡路里总和
 */
const getTodayTotalCalories = () => {
  const today = new Date();
  const todayStr = util.formatDate(today);
  const todayRecords = getFoodRecordsByDate(todayStr);
  
  return todayRecords.reduce((total, record) => {
    return total + (record.totalCalories || 0);
  }, 0);
};

/**
 * 获取本周卡路里总和
 * @return {number} 本周卡路里总和
 */
const getWeekTotalCalories = () => {
  const allRecords = getFoodRecords();
  const weekStart = util.getWeekStartDate(new Date());
  
  return allRecords.reduce((total, record) => {
    if (!record.date) return total;
    
    const recordDate = new Date(record.date);
    if (recordDate >= weekStart) {
      return total + (record.totalCalories || 0);
    }
    return total;
  }, 0);
};

/**
 * 获取记录总数
 * @return {number} 记录总数
 */
const getTotalRecordsCount = () => {
  return getFoodRecords().length;
};

/**
 * 获取卡路里总和
 * @return {number} 卡路里总和
 */
const getTotalCalories = () => {
  const allRecords = getFoodRecords();
  
  return allRecords.reduce((total, record) => {
    return total + (record.totalCalories || 0);
  }, 0);
};

/**
 * 食物识别请求
 * @param {string} imagePath - 图片路径
 * @return {Promise} 包含识别结果的Promise
 */
const recognizeFood = (imagePath) => {
  return new Promise((resolve, reject) => {
    // 使用粉色方块加载动画
    loading.showRecognizing();
    
    // 上传图片到后端进行识别
    wx.uploadFile({
      url: constants.API_BASE_URL + '/recognition/upload',
      filePath: imagePath,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: (res) => {
        loading.hideLoading();
        
        // 处理返回结果
        try {
          const result = JSON.parse(res.data);
          if (result.code === 200 && result.success) {
            resolve({
              success: true,
              foods: result.data.foods || []
            });
          } else {
            reject({
              success: false,
              message: result.message || '识别失败'
            });
          }
        } catch (error) {
          reject({
            success: false,
            message: '解析结果失败: ' + error.message
          });
        }
      },
      fail: (error) => {
        loading.hideLoading();
        reject({
          success: false,
          message: '网络请求失败: ' + error.errMsg
        });
      }
    });
  });
};

/**
 * 获取用户特定日期的饮食记录（从后端）
 * @param {string} date - 日期字符串(YYYY-MM-DD格式)
 * @return {Promise} 包含饮食记录的Promise
 */
const getUserMealsByDate = async (date) => {
  try {
    const result = await request({
      url: `/meal/date/${date}`,
      method: 'GET',
      loading: true,
      loadingText: '加载记录中...'
    });
    
    return result;
  } catch (error) {
    console.error('getUserMealsByDate 调用失败:', error);
    throw error;
  }
};

/**
 * 获取用户的最近饮食记录（从后端）
 * @param {number} limit - 限制数量
 * @return {Promise} 包含饮食记录的Promise
 */
const getRecentMeals = async (limit = 10) => {
  return request({
    url: `/meal/recent?limit=${limit}`,
    method: 'GET',
    loading: true,
    loadingText: '加载记录中...'
  });
};

/**
 * 清除所有用户数据（用于登出或切换到微信登录）
 */
const clearAllUserData = () => {
  clearToken();
  clearGuestMode();
  wx.removeStorageSync(constants.STORAGE_KEY.USER_INFO);
  wx.removeStorageSync(constants.STORAGE_KEY.FOOD_RECORDS);
  console.log('已清除所有用户数据，包括游客模式标记');
};

// 导出API函数
module.exports = {
  getUserInfo,
  saveUserInfo,
  getToken,
  saveToken,
  clearToken,
  clearAllUserData,
  wxLogin,
  ensureLogin,
  request,
  uploadFile,
  getFoodRecords,
  addFoodRecord,
  deleteFoodRecord,
  clearAllFoodRecords,
  getSettings,
  saveSettings,
  saveUserSettingsToServer,
  getUserSettingsFromServer,
  getFoodRecordsByDate,
  getTodayTotalCalories,
  getWeekTotalCalories,
  getTotalRecordsCount,
  getTotalCalories,
  recognizeFood,
  getUserMealsByDate,
  getRecentMeals,
  isGuestMode,
  setGuestMode,
  clearGuestMode
}; 