/**
 * 获取用户信息
 * @returns {Promise<WechatMiniprogram.UserInfo>} 用户信息
 */
getUserInfo(): Promise<WechatMiniprogram.UserInfo> {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.globalData.userInfo = res.userInfo
        resolve(res.userInfo)
      },
      fail: reject
    })
  })
},

/**
 * 获取用户信息
 * @returns {Promise<WechatMiniprogram.UserInfo>} 用户信息
 */
getUserProfile(): Promise<WechatMiniprogram.UserInfo> {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.globalData.userInfo = res.userInfo
        resolve(res.userInfo)
      },
      fail: reject
    })
  })
}, 