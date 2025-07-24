/**
 * 简单的事件总线，用于页面间通信
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * 监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * 移除事件监听
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    
    const index = this.events[eventName].indexOf(callback);
    if (index > -1) {
      this.events[eventName].splice(index, 1);
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 传递的数据
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件 ${eventName} 的回调函数执行出错:`, error);
      }
    });
  }

  /**
   * 清除所有事件监听
   */
  clear() {
    this.events = {};
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus();

// 定义事件常量
const EVENTS = {
  SETTINGS_UPDATED: 'settings_updated',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  MEAL_RECORD_ADDED: 'meal_record_added',
  MEAL_RECORD_DELETED: 'meal_record_deleted'
};

module.exports = {
  eventBus,
  EVENTS
}; 