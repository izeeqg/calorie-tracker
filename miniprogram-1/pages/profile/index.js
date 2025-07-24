// pages/profile/index.js
const app = getApp();
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { eventBus, EVENTS } = require('../../utils/eventBus');
const loading = require('../../utils/loading');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    todayCalories: 0,
    targetCalories: 2000,
    recordDays: 0,
    version: 'v1.0.0',
    loading: false,
    avatarTimestamp: Date.now()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('=== 个人中心页面加载 ===');
    
    // 加载用户信息
    this.loadUserInfo();
    
    // 加载健康数据
    this.loadHealthData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }

    // 重新检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 移除事件监听
    if (this.onSettingsUpdated) {
      eventBus.off(EVENTS.SETTINGS_UPDATED, this.onSettingsUpdated);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { recordDays, todayCalories, targetCalories } = this.data;
    
    let title = '';
    let path = '/pages/profile/index';
    
    if (recordDays > 0) {
      title = `我已坚持健康饮食记录${recordDays}天，一起来记录吧！- 食刻卡路里`;
    } else {
      title = '食刻卡路里 - 开启健康饮食记录之旅';
    }
    
    console.log('个人中心分享信息:', { title, path });
    
    return {
      title: title,
      path: path
    };
  },

      /**
     * 分享到朋友圈
     */
    onShareTimeline() {
      const { recordDays, todayCalories, targetCalories } = this.data;
      
      let title = '';
      let query = '';
      
      if (recordDays > 0) {
        const progress = targetCalories > 0 ? Math.round((todayCalories / targetCalories) * 100) : 0;
        title = `健康饮食记录第${recordDays}天！今日完成${progress}% #食刻卡路里 #健康生活 #坚持打卡`;
      } else {
        title = '开始我的健康饮食管理计划 #食刻卡路里 #健康生活';
      }
      
      console.log('个人中心朋友圈分享信息:', { title, query });
      
      return {
        title: title,
        query: query
      };
    },



  /**
   * 重新检查登录状态
   */
  checkLoginStatus() {
    const token = api.getToken();
    let isGuest = api.isGuestMode();
    
    console.log('=== 个人中心页面显示状态检查 ===');
    console.log('是否有token:', !!token);
    console.log('是否游客模式:', isGuest);
    
    // 状态冲突检查：如果既有token又是游客模式，清理游客模式标记
    if (token && isGuest) {
      console.warn('检测到状态冲突：既有token又是游客模式，清理游客模式标记');
      api.clearGuestMode();
      isGuest = false; // 更新本地变量
    }
    
    if (!token || isGuest) {
      console.log('用户未登录或处于游客模式，显示游客模式');
      // 游客模式下显示默认信息
      this.setData({
        userInfo: {
          avatarUrl: constants.DEFAULT_AVATAR,
          nickName: '游客用户'
        },
        hasUserInfo: false
      });
      // 加载本地健康数据
      this.loadLocalHealthData();
      return;
    }

    // 用户已登录，清除游客模式并检查用户信息
    console.log('用户已登录，清除游客模式并加载用户数据');
    api.clearGuestMode();
    this.checkUserLogin();
    
    // 刷新页面数据
    this.loadUserHealthData();
  },

  /**
   * 检查用户是否已登录
   */
  checkUserLogin() {
    const token = api.getToken();
    if (!token) {
      console.log('用户未登录，跳转到登录页面');
      wx.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    
    const userInfo = api.getUserInfo();
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
      
      // 检查是否有头像信息，如果没有则自动获取
      if (!userInfo.avatarUrl || 
          userInfo.avatarUrl === '/images/default-avatar.png' ||
          userInfo.avatarUrl.indexOf('/images/') === 0) {
        console.log('🔄 用户没有微信头像，自动获取...');
        this.autoGetWeChatAvatar();
      } else {
        console.log('✅ 用户已有头像:', userInfo.avatarUrl);
      }
    } else {
      // 如果没有用户信息，也尝试自动获取
      console.log('🔄 没有用户信息，自动获取微信头像...');
      this.autoGetWeChatAvatar();
    }
  },

  /**
   * 自动获取微信头像（智能获取策略）
   */
  autoGetWeChatAvatar() {
    console.log('=== 自动获取微信头像开始 ===');
    
    // 检查是否已经成功获取过头像
    const hasAvatarPermission = wx.getStorageSync('hasAvatarPermission');
    if (hasAvatarPermission) {
      console.log('✅ 已有头像权限，直接尝试获取');
      this.getWeChatUserInfo();
      return;
    }
    
    // 首次获取头像，先进行权限预检查
    this.checkAvatarPermission();
  },

  /**
   * 检查头像权限
   */
  checkAvatarPermission() {
    console.log('🔍 检查头像获取权限...');
    
    wx.getSetting({
      success: (res) => {
        console.log('获取用户设置:', res);
        
        if (res.authSetting['scope.userInfo']) {
          // 已授权，直接获取
          console.log('✅ 用户已授权，直接获取头像');
          this.getWeChatUserInfoWithPermission();
        } else {
          // 未授权，显示友好提示
          console.log('⚠️ 用户未授权，显示获取头像提示');
          this.showAvatarPermissionDialog();
        }
      },
      fail: (err) => {
        console.log('⚠️ 获取设置失败:', err);
        // 失败时也显示提示
        this.showAvatarPermissionDialog();
      }
    });
  },

  /**
   * 显示头像权限获取对话框
   */
  showAvatarPermissionDialog() {
    wx.showModal({
      title: '获取微信头像',
      content: '为了更好的使用体验，建议获取您的微信头像作为个人头像。\n\n这需要您的授权确认。',
      showCancel: true,
      confirmText: '获取头像',
      cancelText: '暂不获取',
      success: (res) => {
        if (res.confirm) {
          // 用户同意，尝试获取头像
          this.getWeChatUserInfoWithPermission();
        } else {
          console.log('用户取消获取头像');
        }
      }
    });
  },

  /**
   * 带权限检查的获取微信用户信息
   */
  getWeChatUserInfoWithPermission() {
    console.log('🔄 开始获取微信用户信息（带权限检查）');
    
    // 先尝试使用 wx.getUserInfo（如果已授权）
    wx.getUserInfo({
      success: (res) => {
        console.log('✅ 通过getUserInfo获取成功:', res);
        this.updateUserAvatar(res.userInfo);
        // 保存权限状态
        wx.setStorageSync('hasAvatarPermission', true);
      },
      fail: (err) => {
        console.log('⚠️ getUserInfo失败，尝试getUserProfile:', err);
        // 如果失败，使用 getUserProfile
        this.getWeChatUserInfo();
      }
    });
  },

  /**
   * 更新用户头像信息
   */
  updateUserAvatar(userInfo) {
    if (userInfo && userInfo.avatarUrl) {
      console.log('✅ 获取到微信头像:', userInfo.avatarUrl);
      
      // 更新用户信息
      const currentUserInfo = this.data.userInfo || {};
      const updatedUserInfo = {
        ...currentUserInfo,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName || currentUserInfo.nickName || '食刻用户'
      };
      
      // 保存到本地存储
      api.saveUserInfo(updatedUserInfo);
      
      // 更新页面显示
      this.setData({
        userInfo: updatedUserInfo,
        hasUserInfo: true,
        avatarTimestamp: Date.now()
      });
      
      // 如果用户已登录，尝试同步到服务器
      const token = api.getToken();
      if (token) {
        this.updateAvatarToServer(userInfo.avatarUrl);
      }
      
      console.log('✅ 头像更新完成');
    }
  },

  /**
   * 头像加载成功
   */
  onAvatarLoad(e) {
    console.log('头像加载成功:', e.detail);
  },

  /**
   * 头像加载失败
   */
  onAvatarError(e) {
    console.log('头像加载失败:', e.detail);
  },

  /**
   * 头像按钮错误处理
   */
  onAvatarButtonError(e) {
    console.log('头像按钮错误:', e);
    // 直接使用备用方案
    this.handleAvatarSelectFallback();
  },

  /**
   * 新版头像选择器 - 选择头像
   */
  onChooseAvatar(e) {
    console.log('=== 头像选择事件开始 ===');
    console.log('事件对象:', e);
    
    try {
      // 检查事件对象
      if (!e || !e.detail) {
        console.log('事件对象不完整，使用备用方案');
        this.handleAvatarSelectFallback();
        return;
      }
      
      const { avatarUrl } = e.detail;
      
      // 检查是否获取到头像URL
      if (!avatarUrl) {
        console.log('未获取到头像URL，使用备用方案');
        this.handleAvatarSelectFallback();
        return;
      }
      
      console.log('获取到新头像URL:', avatarUrl);
      
      // 更新用户信息
      this.updateAvatarSuccess(avatarUrl);
      
    } catch (error) {
      console.log('头像选择出现异常，使用备用方案:', error);
      this.handleAvatarSelectFallback();
    }
  },

  /**
   * 处理头像选择错误
   */
  handleAvatarSelectError(errorMsg) {
    console.log('头像选择器出现问题，使用备用方案');
    this.handleAvatarSelectFallback();
  },

  /**
   * 头像选择备用方案
   */
  handleAvatarSelectFallback() {
    console.log('🔄 使用备用方案获取头像');
    
    // 使用带权限检查的方法，而不是直接调用getUserProfile
    this.getWeChatUserInfoWithPermission();
  },

  /**
   * 头像更新成功处理
   */
  updateAvatarSuccess(avatarUrl) {
    const currentUserInfo = this.data.userInfo || {};
    const updatedUserInfo = {
      ...currentUserInfo,
      avatarUrl: avatarUrl,
      nickName: currentUserInfo.nickName || '食刻用户'
    };
    
    console.log('更新前的用户信息:', currentUserInfo);
    console.log('更新后的用户信息:', updatedUserInfo);
    
    try {
      // 保存到本地存储
      api.saveUserInfo(updatedUserInfo);
      console.log('✅ 用户信息已保存到本地');
      
      // 更新页面显示
      this.setData({
        userInfo: updatedUserInfo,
        hasUserInfo: true,
        avatarTimestamp: Date.now()
      });
      console.log('✅ 页面数据已更新');
      
      // 如果用户已登录，尝试同步到服务器
      const token = api.getToken();
      if (token) {
        console.log('🔄 开始同步头像到服务器...');
        this.updateAvatarToServer(avatarUrl);
      } else {
        console.log('ℹ️ 用户未登录，跳过服务器同步');
      }
      
      wx.showToast({
        title: '头像更新成功',
        icon: 'success'
      });
      
      console.log('=== 头像选择事件完成 ===');
      
    } catch (error) {
      console.error('❌ 头像更新过程中出错:', error);
      wx.showToast({
        title: '头像更新失败',
        icon: 'none'
      });
    }
  },

  /**
   * 同步头像到服务器
   */
  updateAvatarToServer(avatarUrl) {
    api.request({
      url: '/user/profile',
      method: 'PUT',
      data: {
        avatarUrl: avatarUrl
      },
      loading: false
    }).then(() => {
      console.log('头像同步到服务器成功');
    }).catch(err => {
      console.error('头像同步到服务器失败:', err);
    });
  },

  /**
   * 获取微信用户信息
   */
  getWeChatUserInfo() {
    loading.showLoading();
    
    // 添加小延迟，让微信API有时间准备
    setTimeout(() => {
      this.doGetWeChatUserInfo();
    }, 100);
  },

  /**
   * 执行获取微信用户信息
   */
  doGetWeChatUserInfo(retryCount = 0) {
    wx.getUserProfile({
      desc: '用于显示用户头像和昵称',
      success: (res) => {
        const wxUserInfo = res.userInfo;
        console.log('获取微信用户信息成功:', wxUserInfo);
        console.log('微信头像URL:', wxUserInfo.avatarUrl);
        console.log('微信昵称:', wxUserInfo.nickName);
        
        // 检查是否是默认头像
        const isDefaultAvatar = wxUserInfo.avatarUrl && 
          (wxUserInfo.avatarUrl.indexOf('default') > -1 || 
           wxUserInfo.avatarUrl.indexOf('132') > -1 || 
           wxUserInfo.avatarUrl === constants.DEFAULT_AVATAR);
           
        if (isDefaultAvatar) {
          console.log('⚠️ 检测到微信返回的是默认头像URL');
          loading.hideLoading();
          wx.showModal({
            title: '提示',
            content: '检测到您的微信还没有设置头像，请先在微信中设置头像后再试。或者这可能是因为在开发者工具中无法获取真实头像，建议在真机上测试。',
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }
        
        // 更新用户头像
        this.updateUserAvatar(wxUserInfo);
        
        // 保存权限状态
        wx.setStorageSync('hasAvatarPermission', true);
        
        loading.hideLoading();
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('获取微信用户信息失败:', err);
        
        // 如果是用户取消，不重试
        if (err.errMsg && err.errMsg.includes('cancel')) {
          loading.hideLoading();
          wx.showToast({
            title: '取消授权',
            icon: 'none'
          });
          return;
        }
        
        // 如果是其他错误，尝试重试一次
        if (retryCount < 1) {
          console.log('尝试重试获取微信用户信息...');
          setTimeout(() => {
            this.doGetWeChatUserInfo(retryCount + 1);
          }, 500);
          return;
        }
        
        // 重试失败，显示错误信息
        loading.hideLoading();
        wx.showModal({
          title: '获取头像失败',
          content: '可能是因为权限问题或网络问题。\n\n建议：\n1. 检查网络连接\n2. 在真机上测试\n3. 稍后再试',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },

  /**
   * 加载用户健康数据
   */
  loadUserHealthData() {
    // 检查是否有token
    const token = api.getToken();
    if (!token) {
      const localSettings = api.getSettings();
      this.setData({
        todayCalories: 0,
        targetCalories: localSettings.targetCalories,
        recordDays: 0
      });
      return Promise.resolve();
    }

    // 显示加载状态
    this.setData({
      loading: true
    });
    
    loading.showLoading();

    // 并行获取用户设置和健康数据
    const settingsPromise = api.getUserSettingsFromServer()
      .then(serverSettings => {
        // 更新本地缓存
        api.saveSettings(serverSettings);
        return serverSettings;
      })
      .catch(err => {
        // 使用本地缓存的设置
        const localSettings = api.getSettings();
        return localSettings;
      });

    // 获取今日总卡路里
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(today.getDate()).padStart(2, '0');
    
    const mealsPromise = api.getUserMealsByDate(dateStr)
      .then(meals => {
        // 计算今日总卡路里
        let todayCalories = 0;
        if (meals && meals.length > 0) {
          meals.forEach(meal => {
            todayCalories += meal.totalCalories || 0;
          });
        }
        return todayCalories;
      })
      .catch(err => {
        return 0;
      });

    // 获取用户统计数据
    const statsPromise = api.request({
      url: `/meal/stats`,
      method: 'GET',
      loading: false
    }).catch(err => {
      return { recordDays: 0 };
    });

    // 等待所有数据加载完成
    return Promise.all([settingsPromise, mealsPromise, statsPromise])
      .then(([settings, todayCalories, stats]) => {
        this.setData({
          todayCalories: todayCalories,
          targetCalories: settings.targetCalories || 2000,
          recordDays: stats?.recordDays || 0,
          loading: false
        });
        loading.hideLoading();
      })
      .catch(err => {
        // 使用本地缓存的设置作为备用
        const localSettings = api.getSettings();
        this.setData({
          todayCalories: 0,
          targetCalories: localSettings.targetCalories,
          recordDays: 0,
          loading: false
        });
        loading.hideLoading();
      });
  },

  /**
   * 微信登录操作 - 获取微信头像
   */
  wxLoginAction() {
    // 如果已经登录，获取微信头像
    if (this.data.hasUserInfo) {
      this.getWeChatUserInfo();
      return;
    }
    
    // 显示加载状态
    this.setData({
      loading: true
    });
    
    // 获取用户信息授权
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const wxUserInfo = res.userInfo;
        console.log('获取微信用户信息成功:', wxUserInfo);
        
        // 调用微信登录获取code
        api.wxLogin()
          .then(token => {
            console.log('微信登录成功，获取token:', token);
            
            // 获取用户信息
            return api.request({
              url: '/user/info',
              method: 'GET',
              loading: false
            });
          })
          .then(userInfo => {
            console.log('获取用户信息成功:', userInfo);
            
            // 合并用户信息
            const combinedUserInfo = {
              ...userInfo,
              nickName: wxUserInfo.nickName,
              avatarUrl: wxUserInfo.avatarUrl,
              gender: wxUserInfo.gender
            };
            
            // 更新用户信息
            api.saveUserInfo(combinedUserInfo);
            
            // 更新UI
            this.setData({
              userInfo: combinedUserInfo,
              hasUserInfo: true,
              loading: false
            });
            
            // 刷新健康数据
            this.loadUserHealthData();
            
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });
          })
          .catch(err => {
            console.error('微信登录失败:', err);
            
            // 尝试创建默认用户
            api.createDefaultUser()
              .then(userInfo => {
                console.log('创建默认用户成功:', userInfo);
                
                // 合并用户信息
                const combinedUserInfo = {
                  ...userInfo,
                  nickName: wxUserInfo.nickName,
                  avatarUrl: wxUserInfo.avatarUrl,
                  gender: wxUserInfo.gender
                };
                
                // 保存用户信息和token
                api.saveUserInfo(combinedUserInfo);
                if (userInfo.token) {
                  api.saveToken(userInfo.token);
                }
                
                // 更新UI
                this.setData({
                  userInfo: combinedUserInfo,
                  hasUserInfo: true,
                  loading: false
                });
                
                // 刷新健康数据
                this.loadUserHealthData();
                
                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
              })
              .catch(error => {
                console.error('创建默认用户失败:', error);
                this.setData({
                  loading: false
                });
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
              });
          });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        this.setData({
          loading: false
        });
        // 用户拒绝授权，尝试创建临时用户
        api.createDefaultUser()
          .then(userInfo => {
            console.log('创建默认用户成功:', userInfo);
            api.saveUserInfo(userInfo);
            if (userInfo.token) {
              api.saveToken(userInfo.token);
            }
            
            // 更新UI
            this.setData({
              userInfo: userInfo,
              hasUserInfo: true
            });
            
            // 刷新健康数据
            this.loadUserHealthData();
            
            wx.showToast({
              title: '已使用临时账号',
              icon: 'none'
            });
          })
          .catch(error => {
            console.error('创建默认用户失败:', error);
            wx.showToast({
              title: '账号创建失败',
              icon: 'none'
            });
          });
      }
    });
  },

  /**
   * 加载本地健康数据（游客模式）
   */
  loadLocalHealthData() {
    console.log('=== 加载本地健康数据 ===');
    
    // 从本地存储获取数据
    const todayCalories = api.getTodayTotalCalories();
    const totalRecords = api.getTotalRecordsCount();
    
    // 计算记录天数（简单估算）
    const recordDays = Math.max(1, Math.ceil(totalRecords / 3));
    
    this.setData({
      todayCalories: todayCalories,
      recordDays: recordDays
    });
    
    console.log('今日卡路里:', todayCalories);
    console.log('记录天数:', recordDays);
  },

  /**
   * 跳转到登录页面
   */
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/index?forceLogin=true'
    });
  },

  /**
   * 跳转到设置页面
   */
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  /**
   * 手动刷新健康数据
   */
  refreshHealthData() {
    // 显示粉色方块加载动画
    this.setData({ loading: true });
    
    this.loadUserHealthData()
      .then(() => {
        this.setData({ loading: false });
        wx.showToast({
          title: '刷新完成',
          icon: 'success'
        });
      })
      .catch(err => {
        console.error('刷新健康数据失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '刷新失败',
          icon: 'none'
        });
      });
  },

  /**
   * 设置卡路里目标
   */
  setCalorieTarget() {
    wx.showModal({
      title: '设置每日卡路里目标',
      editable: true,
      placeholderText: '请输入目标卡路里数值（500-10000）',
      content: String(this.data.targetCalories),
      success: (res) => {
        if (res.confirm) {
          const targetCalories = parseInt(res.content);
          if (!isNaN(targetCalories) && targetCalories >= 500 && targetCalories <= 10000) {
            // 显示粉色方块加载动画
            this.setData({ loading: true });

            this.setData({
              targetCalories: targetCalories
            });
            
            // 构建设置对象
            const settings = {
              targetCalories: targetCalories
            };
            
            // 保存到本地缓存
            api.saveSettings(settings);
            
            // 保存到服务器
            const userInfo = api.getUserInfo();
            if (userInfo && userInfo.id) {
              api.saveUserSettingsToServer(settings)
                .then(() => {
                  this.setData({ loading: false });
                  console.log('设置已保存到服务器');
                  
                  // 立即刷新健康数据以显示新的目标卡路里
                  this.loadUserHealthData();
                  
                  wx.showToast({
                    title: '设置成功',
                    icon: 'success'
                  });
                })
                .catch(err => {
                  this.setData({ loading: false });
                  console.error('保存设置到服务器失败:', err);
                  wx.showToast({
                    title: '保存失败，请重试',
                    icon: 'none'
                  });
                  // 恢复原来的值
                  this.loadUserHealthData();
                });
            } else {
              this.setData({ loading: false });
              wx.showToast({
                title: '设置成功',
                icon: 'success'
              });
            }
          } else {
            wx.showToast({
              title: '请输入500-10000之间的数值',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  },

  /**
   * 显示提醒设置
   */
  showNotificationSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 跳转到意见反馈页面
   */
  goToFeedback() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 显示关于应用信息
   */
  showAbout() {
    wx.showModal({
      title: '关于应用',
      content: `食刻卡路里 v${this.data.version}\n\n一款专注于饮食记录和卡路里管理的小程序\n\n功能特色：\n• AI智能识别食物\n• 精准卡路里计算\n• 健康数据统计\n• 个性化目标设置`,
      showCancel: true,
      cancelText: '重置应用',
      confirmText: '知道了',
      success: (res) => {
        if (res.cancel) {
          // 用户点击了重置应用
          this.resetApp();
        }
      }
    });
  },

  /**
   * 重置应用（开发测试用）
   */
  resetApp() {
    wx.showModal({
      title: '确认重置',
      content: '这将清除所有数据，包括登录状态、游客模式标记等，确定要重置吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除所有存储数据
          wx.clearStorageSync();
          
          wx.showToast({
            title: '重置成功',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟重新启动应用
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      console.log('从本地存储加载用户信息:', userInfo);
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    } else {
      console.log('本地存储中没有用户信息');
      this.setData({
        hasUserInfo: false
      });
    }
  },

  /**
   * 加载健康数据
   */
  loadHealthData() {
    // 这里可以添加获取健康数据的逻辑
    console.log('加载健康数据');
  },

})