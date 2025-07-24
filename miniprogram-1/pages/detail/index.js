// pages/detail/index.js
const util = require('../../utils/util');
const constants = require('../../utils/constants');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    record: null,
    type: '',
    foods: [],
    mealTypeText: '',
    formattedDate: '',
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 显示粉色方块加载动画
    this.setData({ loading: true });
    
    try {
      // 获取类型参数
      const type = options.type || 'record';
      this.setData({ type });
      
      if (options.id && type === 'record') {
        // 如果有ID参数，则从API获取记录详情
        this.fetchRecordDetail(options.id);
      } else if (options.record) {
        // 解析传入的记录数据
        const record = JSON.parse(options.record);
        
        let foods = [];
        let mealTypeText = '';
        let formattedDate = '';
        
        console.log('解析的记录数据:', record, '类型:', type);
        
        if (type === 'record') {
          // 处理饮食记录数据
          foods = record.foods || [];
          mealTypeText = this.getMealTypeText(record.mealType);
          
          // 确保日期格式正确 
          if (record.mealTime) {
            formattedDate = util.formatDateTime(record.mealTime);
          } else if (record.dateTime) {
            formattedDate = util.formatDateTime(record.dateTime);
          } else {
            formattedDate = util.formatDateTime(new Date());
          }
        } else if (type === 'food') {
          // 处理单个食物数据
          foods = [record];
          
          // 确保日期格式正确
          formattedDate = record.date ? util.formatDate(record.date) : util.formatDate(new Date());
        }
        
        this.setData({
          record,
          type,
          foods,
          mealTypeText,
          formattedDate,
          loading: false
        });
        
        // 加载完成
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: '参数错误',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('解析记录数据失败', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据解析失败',
        icon: 'none'
      });
    }
  },
  
  /**
   * 从API获取记录详情
   */
  fetchRecordDetail(id) {
    wx.request({
      url: constants.API_BASE_URL + `/meal/${id}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync(constants.STORAGE_KEY.TOKEN) || ''
      },
      success: (res) => {
        if (res.data.code === 200 || res.data.code === 0) {
          const record = res.data.data;
          
          // 详细打印API返回的数据，帮助调试
          console.log('API返回的完整记录数据:', JSON.stringify(record));
          console.log('API返回的食物列表数据:', JSON.stringify(record.foods));
          
          // 处理记录数据
          const foods = record.foods || [];
          console.log('处理后的食物列表:', JSON.stringify(foods));
          const mealTypeText = this.getMealTypeText(record.mealType);
          
          // 处理日期格式
          let formattedDate = '';
          if (record.mealTime) {
            formattedDate = util.formatDateTime(record.mealTime);
          } else {
            formattedDate = util.formatDateTime(new Date());
          }
          
          // 确保图片URL正确
          if (record.imageUrl) {
            record.imageUrl = constants.fixImageUrl(record.imageUrl);
          }
          
          console.log('获取到的记录详情:', record);
          
          this.setData({
            record,
            type: 'record',
            foods,
            mealTypeText,
            formattedDate,
            loading: false
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取记录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取记录详情请求失败', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  /**
   * 获取餐食类型文本
   */
  getMealTypeText(mealType) {
    return constants.MEAL_TYPE_TEXT[mealType] || '未知';
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },
  
  /**
   * 处理图片加载错误
   */
  handleImageError(e) {
    console.error('图片加载失败:', e);
    const record = this.data.record;
    
    // 如果图片URL需要修复，使用fixImageUrl函数
    if (record && record.imageUrl) {
      const fixedUrl = constants.fixImageUrl(record.imageUrl);
      if (fixedUrl !== record.imageUrl) {
        record.imageUrl = fixedUrl;
        this.setData({ record });
        console.log('尝试修复图片URL:', record.imageUrl);
      }
    }
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
    const { record, type, foods, mealTypeText, formattedDate } = this.data;
    
    let title = '';
    let path = '';
    let imageUrl = '';
    
    if (type === 'record' && record) {
      // 分享饮食记录
      const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
      title = `我的${mealTypeText}记录 - ${totalCalories}卡路里`;
      path = `/pages/detail/index?data=${encodeURIComponent(JSON.stringify(record))}&type=record`;
      imageUrl = record.imageUrl || '';
    } else if (type === 'food' && record) {
      // 分享单个食物
      title = `${record.name} - ${record.calories}卡路里`;
      path = `/pages/detail/index?data=${encodeURIComponent(JSON.stringify(record))}&type=food`;
      imageUrl = record.imageUrl || '';
    } else {
      // 默认分享
      title = '食刻卡路里 - AI智能识别，轻松记录卡路里';
      path = '/pages/index/index';
    }
    
    console.log('分享信息:', { title, path, imageUrl });
    
    return {
      title: title,
      path: path,
      imageUrl: imageUrl
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { record, type, foods, mealTypeText, formattedDate } = this.data;
    
    let title = '';
    let query = '';
    let imageUrl = '';
    
    if (type === 'record' && record) {
      // 分享饮食记录到朋友圈
      const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
      title = `${formattedDate} ${mealTypeText}记录 - ${totalCalories}卡路里 #食刻卡路里`;
      query = `data=${encodeURIComponent(JSON.stringify(record))}&type=record`;
      imageUrl = record.imageUrl || '';
    } else if (type === 'food' && record) {
      // 分享单个食物到朋友圈
      title = `${record.name} - ${record.calories}卡路里 #食刻卡路里 #健康饮食`;
      query = `data=${encodeURIComponent(JSON.stringify(record))}&type=food`;
      imageUrl = record.imageUrl || '';
    } else {
      // 默认分享到朋友圈
      title = '食刻卡路里 - AI智能识别，轻松记录卡路里 #健康生活';
      query = '';
    }
    
    console.log('朋友圈分享信息:', { title, query, imageUrl });
    
    return {
      title: title,
      query: query,
      imageUrl: imageUrl
    };
  }
})