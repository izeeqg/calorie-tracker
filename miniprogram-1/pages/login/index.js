const app = getApp();
const constants = require('../../utils/constants');
const api = require('../../utils/api');
const loading = require('../../utils/loading');

Page({
  data: {
    redirectUrl: '', // 登录后重定向的页面
    logoUrl: constants.getStaticUrl('logo.png'), // Logo图片URL
    agreedToPrivacy: false, // 是否同意隐私政策
    agreedToTerms: false, // 是否同意用户协议
    forceLogin: false // 是否强制登录（用户主动进入登录页面）
  },

  onLoad(options) {
    console.log('=== 登录页面onLoad ===');
    console.log('页面参数:', options);
    
    // 记录重定向URL
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect)
      });
    }
    
    // 记录是否强制登录（用户主动进入登录页面）
    if (options.forceLogin) {
      this.setData({
        forceLogin: true
      });
    }
    
    // 初始化数据状态
    console.log('初始化数据状态');
    this.setData({
      agreedToPrivacy: false,
      agreedToTerms: false
    });
  },
  
  onReady() {
    // 页面渲染完成后再检查登录状态，确保所有存储操作都已完成
    this.checkLoginStatus();
  },
  
  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = api.getToken();
    let isGuest = api.isGuestMode();
    
    console.log('=== 登录页面检查登录状态 ===');
    console.log('是否有token:', !!token);
    console.log('是否游客模式:', isGuest);
    console.log('是否强制登录:', this.data.forceLogin);
    console.log('token内容:', token ? token.substring(0, 20) + '...' : 'null');
    
    // 状态冲突检查：如果既有token又是游客模式，清理状态
    if (token && isGuest) {
      console.warn('检测到状态冲突：既有token又是游客模式，清理游客模式标记');
      api.clearGuestMode();
      isGuest = false; // 更新本地变量
    }
    
    // 如果用户已经登录且不是游客模式，直接跳转到首页
    if (token && !isGuest) {
      console.log('用户已登录，自动跳转到首页');
      wx.switchTab({
        url: '/pages/index/index'
      });
      return;
    }
    
    // 如果是强制登录模式（用户主动进入登录页面），不自动跳转
    if (this.data.forceLogin) {
      console.log('强制登录模式，显示登录界面供用户选择');
      return;
    }
    
    // 如果是游客模式且不是强制登录，跳转到首页
    if (isGuest && !token) {
      console.log('纯游客模式且非强制登录，跳转到首页');
      wx.switchTab({
        url: '/pages/index/index'
      });
      return;
    }
    
    // 用户未登录且非游客模式，显示登录界面
    console.log('用户未登录，显示登录界面');
  },

  /**
   * 隐私政策同意状态变更
   */
  onPrivacyChange(e) {
    this.setData({
      agreedToPrivacy: e.detail.value.length > 0
    });
  },

  /**
   * 用户协议同意状态变更
   */
  onTermsChange(e) {
    this.setData({
      agreedToTerms: e.detail.value.length > 0
    });
  },

  /**
   * 查看隐私政策
   */
  viewPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy/index?type=privacy'
    });
  },

  /**
   * 查看用户协议
   */
  viewUserAgreement() {
    wx.navigateTo({
      url: '/pages/privacy/index?type=agreement'
    });
  },

  /**
   * 进入游客模式
   */
  enterGuestMode() {
    console.log('用户选择游客模式');
    
    // 设置游客模式
    api.setGuestMode(true);
    
    // 显示提示
    wx.showToast({
      title: '已进入游客模式',
      icon: 'success',
      duration: 1500
    });
    
    // 延迟跳转到首页
    setTimeout(() => {
      // 跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  },
  
  /**
   * 处理微信登录
   */
  handleLogin() {
    console.log('=== 点击登录按钮 ===');
    console.log('隐私政策同意状态:', this.data.agreedToPrivacy);
    console.log('用户协议同意状态:', this.data.agreedToTerms);
    
    // 检查是否同意隐私政策和用户协议
    if (!this.data.agreedToPrivacy || !this.data.agreedToTerms) {
      console.log('未同意协议，显示提示');
      wx.showModal({
        title: '提示',
        content: '请先阅读并同意《隐私政策》和《用户协议》',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    console.log('协议已同意，开始微信登录授权');
    
    // 检查getUserProfile是否可用
    if (wx.canIUse('getUserProfile')) {
      console.log('使用getUserProfile获取用户信息');
      // 先获取用户信息授权
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('getUserProfile成功:', res.userInfo);
          
          // 显示加载动画
          loading.showLoginLoading();
          
          // 执行微信登录
          this.wxLogin(res.userInfo);
        },
        fail: (err) => {
          console.error('getUserProfile失败:', err);
          wx.showToast({
            title: '需要授权才能登录',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } else {
      console.log('getUserProfile不可用，使用备用方案');
      // 如果getUserProfile不可用，使用默认用户信息
      const defaultUserInfo = {
        avatarUrl: constants.DEFAULT_AVATAR,
        nickName: '食刻用户'
      };
      
      // 显示加载动画
      loading.showLoginLoading();
      
      // 执行微信登录
      this.wxLogin(defaultUserInfo);
    }
  },
  
  /**
   * 执行微信登录
   */
  wxLogin(userInfo) {
    api.wxLogin(userInfo)
      .then(token => {
        // 获取登录后的用户信息
        const loginUserInfo = api.getUserInfo();
        
        // 保存到全局数据
        app.globalData.userInfo = loginUserInfo;
        
        // 清除游客模式
        api.clearGuestMode();
        
        loading.hideLoading();
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });
        
        // 完成后返回
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      })
      .catch(err => {
        console.error('登录失败', err);
        loading.hideLoading();
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      });
  },
  
  /**
   * 登录完成后导航
   */
  navigateBack() {
    // 如果有重定向URL，则导航到该URL
    if (this.data.redirectUrl) {
      wx.redirectTo({
        url: this.data.redirectUrl,
        fail: () => {
          // 如果重定向失败，则跳转到首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    } else {
      // 检查页面栈，如果只有一个页面（说明是从app启动直接进入登录页），则跳转到首页
      const pages = getCurrentPages();
      console.log('当前页面栈长度:', pages.length);
      console.log('是否强制登录:', this.data.forceLogin);
      
      if (pages.length <= 1 || !this.data.forceLogin) {
        // 页面栈只有一个页面或者非强制登录，跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      } else {
        // 强制登录且有上级页面，返回上一页
        wx.navigateBack({
          fail: () => {
            // 如果返回失败，则跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        });
      }
    }
  }
}); 