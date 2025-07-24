// profile.js
const api = require('../../utils/api');
const constants = require('../../utils/constants');

Component({
  data: {
    userInfo: {
      avatarUrl: constants.DEFAULT_AVATAR,
      nickName: '小青春',
    },
    hasUserInfo: true, // 默认显示状态
    // 统计数据
    height: 168,
    weight: 56,
    caloriesGoal: 2000,
    useDefaultUser: false // 是否使用默认用户
  },
  
  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      this.loadUserInfo();
      this.loadSettings();
    }
  },
  
  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    show() {
      // 每次页面显示时刷新统计数据
      this.loadUserInfo();
      this.loadSettings();
    }
  },
  
  methods: {
    /**
     * 加载用户信息
     */
    loadUserInfo() {
      const userInfo = api.getUserInfo();
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
      }
    },
    
    /**
     * 加载设置信息
     */
    loadSettings() {
      const app = getApp();
      const settings = wx.getStorageSync('settings') || {};
      
      this.setData({
        useDefaultUser: settings.useDefaultUser || false
      });
      
      // 同步到全局
      if (app && app.globalData) {
        app.globalData.useDefaultUser = settings.useDefaultUser || false;
      }
    },
    
    /**
     * 切换默认用户设置
     */
    toggleDefaultUser(e) {
      const useDefaultUser = e.detail.value;
      
      // 保存设置
      const settings = wx.getStorageSync('settings') || {};
      settings.useDefaultUser = useDefaultUser;
      wx.setStorageSync('settings', settings);
      
      // 更新数据
      this.setData({
        useDefaultUser: useDefaultUser
      });
      
      // 同步到全局
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.useDefaultUser = useDefaultUser;
      }
      
      // 提示用户
      wx.showToast({
        title: useDefaultUser ? '已启用默认用户' : '已关闭默认用户',
        icon: 'none'
      });
      
      // 如果启用了默认用户，则直接使用默认用户登录
      if (useDefaultUser && app) {
        app.useDefaultUser();
      }
    },
    
    /**
     * 导航到历史统计页面
     */
    navigateToHistory() {
      wx.switchTab({
        url: '/pages/history/history'
      });
    },
    
    /**
     * 导航到食物图库页面
     */
    navigateToFoodLibrary() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    /**
     * 导航到设置页面
     */
    navigateToSettings() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    /**
     * 关于我们页面
     */
    aboutUs() {
      wx.showModal({
        title: '关于我们',
        content: '食刻卡路里 v1.0.0\n一款简单好用的饮食记录应用',
        showCancel: false
      });
    },
    
    /**
     * 更新用户头像
     */
    onChooseAvatar(e) {
      const avatarUrl = e.detail.avatarUrl;
      
      this.setData({
        'userInfo.avatarUrl': avatarUrl
      });
      
      // 更新存储的用户信息
      const userInfo = api.getUserInfo() || {};
      userInfo.avatarUrl = avatarUrl;
      api.saveUserInfo(userInfo);
    },
    
    /**
     * 更新用户昵称
     */
    onInputChange(e) {
      const nickName = e.detail.value;
      
      this.setData({
        'userInfo.nickName': nickName
      });
      
      // 更新存储的用户信息
      const userInfo = api.getUserInfo() || {};
      userInfo.nickName = nickName;
      api.saveUserInfo(userInfo);
    }
  }
}); 