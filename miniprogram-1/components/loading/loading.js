/**
 * 粉色方块滚动加载动画组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示加载动画
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 显示加载动画
     */
    show() {
      this.setData({
        show: true
      });
    },

    /**
     * 隐藏加载动画
     */
    hide() {
      this.setData({
        show: false
      });
    }
  }
}); 