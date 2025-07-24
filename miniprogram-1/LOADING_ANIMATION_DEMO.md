# 🎯 跳跃方块加载动画更新完成

## 📋 更新概述

已成功将项目中所有的加载动画替换为来自 Uiverse.io 的跳跃方块动画效果。

### 🎨 动画特点

- **跳跃效果**: 方块会进行旋转跳跃动画
- **阴影效果**: 底部有动态阴影跟随
- **流畅动画**: 0.5秒循环，线性动画效果
- **统一配色**: 使用浅粉色 `#FFB6C1` (Light Pink)

## 🔄 已更新的文件

### 1. 全局样式
- **文件**: `app.wxss`
- **更新**: 替换了 `.loading` 和 `.loader` 相关样式

### 2. 专用加载组件
- **文件**: `components/loading/loading.wxss`
- **更新**: 更新了 `.square` 元素的动画效果

### 3. 页面级加载动画

#### Profile 页面
- **文件**: `pages/profile/index.wxss`
- **更新**: `.loading-block` 样式

#### History 页面
- **文件**: `pages/history/index.wxss`
- **更新**: `.loading-block` 样式

#### Index 页面
- **文件**: `pages/index/index.wxss`
- **更新**: `.loader` 颜色统一

#### Settings 页面
- **文件**: `pages/settings/index.wxss`
- **更新**: 新增 `.loading-container .loader` 样式

#### FoodAI 页面
- **文件**: `pages/foodAI/index.wxss`
- **更新**: `.loader` 颜色统一

## 🎯 动画参数

### 跳跃动画 (jump7456)
```css
@keyframes jump7456 {
  15% {
    border-bottom-right-radius: 6rpx;
  }
  25% {
    transform: translateY(18rpx) rotate(22.5deg);
  }
  50% {
    transform: translateY(36rpx) scale(1, .9) rotate(45deg);
    border-bottom-right-radius: 80rpx;
  }
  75% {
    transform: translateY(18rpx) rotate(67.5deg);
  }
  100% {
    transform: translateY(0) rotate(90deg);
  }
}
```

### 阴影动画 (shadow324)
```css
@keyframes shadow324 {
  0%, 100% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.2, 1);
  }
}
```

## 🎨 颜色配置

- **主方块颜色**: `#FFB6C1` (浅粉色)
- **阴影颜色**: `rgba(255, 182, 193, 0.4)`
- **方块大小**: 96rpx × 96rpx
- **阴影大小**: 96rpx × 10rpx

## 📱 使用方法

### 在 WXML 中使用

#### 全局加载器
```xml
<view class="loading">
  <view class="loader"></view>
</view>
```

#### 专用加载组件
```xml
<view class="loading-container">
  <view class="loading-squares">
    <view class="square"></view>
  </view>
</view>
```

#### 页面级加载
```xml
<!-- Profile/History 页面 -->
<view class="custom-loading" wx:if="{{loading}}">
  <view class="loading-block"></view>
</view>

<!-- Settings 页面 -->
<view class="loading-container" wx:if="{{loading}}">
  <view class="loader"></view>
</view>
```

## ✨ 视觉效果

1. **跳跃**: 方块会垂直跳跃，最高点达到 36rpx
2. **旋转**: 每次跳跃伴随 90度旋转
3. **缩放**: 在最高点时会轻微压扁 (scale(1, 0.9))
4. **圆角**: 跳跃过程中底部右角会动态变化
5. **阴影**: 底部阴影会同步缩放，营造真实的跳跃感

## 🔧 自定义选项

如需调整动画，可以修改以下参数：

- **动画速度**: 修改 `animation` 中的 `0.5s`
- **跳跃高度**: 修改 `translateY` 的数值
- **方块大小**: 修改 `width` 和 `height`
- **颜色**: 修改 `background` 属性

## 🎉 完成状态

✅ 所有页面的加载动画已统一更新  
✅ 颜色配置已与项目主题保持一致  
✅ 动画效果流畅且现代化  
✅ 兼容微信小程序环境  

---

*动画来源: Uiverse.io by alexruix*  
*更新时间: 2024年12月15日* 