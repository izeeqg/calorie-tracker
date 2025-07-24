// history.js
const api = require('../../utils/api');
const util = require('../../utils/util');
const constants = require('../../utils/constants');
const { eventBus, EVENTS } = require('../../utils/eventBus');

Component({
  data: {
    records: [],
    isEmpty: false,
    showCalendar: false,
    currentDate: util.formatDate(new Date(), 'YYYY年MM月DD日'),
    todayCalories: 780, // 默认值，应从记录中计算
    targetCalories: constants.DEFAULT_TARGET_CALORIES, // 目标卡路里
    allRecords: [],
    calendarConfig: {
      round: true,
      color: '#FF5A5F'
    }
  },
  
  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      this.loadRecords();
      this.calculateTodayCalories();
      this.loadSettings();
      
      // 监听设置更新事件
      this.onSettingsUpdated = (settings) => {
        console.log('History组件收到设置更新事件:', settings);
        this.loadSettings();
      };
      eventBus.on(EVENTS.SETTINGS_UPDATED, this.onSettingsUpdated);
    },
    
    detached() {
      // 移除事件监听
      if (this.onSettingsUpdated) {
        eventBus.off(EVENTS.SETTINGS_UPDATED, this.onSettingsUpdated);
      }
    }
  },
  
  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    show() {
      // 每次页面显示时刷新数据
      this.loadRecords();
      this.calculateTodayCalories();
      this.loadSettings();
    }
  },
  
  methods: {
    /**
     * 加载历史记录
     */
    loadRecords() {
      const records = api.getFoodRecords();
      this.setData({
        records: records,
        allRecords: records,
        isEmpty: records.length === 0
      });
    },

    /**
     * 加载用户设置
     */
    loadSettings() {
      const settings = api.getSettings();
      this.setData({
        targetCalories: settings.targetCalories
      });
    },
    
    /**
     * 计算今日卡路里总摄入
     */
    calculateTodayCalories() {
      const records = this.data.records;
      const today = new Date();
      const todayStr = util.formatDate(today, 'YYYY-MM-DD');
      
      let total = 0;
      records.forEach(record => {
        const recordDate = util.formatDate(new Date(record.date), 'YYYY-MM-DD');
        if (recordDate === todayStr) {
          total += record.totalCalories;
        }
      });
      
      this.setData({
        todayCalories: total || 780 // 如果没有记录，显示默认值
      });
    },
    
    /**
     * 显示日历选择器
     */
    showCalendar() {
      this.setData({
        showCalendar: true
      });
    },
    
    /**
     * 关闭日历选择器
     */
    onCloseCalendar() {
      this.setData({
        showCalendar: false
      });
    },
    
    /**
     * 选择日期
     */
    onSelectDate(e) {
      const date = new Date(e.detail);
      const formattedDate = util.formatDate(date, 'YYYY年MM月DD日');
      const searchDate = util.formatDate(date, 'YYYY-MM-DD');
      
      // 筛选当天的记录
      const filteredRecords = this.data.allRecords.filter(record => {
        const recordDate = util.formatDate(new Date(record.date), 'YYYY-MM-DD');
        return recordDate === searchDate;
      });
      
      this.setData({
        currentDate: formattedDate,
        records: filteredRecords,
        isEmpty: filteredRecords.length === 0,
        showCalendar: false
      });
    },
    
    /**
     * 查看记录详情
     */
    viewRecordDetail(e) {
      const index = e.currentTarget.dataset.index;
      const record = this.data.records[index];
      
      wx.navigateTo({
        url: `/pages/detail/detail?id=${record.id}&type=record`
      });
    },
    
    /**
     * 删除记录
     */
    deleteRecord(e) {
      const index = e.currentTarget.dataset.index;
      
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: (res) => {
          if (res.confirm) {
            // 使用模拟数据进行删除操作
            const currentRecords = [...this.data.records];
            currentRecords.splice(index, 1);
            
            this.setData({
              records: currentRecords,
              isEmpty: currentRecords.length === 0
            });
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 重新计算今日卡路里
            this.calculateTodayCalories();
          }
        }
      });
    },
    
    /**
     * 跳转到拍照记录页面
     */
    goToRecord() {
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
    
    /**
     * 格式化日期
     */
    formatDate(dateStr) {
      return util.formatDate(new Date(dateStr), 'MM-DD HH:mm');
    },
    
    /**
     * 获取餐食类型文本
     */
    getMealTypeText(type) {
      const types = {
        1: '早餐',
        2: '午餐',
        3: '晚餐',
        4: '宵夜',
        5: '零食'
      };
      return types[type] || '其他';
    },
    
    /**
     * 获取前几个食物名称
     */
    getTopFoods(foods, count = 3) {
      if (!foods || !foods.length) return [];
      return foods.slice(0, count);
    }
  }
}); 