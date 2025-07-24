// pages/privacy/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    type: 'privacy' // privacy: 隐私政策, agreement: 用户协议
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 根据参数设置页面类型
    if (options.type) {
      this.setData({
        type: options.type
      });
    }
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: options.type === 'agreement' ? '用户协议' : '隐私政策'
    });
  },

  /**
   * 确认按钮点击事件
   */
  onConfirm() {
    // 返回上一页
    wx.navigateBack();
  }
}); 