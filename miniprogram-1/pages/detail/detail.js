// detail.js
const util = require('../../utils/util');
const constants = require('../../utils/constants');

Component({
  data: {
    food: null,
    record: null,
    isRecordDetail: false,
    isFoodDetail: false,
    // 预设营养素比例
    nutritionRatio: {
      protein: 0.1, // 蛋白质占卡路里的比例
      fat: 0.03,    // 脂肪占卡路里的比例
      carbs: 0.15   // 碳水化合物占卡路里的比例
    }
  },
  
  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      this.parseParams();
    }
  },
  
  methods: {
    /**
     * 解析页面参数
     */
    parseParams() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      
      if (options.food) {
        // 食物详情
        try {
          const food = JSON.parse(options.food);
          this.setData({
            food: food,
            isFoodDetail: true
          });
        } catch (error) {
          wx.showToast({
            title: '参数解析错误',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      } else if (options.record) {
        // 记录详情
        try {
          const record = JSON.parse(options.record);
          this.setData({
            record: record,
            isRecordDetail: true
          });
        } catch (error) {
          wx.showToast({
            title: '参数解析错误',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      } else {
        // 无效参数
        wx.showToast({
          title: '无效的参数',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    },
    
    /**
     * 返回上一页
     */
    goBack() {
      wx.navigateBack();
    },
    
    /**
     * 获取营养素含量
     * @param {number} calories - 卡路里值
     * @param {string} type - 营养素类型
     * @return {string} 格式化后的含量字符串
     */
    getNutrition(calories, type) {
      if (!calories) return '0g';
      
      const ratio = this.data.nutritionRatio[type] || 0;
      const value = (calories * ratio).toFixed(1);
      return `${value}g`;
    },
    
    /**
     * 格式化日期时间
     * @param {Date} date - 日期对象
     * @return {string} 格式化后的日期字符串
     */
    formatDate(date) {
      return util.formatDateTime(date);
    },
    
    /**
     * 获取餐食类型文本
     * @param {number} mealType - 餐食类型编号
     * @return {string} 餐食类型文本
     */
    getMealTypeText(mealType) {
      return constants.MEAL_TYPE_TEXT[mealType] || '未知';
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
      return this.getShareInfo();
    },

    /**
     * 分享到朋友圈
     */
    onShareTimeline() {
      return this.getTimelineShareInfo();
    },

    /**
     * 主动分享给朋友
     */
    shareToFriend() {
      const shareInfo = this.getShareInfo();
      console.log('主动分享给朋友:', shareInfo);
      
      // 显示分享提示
      wx.showToast({
        title: '请点击右上角分享',
        icon: 'none',
        duration: 2000
      });
    },

    /**
     * 主动分享到朋友圈
     */
    shareToTimeline() {
      const shareInfo = this.getTimelineShareInfo();
      console.log('主动分享到朋友圈:', shareInfo);
      
      // 检查是否支持分享到朋友圈
      if (wx.canIUse('onShareTimeline')) {
        wx.showToast({
          title: '请点击右上角分享到朋友圈',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本不支持分享到朋友圈，请升级微信版本',
          showCancel: false
        });
      }
    },

    /**
     * 获取分享信息
     */
    getShareInfo() {
      if (this.data.isFoodDetail) {
        // 分享食物详情
        const food = this.data.food;
        return {
          title: `${food.name} - ${food.calories}千卡`,
          path: `/pages/detail/detail?type=food&data=${encodeURIComponent(JSON.stringify(food))}`,
          imageUrl: food.image || ''
        };
      } else if (this.data.isRecordDetail) {
        // 分享记录详情
        const record = this.data.record;
        const mealTypeText = this.getMealTypeText(record.mealType);
        return {
          title: `我的${mealTypeText}记录 - ${record.totalCalories}千卡`,
          path: `/pages/detail/detail?type=record&data=${encodeURIComponent(JSON.stringify(record))}`,
          imageUrl: record.image || ''
        };
      } else {
        // 默认分享
        return {
          title: '食刻卡路里 - AI智能识别，轻松记录卡路里',
          path: '/pages/index/index'
        };
      }
    },

    /**
     * 获取朋友圈分享信息
     */
    getTimelineShareInfo() {
      if (this.data.isFoodDetail) {
        // 分享食物详情到朋友圈
        const food = this.data.food;
        return {
          title: `${food.name} - ${food.calories}千卡 #食刻卡路里 #健康饮食`,
          query: `type=food&data=${encodeURIComponent(JSON.stringify(food))}`,
          imageUrl: food.image || ''
        };
      } else if (this.data.isRecordDetail) {
        // 分享记录详情到朋友圈
        const record = this.data.record;
        const mealTypeText = this.getMealTypeText(record.mealType);
        const dateText = this.formatDate(record.date);
        return {
          title: `${dateText} ${mealTypeText}记录 - ${record.totalCalories}千卡 #食刻卡路里 #健康打卡`,
          query: `type=record&data=${encodeURIComponent(JSON.stringify(record))}`,
          imageUrl: record.image || ''
        };
      } else {
        // 默认分享到朋友圈
        return {
          title: '食刻卡路里 - AI智能识别，轻松记录卡路里 #健康生活 #卡路里管理',
          query: ''
        };
      }
    }
  }
}); 