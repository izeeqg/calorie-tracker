// pages/history/index.js
const api = require('../../utils/api');
const util = require('../../utils/util');
const constants = require('../../utils/constants');
const { eventBus, EVENTS } = require('../../utils/eventBus');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: [],
    isEmpty: false,
    showCalendar: false,
    currentDate: util.formatDate(new Date(), 'YYYY年MM月DD日'),
    todayCalories: 780, // 默认值，应从记录中计算
    targetCalories: constants.DEFAULT_TARGET_CALORIES, // 目标卡路里
    allRecords: [],
    loading: false, // 自定义加载状态
    calendarConfig: {
      round: true,
      color: '#FF5A5F'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadRecords();
    this.calculateTodayCalories();
    this.loadSettings();
    
    // 监听设置更新事件
    this.onSettingsUpdated = (settings) => {
      console.log('History页面收到设置更新事件:', settings);
      this.loadSettings();
    };
    eventBus.on(EVENTS.SETTINGS_UPDATED, this.onSettingsUpdated);
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

    // 刷新数据
    this.loadRecords();
    this.calculateTodayCalories();
    this.loadSettings();
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
    const { todayCalories, targetCalories, allRecords } = this.data;
    
    let title = '';
    let path = '/pages/history/index';
    
    if (allRecords.length > 0) {
      const recordDays = [...new Set(allRecords.map(record => 
        util.formatDate(record.mealTime || record.dateTime)
      ))].length;
      
      title = `我已坚持记录${recordDays}天，今日摄入${todayCalories}卡路里 - 食刻卡路里`;
    } else {
      title = '食刻卡路里 - 记录每一餐，管理每一卡';
    }
    
    console.log('历史记录分享信息:', { title, path });
    
    return {
      title: title,
      path: path
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { todayCalories, targetCalories, allRecords } = this.data;
    
    let title = '';
    let query = '';
    
    if (allRecords.length > 0) {
      const recordDays = [...new Set(allRecords.map(record => 
        util.formatDate(record.mealTime || record.dateTime)
      ))].length;
      
      const progress = Math.round((todayCalories / targetCalories) * 100);
      title = `坚持饮食记录${recordDays}天！今日${todayCalories}卡路里，完成${progress}% #食刻卡路里 #健康打卡`;
    } else {
      title = '开始我的健康饮食记录之旅 #食刻卡路里 #健康生活';
    }
    
    console.log('历史记录朋友圈分享信息:', { title, query });
    
    return {
      title: title,
      query: query
    };
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
   * 加载历史记录
   */
  loadRecords() {
    // 检查是否有token
    const token = api.getToken();
    if (!token) {
      console.log('用户未登录，加载本地记录');
      this.loadLocalRecords();
      return;
    }
    
    this.loadRecordsFromServer();
  },

  /**
   * 加载本地记录（游客模式）
   */
  loadLocalRecords() {
    console.log('=== 加载本地历史记录 ===');
    
    // 从本地存储获取所有记录
    const allRecords = api.getFoodRecords();
    
    // 按日期分组
    const recordsByDate = {};
    allRecords.forEach(record => {
      if (record.date) {
        const dateStr = util.formatDate(new Date(record.date));
        if (!recordsByDate[dateStr]) {
          recordsByDate[dateStr] = [];
        }
        recordsByDate[dateStr].push(record);
      }
    });
    
    // 转换为数组格式
    const historyData = Object.keys(recordsByDate).map(date => ({
      date: date,
      records: recordsByDate[date],
      totalCalories: recordsByDate[date].reduce((sum, record) => sum + (record.totalCalories || 0), 0)
    })).sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期倒序
    
    this.setData({
      historyData: historyData,
      isLoading: false
    });
    
    console.log('本地历史记录:', historyData);
  },
  
  /**
   * 从服务器加载记录
   */
  loadRecordsFromServer() {
    // 获取当前日期
    const currentDateObj = new Date();
    // 格式化为YYYY-MM-DD格式
    const dateStr = util.formatDate(currentDateObj, 'YYYY-MM-DD');
    
    // 显示自定义加载动画
    this.setData({
      loading: true
    });
    
    api.getUserMealsByDate(dateStr)
      .then(data => {
        // 隐藏自定义加载动画
        this.setData({
          loading: false
        });
        console.log('获取到用户饮食记录', data);
        
        const records = data || [];
        // 确保每条记录都有日期时间、餐次类型和食物名称
        records.forEach((record, index) => {
          if (!record.dateTime && record.createTime) {
            record.dateTime = record.createTime;
          }
          
          // 确保foods字段存在
          if (!record.foods || !record.foods.length) {
            // 添加默认食物数据以便显示
            record.foods = [
              { foodName: '测试食物' + (index + 1), calories: 100 }
            ];
          }
          
          // 确保每条记录都有餐次类型
          if (!record.mealType) {
            // 随机分配餐次类型 (1-4)
            record.mealType = Math.floor(Math.random() * 4) + 1;
          }
          
          // 添加备注信息（如果没有）
          if (!record.remark) {
            const mealTypeText = this.getMealTypeText(record.mealType);
            record.remark = mealTypeText + '食物';
          }
          
          // 处理图片URL
          if (record.imageUrl) {
            record.imageUrl = constants.fixImageUrl(record.imageUrl);
          }
          
          // 处理食物图片URL
          if (record.foods && record.foods.length > 0) {
            record.foods.forEach(food => {
              if (food.imageUrl) {
                food.imageUrl = constants.fixImageUrl(food.imageUrl);
              }
            });
          }
        });
        
        // 获取所有记录的详细信息
        // this.fetchAllRecordsDetail(records);
        
        console.log('处理后的记录数据:', records);
        
        this.setData({
          records: records,
          allRecords: records,
          isEmpty: records.length === 0
        });
        
        // 重新计算今日卡路里
        this.calculateTodayCalories();
      })
      .catch(err => {
        // 隐藏自定义加载动画
        this.setData({
          loading: false
        });
        console.error('获取饮食记录失败', err);
        
        // 如果是用户不存在错误，尝试创建默认用户
        if (err && err.message && err.message.includes('用户不存在')) {
          console.log('用户不存在，尝试创建默认用户');
          api.createDefaultUser()
            .then(user => {
              console.log('创建默认用户成功', user);
              api.saveUserInfo(user);
              if (user.token) {
                api.saveToken(user.token);
                // 重新加载记录
                this.loadRecordsFromServer(user.id);
              }
            })
            .catch(error => {
              console.error('创建默认用户失败', error);
              this.setEmptyState();
            });
          return;
        }
        
        this.setEmptyState();
      });
  },
  
  /**
   * 获取所有记录的详细信息
   */
  fetchAllRecordsDetail(records) {
    if (!records || records.length === 0) return;
    
    const token = wx.getStorageSync(constants.STORAGE_KEY.TOKEN) || '';
    
    // 使用Promise.all并行获取所有记录的详情
    const promises = records.map(record => {
      if (!record.id) return Promise.resolve(record);
      
      return new Promise((resolve) => {
        wx.request({
          url: constants.API_BASE_URL + `/meal/${record.id}`,
          method: 'GET',
          header: {
            'Authorization': token
          },
          success: (res) => {
            if (res.data.code === 200 || res.data.code === 0) {
              const detailRecord = res.data.data;
              console.log(`获取记录${record.id}详情成功:`, detailRecord);
              resolve(detailRecord);
            } else {
              console.error(`获取记录${record.id}详情失败:`, res.data.message);
              resolve(record);
            }
          },
          fail: (err) => {
            console.error(`获取记录${record.id}详情请求失败:`, err);
            resolve(record);
          }
        });
      });
    });
    
    Promise.all(promises)
      .then(detailedRecords => {
        console.log('所有记录详情获取完成:', detailedRecords);
        
        // 更新records数据
        this.setData({
          records: detailedRecords,
          allRecords: detailedRecords
        });
        
        // 重新计算今日卡路里
        this.calculateTodayCalories();
      })
      .catch(err => {
        console.error('获取记录详情过程中发生错误:', err);
      });
  },
  
  /**
   * 设置空状态
   */
  setEmptyState() {
    this.setData({
      records: [],
      allRecords: [],
      isEmpty: true
    });
  },
  
  /**
   * 计算今日卡路里总摄入
   */
  calculateTodayCalories() {
    const records = this.data.records;
    
    // 直接计算当前显示记录的总卡路里
    let total = 0;
    records.forEach(record => {
      total += record.totalCalories || 0;
    });
    
    this.setData({
      todayCalories: total || 0
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
    
    this.setData({
      currentDate: formattedDate,
      showCalendar: false
    });
    
    // 从服务器获取所选日期的记录
    // 显示自定义加载动画
    this.setData({
      loading: true
    });
    
    api.getUserMealsByDate(searchDate)
      .then(data => {
        // 隐藏自定义加载动画
        this.setData({
          loading: false
        });
        console.log('获取到特定日期的记录', data);
        
        const records = data || [];
        // 确保每条记录都有日期时间、餐次类型和食物列表
        records.forEach((record, index) => {
          if (!record.dateTime && record.createTime) {
            record.dateTime = record.createTime;
          }
          
          // 确保foods字段存在
          if (!record.foods || !record.foods.length) {
            // 添加默认食物数据以便显示
            record.foods = [
              { foodName: '测试食物' + (index + 1), calories: 100 }
            ];
          }
          
          // 确保每条记录都有餐次类型
          if (!record.mealType) {
            // 随机分配餐次类型 (1-4)
            record.mealType = Math.floor(Math.random() * 4) + 1;
          }
          
          // 添加备注信息（如果没有）
          if (!record.remark) {
            const mealTypeText = this.getMealTypeText(record.mealType);
            record.remark = mealTypeText + '食物';
          }
          
          // 处理图片URL
          if (record.imageUrl) {
            record.imageUrl = constants.fixImageUrl(record.imageUrl);
          }
          
          // 处理食物图片URL
          if (record.foods && record.foods.length > 0) {
            record.foods.forEach(food => {
              if (food.imageUrl) {
                food.imageUrl = constants.fixImageUrl(food.imageUrl);
              }
            });
          }
        });
        
        // 获取所有记录的详细信息
        // this.fetchAllRecordsDetail(records);
        
        console.log('处理后的记录数据:', records);
        
        this.setData({
          records: records,
          allRecords: records,
          isEmpty: records.length === 0
        });
        
        // 重新计算今日卡路里
        this.calculateTodayCalories();
      })
      .catch(err => {
        // 隐藏自定义加载动画
        this.setData({
          loading: false
        });
        console.error('获取特定日期的记录失败', err);
        this.setEmptyState();
      });
  },
  
  /**
   * 查看记录详情
   */
  viewRecordDetail(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    
    if (record.id) {
      console.log('通过ID查看记录详情:', record.id);
      // 如果有ID，只传ID参数，让详情页从API获取完整数据
      wx.navigateTo({
        url: `/pages/detail/index?id=${record.id}&type=record`
      });
    } else {
      console.log('使用完整记录对象查看详情:', record);
      // 兼容旧数据，传递整个记录对象
      wx.navigateTo({
        url: `/pages/detail/index?record=${JSON.stringify(record)}&type=record`
      });
    }
  },
  
  /**
   * 删除记录
   */
  deleteRecord(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    
    if (!record || !record.id) {
      wx.showToast({
        title: '记录ID无效',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 显示自定义加载动画
          this.setData({
            loading: true
          });
          
          // 调用删除记录API
          api.request({
            url: `/meal/${record.id}`,
            method: 'DELETE',
            loading: false
          })
            .then(() => {
              // 隐藏自定义加载动画
              this.setData({
                loading: false
              });
              
              // 本地删除记录
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
            })
            .catch(err => {
              // 隐藏自定义加载动画
              this.setData({
                loading: false
              });
              console.error('删除记录失败', err);
              wx.showToast({
                title: '删除失败：' + (err.message || '未知错误'),
                icon: 'none'
              });
            });
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
    return types[type] || '其他餐';
  },
  
  /**
   * 获取前几个食物名称
   */
  getTopFoods(foods, count = 3) {
    if (!foods || !foods.length) return [];
    return foods.slice(0, count);
  },
  
  /**
   * 获取前几个食物名称的字符串表示
   */
  getTopFoodNames(foods, count = 3) {
    // 如果没有foods数据或长度为0，返回默认文本
    if (!foods || !foods.length) {
      return "未记录食物";
    }
    
    try {
      // 获取前几个食物
      const topFoods = foods.slice(0, count);
      // 提取名称并过滤掉空值
      const foodNames = topFoods
        .map(food => {
          if (!food) return null;
          return food.foodName || food.name || null;
        })
        .filter(name => name);
      
      console.log('处理的食物名称:', foodNames);
      
      // 如果有有效名称，返回拼接的字符串，否则返回默认文本
      return foodNames.length > 0 ? foodNames.join('、') : "测试食物";
    } catch (err) {
      console.error('解析食物名称时出错:', err, foods);
      return "食物名称解析错误";
    }
  },
  
  /**
   * 获取主要食物名称
   */
  getFoodMainName(foods) {
    if (!foods || !foods.length) return "未知食物";
    const mainFood = foods[0];
    return mainFood.foodName || mainFood.name || "食物";
  },
  
  /**
   * 获取今日卡路里明细，按餐次显示摄入量
   * @returns {string[]} 格式化的卡路里明细数组
   */
  getTodayCaloriesBreakdown() {
    if (!this.data.records || this.data.records.length === 0) {
      return [];
    }
    
    // 按餐次分组计算卡路里
    const mealTypeCalories = {
      1: 0, // 早餐
      2: 0, // 午餐
      3: 0, // 晚餐
      4: 0, // 宵夜
      5: 0  // 零食
    };
    
    this.data.records.forEach(record => {
      const mealType = record.mealType || 0;
      const calories = record.totalCalories || 0;
      if (mealType in mealTypeCalories) {
        mealTypeCalories[mealType] += calories;
      }
    });
    
    // 按照餐次顺序构建明细字符串
    const mealOrder = [1, 2, 3, 4, 5]; // 早餐、午餐、晚餐、宵夜、零食的顺序
    const breakdown = [];
    
    mealOrder.forEach(type => {
      const calories = mealTypeCalories[type];
      if (calories > 0) {
        breakdown.push(`${this.getMealTypeText(type)}: ${calories}卡路里`);
      }
    });
    
    return breakdown;
  },

  /**
   * 处理图片加载错误
   */
  handleImageError(e) {
    console.error('图片加载错误:', e);
    
    // 尝试识别是哪个记录的图片
    const index = e.currentTarget.dataset.index;
    const records = this.data.records;
    
    if (records && records[index]) {
      const record = records[index];
      
      // 使用默认图片
      record.imageUrl = constants.DEFAULT_FOOD_IMAGE;
      
      // 更新数据
      this.setData({
        records: records
      });
      
      console.log('记录图片已替换为默认图片:', index);
    }
  }
})