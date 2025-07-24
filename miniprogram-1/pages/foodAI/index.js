const app = getApp()
const constants = require('../../utils/constants')
const api = require('../../utils/api')
const loading = require('../../utils/loading')

Page({
  data: {
    tempFilePath: '', // 临时图片路径
    imageSrc: '', // 显示的图片路径
    recognizeResult: null, // 识别结果
    recognitionId: null, // 识别记录ID
    foods: [], // 识别出的食物列表
    isLoading: false, // 是否正在加载
    showResult: false, // 是否显示结果
    mealTypes: [{
      id: 1,
      name: '早餐'
    }, {
      id: 2,
      name: '午餐'
    }, {
      id: 3,
      name: '晚餐'
    }, {
      id: 4,
      name: '宵夜'
    }, {
      id: 5,
      name: '零食'
    }],
    selectedMealType: 2, // 默认午餐
    selectedMealTypeIndex: 1, // 默认午餐在数组中的索引（从0开始）
    selectedMealTypeName: '午餐', // 默认显示名称
    canSave: false // 是否可以保存
  },
  
  onLoad() {
    // 检查登录状态
    const token = api.getToken()
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    // 初始化页面其他数据
    this.setData({
      mealTypes: [{
        id: 1,
        name: '早餐'
      }, {
        id: 2,
        name: '午餐'
      }, {
        id: 3,
        name: '晚餐'
      }, {
        id: 4,
        name: '宵夜'
      }, {
        id: 5,
        name: '零食'
      }],
      selectedMealType: 2 // 默认午餐
    })
  },
  
  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          tempFilePath: tempFilePath,
          imageSrc: tempFilePath,
          showResult: false,
          recognizeResult: null,
          foods: [],
          canSave: false
        })
        
        // 自动开始识别
        this.recognizeImage()
      }
    })
  },
  
  // 识别图片
  recognizeImage() {
    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      })
      return
    }
    
    // 检查登录状态
    const token = api.getToken()
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    this.setData({
      isLoading: true
    })
    
    loading.showRecognizing()
    
    // 上传图片并识别
    wx.uploadFile({
      url: app.globalData.baseUrl + '/ai/recognize',
      filePath: this.data.tempFilePath,
      name: 'file',
      header: {
        'Authorization': api.getToken() || ''
      },
      success: (res) => {
        try {
          const result = JSON.parse(res.data)
          if (result.code === 200) {
            // 识别成功，跳转到结果页面
            const recognitionData = result.data;
            // 将foods数组转为字符串，便于传参
            const foodsStr = encodeURIComponent(JSON.stringify(recognitionData.foods || []));
            
            // 跳转到结果页面（移除图片参数）
            wx.navigateTo({
              url: `/pages/foodAI/result?recognitionId=${recognitionData.recognitionId}&foods=${foodsStr}`
            });
          } else {
            console.error('识别失败', result)
            wx.showToast({
              title: result.message || '识别失败',
              icon: 'none',
              duration: 3000
            })
          }
        } catch (error) {
          console.error('解析结果失败', error, res.data)
          wx.showToast({
            title: '解析结果失败',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: (err) => {
        console.error('识别失败', err)
        
        // 如果是域名问题，提供更明确的提示
        if (err.errMsg && err.errMsg.includes('url not in domain list')) {
          wx.showModal({
            title: '上传失败',
            content: '请确保在微信开发者工具中勾选"不校验合法域名"选项，或在小程序管理后台添加接口域名到合法域名列表中。',
            showCancel: false
          })
        } else {
          wx.showToast({
            title: '图片上传或识别失败: ' + (err.errMsg || err.message || '未知错误'),
            icon: 'none',
            duration: 3000
          })
        }
      },
      complete: () => {
        this.setData({
          isLoading: false
        })
        loading.hideLoading()
      }
    })
  },
  
  // 选择/取消选择食物
  toggleSelectFood(e) {
    const index = e.currentTarget.dataset.index
    const foods = this.data.foods
    const food = foods[index]
    
    // 由于后端已默认选中置信度最高的食物，这里直接设置UI状态
    foods[index].selected = true
          this.setData({
            foods: foods
          })
    
    wx.showToast({
      title: '已选中该食物',
      icon: 'success',
      duration: 1000
    })
  },
  
  // 改变餐食类型
  changeMealType(e) {
    const selectedIndex = parseInt(e.detail.value)
    const selectedMealType = this.data.mealTypes[selectedIndex].id
    const selectedMealTypeName = this.data.mealTypes[selectedIndex].name
    this.setData({
      selectedMealType: selectedMealType,
      selectedMealTypeIndex: selectedIndex,
      selectedMealTypeName: selectedMealTypeName
    })
    console.log('餐食类型已更改为:', selectedMealTypeName)
  },
  
  // 输入备注
  inputRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },
  
  // 保存记录
  saveRecord() {
    if (!this.data.recognitionId) {
      wx.showToast({
        title: '请先进行识别',
        icon: 'none'
      })
      return
    }
    
    // 检查登录状态
    const token = api.getToken()
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    // 确保recognitionId是有效值（不是undefined、null或空字符串）
    if (!this.data.recognitionId || this.data.recognitionId === 'undefined') {
      wx.showToast({
        title: '识别ID无效，请重新识别',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      isLoading: true
    })
    
    loading.showSaving()
    
    // 使用wx.request替代wx.uploadFile，不需要再上传图片
    wx.request({
      url: app.globalData.baseUrl + '/ai/create-meal',
      method: 'POST',
      data: {
        recognitionId: this.data.recognitionId,
        mealType: this.data.selectedMealType,
        remark: ''
      },
      header: {
        'content-type': 'application/json',
        'Authorization': api.getToken() || ''
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          wx.showToast({
            title: '保存成功'
          })
          // 2秒后返回到饮食记录页面
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/meals/index'
            })
          }, 2000)
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('保存失败', err)
        wx.showToast({
          title: '网络错误，保存失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          isLoading: false
        })
        loading.hideLoading()
      }
    })
  },
  
  // 重新识别
  reRecognize() {
    this.chooseImage()
  }
}) 