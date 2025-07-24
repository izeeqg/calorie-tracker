// app.js
const constants = require('./utils/constants');
const versionPolyfill = require('./utils/version-polyfill');
const api = require('./utils/api');

App({
  onLaunch() {
    // 安装API polyfill，修复已废弃API的警告
    versionPolyfill.installPolyfill();
    
    // 清除可能存在的默认用户数据
    api.clearAllUserData();
    
    // 检查是否是第一次使用
    this.checkFirstTime();
  },

  /**
   * 检查是否是第一次使用应用
   */
  checkFirstTime() {
    const hasUsedBefore = wx.getStorageSync('hasUsedBefore');
    const token = api.getToken();
    const isGuest = api.isGuestMode();
    
    console.log('=== 应用启动检查 ===');
    console.log('是否使用过:', hasUsedBefore);
    console.log('是否有token:', !!token);
    console.log('是否游客模式:', isGuest);
    
    // 标记已经使用过
    if (!hasUsedBefore) {
      wx.setStorageSync('hasUsedBefore', true);
    }
    
    // 现在登录页面是启动页面，所以不需要在这里跳转
    // 登录页面会自行处理登录逻辑
    this.checkSession();
  },
  
  /**
   * 检查当前会话是否过期
   */
  checkSession() {
    wx.checkSession({
      success: () => {
        // 会话未过期，检查是否有token
        const token = api.getToken();
        if (!token) {
          // 没有token，需要登录
          console.log('没有token，需要登录');
        } else {
          // 已有token，获取用户信息
          this.getUserInfo();
        }
      },
      fail: () => {
        // 登录态过期，清除token
        console.log('登录态过期，清除token');
        api.clearToken();
      }
    });
  },
  
  /**
   * 执行登录流程
   */
  doLogin() {
    // 使用粉色方块加载动画
    const loading = require('./utils/loading');
    loading.showLoading();
    
    api.wxLogin().then(token => {
      loading.hideLoading();
      console.log('登录成功，获取到token');
      this.getUserInfo();
    }).catch(err => {
      loading.hideLoading();
      console.error('登录失败：', err.message);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    });
  },
  
  /**
   * 获取用户信息
   */
  getUserInfo() {
    const token = api.getToken();
    if (!token) return;
    
    wx.request({
      url: constants.API_BASE_URL + '/user/profile',
      method: 'GET',
      header: {
        'Authorization': token
      },
      success: (res) => {
        if (res.data.code === 0) {
          const userInfo = res.data.data;
          api.saveUserInfo(userInfo);
          this.globalData.userInfo = userInfo;
          
          // 触发获取用户信息成功事件
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(userInfo);
          }
        } else {
          console.error('获取用户信息失败:', res.data.message);
          // 认证失败，清除token
          api.clearToken();
        }
      },
      fail: (err) => {
        console.error('获取用户信息请求失败:', err);
        // 请求失败，清除token
        api.clearToken();
      }
    });
  },
  
  globalData: {
    userInfo: null,
    baseUrl: constants.API_BASE_URL
  },

  /**
   * 全局分享配置 - 分享给朋友
   */
  onShareAppMessage() {
    return {
      title: '食刻卡路里 - AI智能识别，轻松记录卡路里',
      path: '/pages/index/index',
      desc: '健康饮食从记录开始，AI智能识别食物，精准计算卡路里'
    };
  },

  /**
   * 全局分享配置 - 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '食刻卡路里 - AI智能识别，轻松记录卡路里 #健康生活 #卡路里管理',
      query: '',
      desc: '健康饮食从记录开始，AI智能识别食物，精准计算卡路里'
    };
  }
})
