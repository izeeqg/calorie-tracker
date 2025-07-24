# 健康数据同步功能完善

## 功能概述
完善了健康数据的实时同步更新机制，确保用户设置变更后，所有页面的健康数据都能立即更新。

## 主要改进

### 1. 重构数据加载逻辑
- **Profile页面**: 使用Promise.all并行加载设置、今日卡路里、统计数据
- **首页**: 优化设置加载，支持从服务器获取最新设置
- **历史记录页面**: 添加动态目标卡路里支持

### 2. 事件总线机制
创建了全局事件总线(`utils/eventBus.js`)来处理页面间通信：

```javascript
// 事件类型
const EVENTS = {
  SETTINGS_UPDATED: 'settings_updated',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  MEAL_RECORD_ADDED: 'meal_record_added',
  MEAL_RECORD_DELETED: 'meal_record_deleted'
};

// 使用示例
eventBus.emit(EVENTS.SETTINGS_UPDATED, newSettings);
eventBus.on(EVENTS.SETTINGS_UPDATED, callback);
```

### 3. 页面监听机制
所有相关页面都监听设置更新事件：

- **Profile页面**: 监听设置更新，刷新健康数据
- **首页**: 监听设置更新，刷新目标卡路里
- **历史记录页面**: 监听设置更新，刷新进度条显示

### 4. 数据同步流程

```
用户修改设置
    ↓
保存到服务器
    ↓
发送事件通知
    ↓
所有页面收到通知
    ↓
自动刷新相关数据
```

## 具体实现

### Profile页面健康数据加载
```javascript
loadUserHealthData() {
  // 并行获取三类数据
  Promise.all([settingsPromise, mealsPromise, statsPromise])
    .then(([settings, todayCalories, stats]) => {
      this.setData({
        todayCalories: todayCalories,
        targetCalories: settings.targetCalories || 2000,
        recordDays: stats?.recordDays || 0,
        loading: false
      });
    });
}
```

### 设置更新通知
```javascript
// 设置页面保存成功后
api.saveUserSettingsToServer(newSettings)
  .then(() => {
    // 发送全局事件通知
    eventBus.emit(EVENTS.SETTINGS_UPDATED, newSettings);
  });
```

### 页面事件监听
```javascript
// 页面加载时注册监听
onLoad() {
  this.onSettingsUpdated = (settings) => {
    this.loadUserHealthData();
  };
  eventBus.on(EVENTS.SETTINGS_UPDATED, this.onSettingsUpdated);
}

// 页面卸载时移除监听
onUnload() {
  eventBus.off(EVENTS.SETTINGS_UPDATED, this.onSettingsUpdated);
}
```

## 测试验证

### 测试步骤
1. 打开Profile页面，查看当前健康数据
2. 点击"应用设置"进入设置页面
3. 修改目标卡路里值（如从2000改为2500）
4. 保存设置
5. 返回Profile页面，验证数据是否更新
6. 切换到历史记录页面，验证进度条是否使用新的目标值

### 预期结果
- ✅ 设置保存成功提示
- ✅ Profile页面健康数据立即更新
- ✅ 历史记录页面进度条使用新目标值
- ✅ 首页目标卡路里显示更新
- ✅ 控制台显示事件通知日志

## 相关文件
- `utils/eventBus.js` - 事件总线
- `pages/profile/index.js` - Profile页面
- `pages/index/index.js` - 首页
- `pages/history/index.js` - 历史记录页面
- `pages/history/history.js` - 历史记录组件
- `pages/settings/index.js` - 设置页面

## 技术特点
- 🔄 **实时同步**: 设置变更立即反映到所有页面
- 📡 **事件驱动**: 使用事件总线解耦页面间通信
- ⚡ **并行加载**: 使用Promise.all提高数据加载效率
- 🛡️ **错误处理**: 完善的降级和错误处理机制
- 🧹 **内存管理**: 页面卸载时自动清理事件监听

完成时间: 2025-01-11 