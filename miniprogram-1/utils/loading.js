/**
 * 全局加载动画管理工具
 */

let loadingInstance = null;

/**
 * 显示粉色方块滚动加载动画
 */
const showLoading = () => {
  // 如果已经有加载动画在显示，先隐藏
  if (loadingInstance) {
    hideLoading();
  }

  // 创建加载动画页面
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage) {
    // 如果页面有自定义的loading组件，优先使用
    if (currentPage.selectComponent && currentPage.selectComponent('#custom-loading')) {
      loadingInstance = currentPage.selectComponent('#custom-loading');
      loadingInstance.show();
      return;
    }
    
    // 如果页面有loading数据字段，设置为true
    if (currentPage.setData) {
      currentPage.setData({
        loading: true
      });
      loadingInstance = 'page-loading';
      return;
    }
  }

  // 如果都没有，不显示任何加载动画
  console.log('没有找到合适的加载动画组件');
};

/**
 * 隐藏加载动画
 */
const hideLoading = () => {
  if (loadingInstance === 'page-loading') {
    // 隐藏页面级加载
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.setData) {
      currentPage.setData({
        loading: false
      });
    }
  } else if (loadingInstance && loadingInstance.hide) {
    // 隐藏组件级加载
    loadingInstance.hide();
  }
  
  loadingInstance = null;
};

/**
 * 显示上传中动画
 */
const showUploading = () => {
  showLoading();
};

/**
 * 显示识别中动画
 */
const showRecognizing = () => {
  showLoading();
};

/**
 * 显示保存中动画
 */
const showSaving = () => {
  showLoading();
};

/**
 * 显示登录中动画
 */
const showLoginLoading = () => {
  showLoading();
};

module.exports = {
  showLoading,
  hideLoading,
  showUploading,
  showRecognizing,
  showSaving,
  showLoginLoading
}; 