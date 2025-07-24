/**
 * 自定义底部导航栏组件
 * 使用圆形图标样式和Vant Weapp图标
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    list: [
      {
        icon: 'records',
        text: '记录',
        url: '/pages/history/index'
      },
      {
        icon: 'camera',
        text: '拍照',
        url: '/pages/index/index'
      },
      {
        icon: 'manager',
        text: '我的',
        url: '/pages/profile/index'
      }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e) {
      const index = e.currentTarget.dataset.index;
      const url = this.data.list[index].url;
      
      // 这里使用switchTab而不是navigateTo，确保可以跳转到tabBar页面
      wx.switchTab({
        url,
        fail: (error) => {
          console.error('导航失败:', error);
          // 如果switchTab失败，尝试使用reLaunch
          wx.reLaunch({
        url
          });
        }
      });
      
      this.setData({ active: index });
    },
    
    init() {
      const page = getCurrentPages().pop();
      const route = page ? page.route : 'pages/index/index';
      
      const active = this.data.list.findIndex(item => {
        // 使用不带前导斜杠的路径进行对比
        const itemPath = item.url.startsWith('/') ? item.url.substring(1) : item.url;
        return route.includes(itemPath.split('/')[1]); // 只比较主路径部分
      });
      
      if (active !== -1) {
        this.setData({ active });
      }
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.init();
    },
    
    ready() {
      // 页面显示时激活对应的标签
      this.init();
    }
  },
  
  /**
   * 组件所在页面的生命周期
   */
  pageLifetimes: {
    show() {
      this.init();
    }
  }
}) 