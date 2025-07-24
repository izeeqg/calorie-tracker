const app = getApp();
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { eventBus, EVENTS } = require('../../utils/eventBus');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    settings: {
      targetCalories: 2000,
      reminderEnabled: false,
      breakfastReminderTime: '08:00',
      lunchReminderTime: '12:00',
      dinnerReminderTime: '18:00'
    },
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
    this.loadSettings();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadSettings();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = api.getUserInfo();
    this.setData({
      userInfo: userInfo
    });
  },

  /**
   * 加载设置
   */
  loadSettings() {
    const userInfo = api.getUserInfo();
    
    if (userInfo && userInfo.id) {
      // 从服务器获取设置
      this.setData({ loading: true });
      
      api.getUserSettingsFromServer()
        .then(serverSettings => {
          console.log('获取服务器设置成功:', serverSettings);
          this.setData({
            settings: {
              ...this.data.settings,
              ...serverSettings
            },
            loading: false
          });
          // 更新本地缓存
          api.saveSettings(serverSettings);
        })
        .catch(err => {
          console.error('获取服务器设置失败:', err);
          // 使用本地缓存
          const localSettings = api.getSettings();
          this.setData({
            settings: {
              ...this.data.settings,
              ...localSettings
            },
            loading: false
          });
        });
    } else {
      // 使用本地缓存
      const localSettings = api.getSettings();
      this.setData({
        settings: {
          ...this.data.settings,
          ...localSettings
        }
      });
    }
  },

  /**
   * 设置卡路里目标
   */
  setCalorieTarget() {
    wx.showModal({
      title: '设置每日卡路里目标',
      editable: true,
      placeholderText: '请输入目标卡路里数值（500-10000）',
      content: String(this.data.settings.targetCalories),
      success: (res) => {
        if (res.confirm) {
          const targetCalories = parseInt(res.content);
          if (!isNaN(targetCalories) && targetCalories >= 500 && targetCalories <= 10000) {
            this.updateSetting('targetCalories', targetCalories);
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
   * 切换提醒开关
   */
  toggleReminder(e) {
    const enabled = e.detail.value;
    this.updateSetting('reminderEnabled', enabled);
  },

  /**
   * 设置早餐提醒时间
   */
  setBreakfastTime(e) {
    const time = e.detail.value;
    this.updateSetting('breakfastReminderTime', time);
  },

  /**
   * 设置午餐提醒时间
   */
  setLunchTime(e) {
    const time = e.detail.value;
    this.updateSetting('lunchReminderTime', time);
  },

  /**
   * 设置晚餐提醒时间
   */
  setDinnerTime(e) {
    const time = e.detail.value;
    this.updateSetting('dinnerReminderTime', time);
  },

  /**
   * 更新设置
   */
  updateSetting(key, value) {
    // 显示粉色方块加载动画
    this.setData({ loading: true });

    const newSettings = {
      ...this.data.settings,
      [key]: value
    };

    this.setData({
      settings: newSettings
    });

    // 保存到本地缓存
    api.saveSettings(newSettings);

    // 保存到服务器
    const userInfo = api.getUserInfo();
    if (userInfo && userInfo.id) {
      api.saveUserSettingsToServer(newSettings)
        .then(() => {
          this.setData({ loading: false });
          console.log('设置已保存到服务器');
          
          // 通知其他页面更新数据
          console.log('发送设置更新事件:', newSettings);
          eventBus.emit(EVENTS.SETTINGS_UPDATED, newSettings);
          
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
          this.loadSettings();
        });
    } else {
      this.setData({ loading: false });
      wx.showToast({
        title: '设置成功',
        icon: 'success'
      });
    }
  },

  /**
   * 重置设置
   */
  resetSettings() {
    wx.showModal({
      title: '重置设置',
      content: '确定要重置所有设置为默认值吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultSettings = {
            targetCalories: constants.DEFAULT_TARGET_CALORIES,
            reminderEnabled: false,
            breakfastReminderTime: '08:00',
            lunchReminderTime: '12:00',
            dinnerReminderTime: '18:00'
          };

          this.setData({
            settings: defaultSettings
          });

          // 保存到本地和服务器
          api.saveSettings(defaultSettings);
          
          const userInfo = api.getUserInfo();
          if (userInfo && userInfo.id) {
            api.saveUserSettingsToServer(defaultSettings)
              .then(() => {
                wx.showToast({
                  title: '重置成功',
                  icon: 'success'
                });
              })
              .catch(err => {
                console.error('重置设置失败:', err);
                wx.showToast({
                  title: '重置失败',
                  icon: 'none'
                });
              });
          } else {
            wx.showToast({
              title: '重置成功',
              icon: 'success'
            });
          }
        }
      }
    });
  }
}); 