const app = getApp()
const constants = require('../../utils/constants')
const api = require('../../utils/api')

Page({
  data: {
    recognitionId: null, // 识别记录ID
    foods: [], // 识别出的食物列表
    isLoading: false, // 是否正在加载
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
    selectedMealTypeName: '午餐' // 默认显示名称
  },
  
  onLoad(options) {
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
    
    // 获取识别ID和食物数据（移除图片依赖）
    if (options.recognitionId && options.foods) {
      try {
        // 解析foods参数
        const foods = JSON.parse(decodeURIComponent(options.foods))
        this.setData({
          recognitionId: options.recognitionId,
          foods: foods
        })
      } catch (error) {
        console.error('解析参数失败', error)
        wx.showToast({
          title: '参数错误',
          icon: 'none'
        })
      }
    } else {
      wx.showToast({
        title: '参数不完整',
        icon: 'none'
      })
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },
  
  // 选择/取消选择食物
  toggleSelectFood(e) {
    const index = e.currentTarget.dataset.index
    const foods = this.data.foods
    
    // 切换选中状态
    foods[index].selected = !foods[index].selected
    
    this.setData({
      foods: foods
    })
    
    // 检查是否有选中的食物
    const selectedCount = foods.filter(food => food.selected).length
    
    if (foods[index].selected) {
      wx.showToast({
        title: `已选中 ${foods[index].name}`,
        icon: 'success',
        duration: 1000
      })
    } else {
      wx.showToast({
        title: `已取消选中 ${foods[index].name}`,
        icon: 'none',
        duration: 1000
      })
    }
    
    // 如果没有选中任何食物，提示用户
    if (selectedCount === 0) {
      wx.showToast({
        title: '请至少选择一种食物',
        icon: 'none',
        duration: 2000
      })
    }
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
  

  
  // 保存记录
  saveRecord() {
    if (!this.data.recognitionId) {
      wx.showToast({
        title: '识别ID无效',
        icon: 'none'
      })
      return
    }
    
    // 检查是否有选中的食物
    const selectedFoods = this.data.foods.filter(food => food.selected)
    if (selectedFoods.length === 0) {
      wx.showToast({
        title: '请至少选择一种食物',
        icon: 'none',
        duration: 2000
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
    
    // 获取选中食物的ID列表
    const selectedFoodIds = selectedFoods.map(food => food.id).join(',')
    
    this.setData({
      isLoading: true
    })
    
    // 使用wx.request发送数据
    wx.request({
      url: app.globalData.baseUrl + '/ai/create-meal',
      method: 'POST',
      data: {
        recognitionId: this.data.recognitionId,
        mealType: this.data.selectedMealType,
        selectedFoodIds: selectedFoodIds,
        remark: ''
      },
      header: {
        'content-type': 'application/json',
        'Authorization': api.getToken() || ''
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const selectedFoodNames = selectedFoods.map(food => food.name).join('、')
          const totalCalories = selectedFoods.reduce((sum, food) => sum + (food.calories || 0), 0)
          
          wx.showToast({
            title: `保存成功\n已记录${selectedFoods.length}种食物\n共${totalCalories}千卡`,
            icon: 'success',
            duration: 3000
          })
          
          // 3秒后返回到饮食记录页面
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 3000)
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
      }
    })
  },
  
  // 重新识别
  reRecognize() {
    wx.navigateBack()
  }
}) 