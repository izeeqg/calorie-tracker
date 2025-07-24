// index.js
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const util = require('../../utils/util');
const { eventBus, EVENTS } = require('../../utils/eventBus');

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: constants.DEFAULT_AVATAR,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    foodImage: '',
    recognitionResult: null,
    isRecognizing: false,
    hasResult: false,
    foodItems: [],
    totalCalories: 0,
    todayRecords: [],
    todayTotalCalories: 0,
    targetCalories: constants.DEFAULT_TARGET_CALORIES,
    caloriesProgress: 0,
    isSaving: false,
    isLoading: true,
    imagePath: '',
    recognizedFoods: [],
    showRecognitionResult: false,
    isCreatingUser: false
  },

  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  lifetimes: {
    attached() {
      // 检查登录状态，如果没有登录则启用游客模式
      const token = api.getToken();
      if (!token) {
        console.log('用户未登录，启用游客模式');
        api.setGuestMode(true);
        // 设置游客用户信息
        this.setData({
          userInfo: {
            avatarUrl: constants.DEFAULT_AVATAR,
            nickName: '游客用户'
          },
          hasUserInfo: false
        });
      } else {
        // 已登录，清除游客模式
        api.clearGuestMode();
      // 加载用户信息
      const userInfo = api.getUserInfo();
      if (userInfo) {
        this.setData({
          userInfo,
          hasUserInfo: true
        });
        }
      }
      
      // 加载今日记录和设置
      this.loadTodayRecords();
      this.loadSettings();
      
      // 监听设置更新事件
      this.onSettingsUpdated = (settings) => {
        console.log('首页收到设置更新事件:', settings);
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
      console.log('=== 页面显示调试信息 ===');
      console.log('当前用户信息:', this.data.userInfo);
      console.log('是否有用户信息:', this.data.hasUserInfo);
      console.log('是否游客模式:', api.isGuestMode());
      
      // 重新检查登录状态
      this.checkLoginStatus();
      
      // 每次页面显示时刷新数据
      this.loadTodayRecords();
    }
  },

  methods: {
    /**
     * 重新检查登录状态
     */
    checkLoginStatus() {
      const token = api.getToken();
      let isGuest = api.isGuestMode();
      
      console.log('=== 首页检查登录状态 ===');
      console.log('是否有token:', !!token);
      console.log('是否游客模式:', isGuest);
      
      // 状态冲突检查：如果既有token又是游客模式，清理游客模式标记
      if (token && isGuest) {
        console.warn('检测到状态冲突：既有token又是游客模式，清理游客模式标记');
        api.clearGuestMode();
        isGuest = false; // 更新本地变量
      }
      
      if (!token || isGuest) {
        console.log('用户未登录或处于游客模式');
        // 设置游客模式（如果还没设置）
        if (!isGuest) {
          api.setGuestMode(true);
        }
        // 设置游客用户信息
        this.setData({
          userInfo: {
            avatarUrl: constants.DEFAULT_AVATAR,
            nickName: '游客用户'
          },
          hasUserInfo: false
        });
      } else {
        console.log('用户已登录，清除游客模式');
        // 已登录，确保清除游客模式
        api.clearGuestMode();
        // 加载用户信息
        const userInfo = api.getUserInfo();
        if (userInfo) {
          this.setData({
            userInfo,
            hasUserInfo: true
          });
        }
      }
    },
    
    /**
     * 加载今日饮食记录
     */
    loadTodayRecords() {
      // 检查是否有token
      const token = api.getToken();
      if (!token) {
        console.log('用户未登录，使用本地数据');
        // 游客模式下使用本地存储的数据
        this.loadLocalRecords();
        return;
      }
      
      const today = new Date();
      const todayStr = util.formatDate(today);
      
      console.log('=== 获取今日记录调试信息 ===');
      console.log('今日日期:', todayStr);
      console.log('当前时间:', today);
      
      // 设置一个超时处理，确保loading状态不会永远存在
      const loadingTimeout = setTimeout(() => {
        // 不再需要hideLoading，因为我们使用粉色方块加载动画
        console.log('加载超时，但由于使用自定义加载动画，无需处理');
      }, 10000); // 10秒后超时
      
      api.getUserMealsByDate(todayStr)
        .then(records => {
          clearTimeout(loadingTimeout);
          console.log('=== API返回数据调试 ===');
          console.log('获取今日记录成功:', records);
          console.log('记录数量:', records ? records.length : 0);
          
          if (records && records.length > 0) {
            records.forEach((record, index) => {
              console.log(`记录${index + 1}:`, {
                id: record.id,
                mealType: record.mealType,
                totalCalories: record.totalCalories,
                mealTime: record.mealTime
              });
            });
          }
          
          const calculatedCalories = this.calculateTotalCalories(records);
          console.log('计算的总卡路里:', calculatedCalories);
          
          this.setData({
            todayRecords: records || [],
            todayTotalCalories: calculatedCalories
          });
          
          console.log('页面数据更新后 todayTotalCalories:', this.data.todayTotalCalories);
        })
        .catch(error => {
          clearTimeout(loadingTimeout);
          console.log('=== API调用失败调试 ===');
          console.log('获取今日记录失败:', error);
          // 只有在非"操作成功"的错误时才显示错误提示
          if (!error.message || !error.message.includes('操作成功')) {
            wx.showToast({
              title: '获取记录失败',
              icon: 'none'
            });
          } else {
            // 如果是"操作成功"但没有数据，则设置为空数组
            this.setData({
              todayRecords: [],
              todayTotalCalories: 0
            });
          }
        });
    },
    

    
    /**
     * 加载用户设置
     */
    loadSettings() {
      const userInfo = api.getUserInfo();
      
      if (userInfo && userInfo.id) {
        // 从服务器获取最新设置
        api.getUserSettingsFromServer()
          .then(serverSettings => {
            console.log('首页获取服务器设置成功:', serverSettings);
            // 更新本地缓存
            api.saveSettings(serverSettings);
            // 更新页面数据
            this.setData({
              targetCalories: serverSettings.targetCalories || constants.DEFAULT_TARGET_CALORIES
            });
          })
          .catch(err => {
            console.error('首页获取服务器设置失败:', err);
            // 使用本地缓存的设置
            const localSettings = api.getSettings();
            this.setData({
              targetCalories: localSettings.targetCalories
            });
          });
      } else {
        // 用户未登录，使用本地设置
        const localSettings = api.getSettings();
        this.setData({
          targetCalories: localSettings.targetCalories
        });
      }
    },
    
    /**
     * 获取餐食类型文本
     * @param {number} mealType - 餐食类型值
     * @return {string} 餐食类型名称
     */
    getMealTypeText(mealType) {
      return constants.MEAL_TYPE_TEXT[mealType] || '未知';
    },
    
    /**
     * 获取餐食类型对应的图标
     * @param {number} mealType - 餐食类型值
     * @return {string} 图标名称
     */
    getMealTypeIcon(mealType) {
      const icons = {
        1: 'sunrise', // 早餐
        2: 'sunny-o', // 午餐
        3: 'star-o',  // 晚餐
        4: 'moon-o',  // 宵夜
        5: 'like-o'   // 零食
      };
      return icons[mealType] || 'shop-o';
    },
    
    /**
     * 获取记录中的主要食物名称
     * @param {Array} foods - 食物列表
     * @return {string} 食物名称
     */
    getMainFood(foods) {
      if (!foods || foods.length === 0) {
        return '无食物';
      }
      
      if (foods.length === 1) {
        return foods[0].name;
      }
      
      return `${foods[0].name}等${foods.length}种食物`;
    },

    /**
     * 查看记录详情
     * @param {Object} e - 事件对象
     */
    viewRecordDetail(e) {
      const index = e.currentTarget.dataset.index;
      const record = this.data.todayRecords[index];
      
      // 如果记录有ID，只传ID参数，让详情页从API获取完整数据
      if (record.id) {
        wx.navigateTo({
          url: `/pages/detail/index?id=${record.id}&type=record`
        });
      } else {
        // 直接使用列表中的记录
        wx.navigateTo({
          url: `/pages/detail/index?record=${JSON.stringify(record)}&type=record`
        });
      }
    },

    /**
     * 跳转到AI菜品识别页面
     */
    goToFoodAI() {
      wx.navigateTo({
        url: '/pages/foodAI/index'
      });
    },

    /**
     * 加载本地记录（游客模式）
     */
    loadLocalRecords() {
      const today = new Date();
      const todayStr = util.formatDate(today);
      
      console.log('=== 加载本地记录 ===');
      console.log('今日日期:', todayStr);
      
      // 从本地存储获取记录
      const localRecords = api.getFoodRecordsByDate(todayStr);
      console.log('本地记录:', localRecords);
      
      // 计算今日总卡路里
      const todayTotalCalories = localRecords.reduce((total, record) => {
        return total + (record.totalCalories || 0);
      }, 0);
      
      // 计算进度
      const progress = Math.min(todayTotalCalories / this.data.targetCalories, 1);
      
      this.setData({
        todayRecords: localRecords,
        todayTotalCalories: todayTotalCalories,
        caloriesProgress: progress,
        isLoading: false
      });
      
      console.log('今日总卡路里:', todayTotalCalories);
      console.log('进度:', progress);
    },

    /**
     * 跳转到登录页面
     */
    goToLogin() {
      wx.navigateTo({
        url: '/pages/login/index?forceLogin=true'
      });
    },

    /**
     * 跳转到日志页面
     */
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs'
      });
    },

    /**
     * 选择头像处理函数
     * @param {Object} e - 事件对象
     */
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      const { nickName } = this.data.userInfo;
      
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== constants.DEFAULT_AVATAR,
      });

      if (this.data.hasUserInfo) {
        api.saveUserInfo(this.data.userInfo);
      }
    },

    /**
     * 输入昵称处理函数
     * @param {Object} e - 事件对象
     */
    onInputChange(e) {
      const nickName = e.detail.value;
      const { avatarUrl } = this.data.userInfo;
      
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== constants.DEFAULT_AVATAR,
      });

      if (this.data.hasUserInfo) {
        api.saveUserInfo(this.data.userInfo);
      }
    },

    /**
     * 获取用户信息
     */
    getUserProfile() {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          
          // 保存用户信息
          api.saveUserInfo(res.userInfo);
        }
      });
    },

    /**
     * 拍照或选择图片
     */
    takePhoto() {
      wx.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 拍照
            this.chooseImage('camera');
          } else if (res.tapIndex === 1) {
            // 从相册选择
            this.chooseImage('album');
          }
        }
      });
    },

    /**
     * 选择图片
     * @param {string} sourceType - 图片来源类型：camera或album
     */
    chooseImage(sourceType) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: [sourceType],
        camera: 'back',
        success: (res) => {
          const tempFilePath = res.tempFiles[0].tempFilePath;
          this.setData({
            foodImage: tempFilePath,
            hasResult: false,
            recognitionResult: null,
            foodItems: [],
            totalCalories: 0,
            imagePath: tempFilePath
          });
          
          // 图片选择成功后自动开始识别
          this.recognizeFood();
        }
      });
    },

    /**
     * 识别食物并处理结果
     */
    recognizeFood() {
      if (!this.data.imagePath) {
        wx.showToast({
          title: '请先拍照或选择照片',
          icon: 'none'
        });
        return;
      }

      this.setData({ isLoading: true });

      api.recognizeFood(this.data.imagePath)
        .then(result => {
          if (result.success && result.foods && result.foods.length > 0) {
            // 处理识别成功的结果
            const foods = result.foods.map(food => ({
              name: food.name,
              calories: food.calories || 300, // 默认热量值
              probability: (food.probability * 100).toFixed(1) + '%',
              image: this.data.imagePath,
              date: new Date().getTime()
            }));

            this.setData({
              recognizedFoods: foods,
              showRecognitionResult: true
            });
          } else {
            wx.showToast({
              title: '未能识别出食物',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          console.error('识别失败', error);
          wx.showToast({
            title: error.message || '识别失败，请重试',
            icon: 'none'
          });
        })
        .finally(() => {
          this.setData({ isLoading: false });
        });
    },

    /**
     * 隐藏识别结果弹窗
     */
    hideRecognitionResult() {
      this.setData({
        showRecognitionResult: false,
        recognizedFoods: []
      });
    },

    /**
     * 保存食物记录
     */
    saveRecord() {
      const foods = this.data.recognizedFoods;
      if (!foods || foods.length === 0) {
        wx.showToast({
          title: '没有可保存的食物记录',
          icon: 'none'
        });
        return;
      }

      // 检查用户信息
      const userInfo = this.data.userInfo || api.getUserInfo();
      if (!userInfo || !userInfo.id) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      this.setData({
        isSaving: true
      });

      // 构建饮食记录对象
      const record = {
        userId: userInfo.id,
        mealType: 2, // 默认午餐
        foods: foods,
        totalCalories: foods.reduce((total, food) => total + food.calories, 0),
        dateTime: new Date(),
        imageUrl: this.data.imagePath || '',
        remark: ''
      };

      // 发送请求到后端
      wx.request({
        url: constants.API_BASE_URL + '/meal/create',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': api.getToken()
        },
        data: record,
        success: (res) => {
          if (res.data.code === 200 || res.data.code === 0) {
            // 保存成功，刷新记录
            this.loadTodayRecords();
            
            // 隐藏结果弹窗
        this.setData({
          showRecognitionResult: false,
              recognizedFoods: []
        });

        // 提示保存成功
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
          } else {
            wx.showToast({
              title: res.data.message || '保存失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('保存记录失败', err);
          wx.showToast({
            title: '网络错误，保存失败',
            icon: 'none'
          });
        },
        complete: () => {
          this.setData({
            isSaving: false
          });
        }
      });
    },

    /**
     * 查看食物详情
     * @param {Object} e - 事件对象
     */
    viewFoodDetail(e) {
      const index = e.currentTarget.dataset.index;
      const food = this.data.foodItems[index];
      
      wx.navigateTo({
        url: `/pages/detail/detail?food=${JSON.stringify(food)}&type=food`
      });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
      // 模拟加载过程，3秒后隐藏加载动画
      setTimeout(() => {
        this.setData({
          isLoading: false
        });
      }, 3000);
    },

    /**
     * 开始使用按钮点击事件
     */
    onStart: function() {
      wx.navigateTo({
        url: '/pages/camera/camera'
      });
    },

    /**
     * 格式化餐食时间
     * @param {string|Date} time - 时间
     * @return {string} 格式化后的时间字符串
     */
    formatMealTime(time) {
      return util.formatFriendlyTime(time);
    },

    /**
     * 计算总卡路里
     * @param {Array} records - 饮食记录数组
     * @return {number} 总卡路里
     */
    calculateTotalCalories(records) {
      if (!records || records.length === 0) {
        return 0;
      }
      
      return records.reduce((total, record) => {
        return total + (record.totalCalories || 0);
      }, 0);
    },
    
    /**
     * 获取今日卡路里按餐次分类明细
     * @returns {string[]} 格式化的卡路里明细数组
     */
    getTodayCaloriesBreakdown() {
      if (!this.data.todayRecords || this.data.todayRecords.length === 0) {
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
      
      this.data.todayRecords.forEach(record => {
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
     * 用户点击右上角分享
     */
    onShareAppMessage() {
      const { todayTotalCalories, targetCalories, todayRecords } = this.data;
      
      let title = '';
      let path = '/pages/index/index';
      
      if (todayRecords.length > 0) {
        const progress = Math.round((todayTotalCalories / targetCalories) * 100);
        title = `今日已摄入${todayTotalCalories}卡路里，完成目标${progress}% - 食刻卡路里`;
      } else {
        title = '食刻卡路里 - AI智能识别，轻松记录卡路里';
      }
      
      console.log('首页分享信息:', { title, path });
      
      return {
        title: title,
        path: path
      };
    },

    /**
     * 分享到朋友圈
     */
    onShareTimeline() {
      const { todayTotalCalories, targetCalories, todayRecords } = this.data;
      
      let title = '';
      let query = '';
      
      if (todayRecords.length > 0) {
        const progress = Math.round((todayTotalCalories / targetCalories) * 100);
        title = `今日饮食记录：${todayTotalCalories}卡路里，完成目标${progress}% #食刻卡路里 #健康生活`;
      } else {
        title = '食刻卡路里 - AI智能识别，轻松记录卡路里 #健康生活 #卡路里管理';
      }
      
      console.log('首页朋友圈分享信息:', { title, query });
      
      return {
        title: title,
        query: query
      };
    },

    /**
     * 主动分享给朋友
     */
    shareToFriend() {
      const shareInfo = this.onShareAppMessage();
      console.log('主动分享给朋友:', shareInfo);
      
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
      const shareInfo = this.onShareTimeline();
      console.log('主动分享到朋友圈:', shareInfo);
      
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
    }
  },
})
