Page({
  data: {
    avatar1: '',
    avatar2: '',
    avatar3: '',
    logs: []
  },

  onLoad() {
    this.addLog('页面加载完成');
  },

  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    const logs = this.data.logs;
    logs.unshift(logMessage);
    if (logs.length > 10) {
      logs.pop();
    }
    
    this.setData({
      logs: logs
    });
  },

  /**
   * 方案一：新版头像选择器
   */
  onChooseAvatar1(e) {
    this.addLog('=== 新版头像选择器测试 ===');
    this.addLog(`事件对象: ${JSON.stringify(e.detail)}`);
    
    const { avatarUrl } = e.detail;
    
    if (avatarUrl) {
      this.addLog(`✅ 获取到头像: ${avatarUrl}`);
      this.addLog(`头像URL类型: ${typeof avatarUrl}`);
      this.addLog(`头像URL长度: ${avatarUrl.length}`);
      
      this.setData({
        avatar1: avatarUrl
      });
      
      wx.showToast({
        title: '头像获取成功',
        icon: 'success'
      });
    } else {
      this.addLog('❌ 未获取到头像URL');
      wx.showToast({
        title: '获取头像失败',
        icon: 'none'
      });
    }
  },

  /**
   * 方案二：getUserProfile
   */
  getUserProfile() {
    this.addLog('=== getUserProfile测试 ===');
    
    wx.getUserProfile({
      desc: '用于测试获取头像',
      success: (res) => {
        this.addLog('✅ getUserProfile成功');
        this.addLog(`用户信息: ${JSON.stringify(res.userInfo)}`);
        
        const avatarUrl = res.userInfo.avatarUrl;
        this.addLog(`头像URL: ${avatarUrl}`);
        
        // 检查是否是默认头像
        const isDefaultAvatar = avatarUrl && 
          (avatarUrl.includes('default') || 
           avatarUrl.includes('132') || 
           avatarUrl.includes('thirdwx.qlogo.cn'));
           
        if (isDefaultAvatar) {
          this.addLog('⚠️ 检测到默认头像');
        } else {
          this.addLog('✅ 获取到真实头像');
        }
        
        this.setData({
          avatar2: avatarUrl
        });
        
        wx.showToast({
          title: '用户信息获取成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        this.addLog(`❌ getUserProfile失败: ${JSON.stringify(err)}`);
        wx.showToast({
          title: '用户拒绝授权',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 方案三：选择本地图片
   */
  chooseLocalImage() {
    this.addLog('=== 选择本地图片测试 ===');
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.addLog('✅ 选择图片成功');
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.addLog(`图片路径: ${tempFilePath}`);
        
        this.setData({
          avatar3: tempFilePath
        });
        
        wx.showToast({
          title: '图片选择成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        this.addLog(`❌ 选择图片失败: ${JSON.stringify(err)}`);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 清空测试结果
   */
  clearTest() {
    this.setData({
      avatar1: '',
      avatar2: '',
      avatar3: '',
      logs: []
    });
    this.addLog('测试结果已清空');
  }
}); 