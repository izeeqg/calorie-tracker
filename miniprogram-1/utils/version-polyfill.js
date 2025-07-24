/**
 * @file version-polyfill.js
 * @description 修复Vant库中使用已废弃API的问题
 */

// 缓存的系统信息
let cachedSystemInfo = null;

/**
 * 获取系统信息的polyfill，替代已废弃的wx.getSystemInfoSync
 * @returns {Object} 系统信息对象
 */
function getSystemInfoPolyfill() {
  if (cachedSystemInfo == null) {
    try {
      // 使用推荐的新API
      const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
      const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
      const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
      const systemSetting = wx.getSystemSetting ? wx.getSystemSetting() : {};
      
      // 合并所有信息，模拟原wx.getSystemInfoSync的返回值
      cachedSystemInfo = {
        ...appBaseInfo,
        ...deviceInfo,
        ...windowInfo,
        ...systemSetting
      };
      
      // 如果无法获取SDKVersion，则回退使用旧API
      if (!cachedSystemInfo.SDKVersion) {
        cachedSystemInfo = wx.getSystemInfoSync();
      }
    } catch (e) {
      // 出错时回退到旧API
      cachedSystemInfo = wx.getSystemInfoSync();
      console.warn('使用已废弃的wx.getSystemInfoSync作为回退方案');
    }
  }
  return cachedSystemInfo;
}

/**
 * 安装polyfill
 */
function installPolyfill() {
  // 保存原始方法
  const originalGetSystemInfoSync = wx.getSystemInfoSync;
  
  // 替换为我们的polyfill
  wx.getSystemInfoSync = function() {
    console.warn('wx.getSystemInfoSync已废弃，请使用新API替代');
    return getSystemInfoPolyfill();
  };
  
  console.info('已安装wx.getSystemInfoSync的polyfill');
}

module.exports = {
  installPolyfill
}; 