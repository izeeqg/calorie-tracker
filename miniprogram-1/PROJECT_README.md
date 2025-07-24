# 食刻卡路里 - 微信小程序

## 📱 项目简介

食刻卡路里是一款基于AI识别技术的智能卡路里记录微信小程序。用户可以通过拍照识别食物，自动计算卡路里，并进行健康数据管理和统计分析。

### ✨ 核心功能

- 🤖 **AI智能识别**：一键拍照识别菜品，自动计算卡路里
- 🔐 **微信登录**：基于JWT的安全身份认证系统
- 📊 **数据统计**：可视化展示用户健康数据和历史记录
- 🎯 **目标管理**：个性化卡路里目标设置和追踪
- 📷 **照片管理**：支持本地上传和云端存储
- 🎨 **美观界面**：粉色主题UI设计，用户体验友好

### 🏗️ 技术架构

**前端技术栈：**
- 微信小程序原生开发
- 自定义组件系统
- 响应式布局设计
- 模块化工具函数

**后端集成：**
- Spring Boot RESTful API
- JWT身份认证
- MinIO对象存储
- MySQL数据持久化

## 🚀 快速开始

### 环境要求

- **微信开发者工具** v1.06.0+
- **微信小程序开发者账号**
- **Node.js** v14.0+ (可选，用于包管理)
- **后端服务** (Spring Boot API服务)

### 安装步骤

#### 1. 获取项目代码
```bash
# 克隆项目
git clone <your-repository-url>
cd miniprogram-1
```

#### 2. 导入微信开发者工具
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录 `miniprogram-1`
4. 填写项目信息：
   - **AppID**: 使用您的微信小程序AppID
   - **项目名称**: 食刻卡路里
   - **开发模式**: 小程序

#### 3. 配置后端服务地址
编辑 `utils/constants.js` 文件：

```javascript
// 开发环境配置
const API_BASE_URL = 'http://localhost:8080/api';  // 本地开发
const MINIO_BASE_URL = 'http://localhost:9000';

// 生产环境配置
// const API_BASE_URL = 'https://yourdomain.com/api';
// const MINIO_BASE_URL = 'https://minio.yourdomain.com';
```

#### 4. 微信小程序后台配置
在微信公众平台小程序后台配置服务器域名：

**开发设置 > 服务器域名：**
- request合法域名：`https://yourdomain.com`
- uploadFile合法域名：`https://yourdomain.com`  
- downloadFile合法域名：`https://minio.yourdomain.com`

## 📁 项目结构

```
miniprogram-1/
├── app.js                    # 全局应用逻辑
├── app.json                  # 全局配置文件
├── app.wxss                  # 全局样式文件
├── project.config.json       # 项目配置文件
├── sitemap.json             # 搜索优化配置
│
├── pages/                   # 页面目录
│   ├── login/              # 登录页面
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   │
│   ├── index/              # 首页
│   ├── profile/            # 个人资料页
│   ├── history/            # 历史记录页
│   ├── foodAI/             # AI识别相关页面
│   │   ├── index.js        # AI识别主页
│   │   ├── result.js       # 识别结果页
│   │   └── result_temp/    # 临时结果页
│   └── ...
│
├── components/             # 自定义组件
│   └── loading/           # 粉色加载动画组件
│       ├── loading.js
│       ├── loading.wxml
│       ├── loading.wxss
│       └── loading.json
│
├── utils/                 # 工具函数
│   ├── api.js            # API接口封装
│   ├── constants.js      # 常量配置
│   ├── loading.js        # 加载管理工具
│   └── util.js           # 通用工具函数
│
├── custom-tab-bar/       # 自定义TabBar
├── images/               # 图片资源
└── miniprogram_npm/      # npm包目录
```

## 🔧 核心功能模块

### 1. 身份认证系统

**文件位置**: `pages/login/`

**核心功能**:
- 微信一键登录
- JWT Token管理
- 自动登录状态保持
- 登录状态拦截

**使用方式**:
```javascript
// 登录
const loginResult = await api.wechatLogin(code, encryptedData, iv);

// 检查登录状态
const isLoggedIn = api.isLoggedIn();

// 获取用户信息
const userInfo = api.getUserInfo();
```

### 2. AI智能识别

**文件位置**: `pages/foodAI/`

**核心功能**:
- 相机拍照/相册选择
- 图片上传和压缩
- AI菜品识别
- 卡路里自动计算

**使用流程**:
1. 用户选择拍照或从相册选择图片
2. 图片自动压缩并上传到服务器
3. 调用AI识别接口分析菜品
4. 返回识别结果和卡路里信息
5. 用户确认并保存数据

### 3. 数据统计与可视化

**文件位置**: `pages/index/`，`pages/history/`

**功能特点**:
- 每日卡路里摄入统计
- 历史数据趋势分析
- 目标达成度展示
- 饮食记录管理

### 4. 自定义加载动画

**文件位置**: `components/loading/`

**动画特效**:
- 粉色方块滚动动画
- 360度旋转效果
- 动态颜色变化
- 缩放动画组合

**使用方法**:
```javascript
// 在页面中引入组件
import loading from '../../utils/loading';

// 显示加载动画
loading.showLoading();

// 隐藏加载动画
loading.hideLoading();

// 专用加载提示
loading.showUploading();    // 上传中
loading.showRecognizing();  // 识别中
loading.showSaving();       // 保存中
```

## 🎨 UI设计规范

### 主题色彩
- **主色调**: 粉色渐变 `#ff9a9e` → `#fad0c4`
- **强调色**: 深粉色 `#ff6b8a`
- **背景色**: 浅粉色 `#ffeef0`
- **文字色**: 深灰色 `#333333`

### 设计原则
- **简洁美观**: 清爽的界面设计，突出核心功能
- **用户友好**: 符合微信设计规范，操作直观
- **视觉一致**: 统一的色彩搭配和组件样式
- **响应式**: 适配不同屏幕尺寸的设备

### 组件库
- 自定义Loading组件
- 统一的导航栏样式
- 标准化的表单元素
- 一致的按钮设计

## 🔌 API接口集成

### 接口配置

**文件位置**: `utils/api.js`

**核心方法**:
```javascript
// 基础请求方法
api.request(url, options)

// 用户相关
api.wechatLogin(code, encryptedData, iv)
api.getUserProfile()
api.updateUserInfo(userInfo)

// AI识别相关
api.uploadImage(filePath)
api.recognizeFood(imageUrl)
api.saveMealRecord(mealData)

// 数据查询
api.getMealHistory(date)
api.getStatistics(period)
```

### 错误处理
- 网络异常自动重试
- 401错误自动跳转登录
- 用户友好的错误提示
- 详细的错误日志记录

### 请求拦截器
```javascript
// 自动添加认证头
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// 统一错误处理
if (res.statusCode === 401) {
  // 跳转到登录页
  wx.reLaunch({ url: '/pages/login/index' });
}
```

## 📊 数据管理

### 本地存储
- **用户信息**: `wx.getStorageSync('userInfo')`
- **登录令牌**: `wx.getStorageSync('user_token')`
- **用户设置**: `wx.getStorageSync('userSettings')`

### 数据同步
- 登录后自动同步云端数据
- 离线数据本地缓存
- 网络恢复后自动上传

### 隐私保护
- 敏感数据加密存储
- 用户数据本地化处理
- 符合微信隐私政策

## 🚀 部署发布

### 开发环境测试
1. 确保后端服务正常运行
2. 在微信开发者工具中预览
3. 真机调试测试各项功能
4. 检查网络请求和数据交互

### 生产环境发布
1. **更新配置**:
   ```javascript
   // utils/constants.js
   const API_BASE_URL = 'https://yourdomain.com/api';
   const MINIO_BASE_URL = 'https://minio.yourdomain.com';
   ```

2. **版本管理**:
   - 更新 `project.config.json` 中的版本号
   - 记录版本更新日志

3. **提交审核**:
   - 在微信开发者工具中上传代码
   - 登录微信公众平台提交审核
   - 等待微信官方审核通过

### 版本发布流程
```bash
# 1. 代码检查
npm run lint (如果有配置)

# 2. 构建优化
# 清理无用文件和代码注释

# 3. 上传代码
# 在微信开发者工具中点击"上传"

# 4. 提交审核
# 登录微信公众平台管理后台
```

## 🧪 测试指南

### 功能测试清单

#### 登录认证
- [ ] 微信登录功能正常
- [ ] JWT Token 保存和验证
- [ ] 登录状态持久化
- [ ] 自动跳转登录页面

#### AI识别功能
- [ ] 相机拍照功能
- [ ] 相册图片选择
- [ ] 图片上传成功
- [ ] AI识别返回结果
- [ ] 卡路里计算准确

#### 数据管理
- [ ] 历史记录查询
- [ ] 数据统计展示
- [ ] 用户资料更新
- [ ] 本地数据缓存

#### 界面交互
- [ ] 页面导航正常
- [ ] 加载动画显示
- [ ] 错误提示友好
- [ ] 响应式布局

### 性能测试
- 页面加载速度 < 2秒
- 图片上传时间 < 5秒
- AI识别响应时间 < 10秒
- 内存使用合理

### 兼容性测试
- iOS微信客户端
- Android微信客户端
- 不同屏幕尺寸设备
- 不同网络环境

## 🐛 故障排除

### 常见问题

#### 1. 登录失败
**现象**: 点击登录按钮无反应或提示错误

**排查步骤**:
```javascript
// 检查网络连接
wx.getNetworkType({
  success: (res) => {
    console.log('网络类型:', res.networkType);
  }
});

// 检查后端服务
api.request('/health').then(res => {
  console.log('后端服务状态:', res);
});

// 检查微信授权
wx.getSetting({
  success: (res) => {
    console.log('授权状态:', res.authSetting);
  }
});
```

#### 2. 图片上传失败
**现象**: 选择图片后上传一直显示加载中

**解决方案**:
- 检查图片大小（限制50MB以内）
- 确认网络连接稳定
- 验证服务器域名配置
- 查看后端上传接口日志

#### 3. AI识别无结果
**现象**: 图片上传成功但识别失败

**排查方向**:
- 图片质量和清晰度
- 食物是否在识别范围内
- 后端AI服务是否正常
- 检查识别接口返回数据

#### 4. 加载动画不显示
**现象**: 操作时没有loading效果

**解决方法**:
```javascript
// 检查组件是否正确引入
// pages/xxx/xxx.json
{
  "usingComponents": {
    "custom-loading": "../../components/loading/loading"
  }
}

// 检查是否正确调用
loading.showLoading();
```

### 调试技巧

#### 1. 控制台调试
```javascript
// 开启调试模式
console.log('调试信息:', data);

// 网络请求调试
wx.request({
  // ...
  success: (res) => {
    console.log('请求成功:', res);
  },
  fail: (err) => {
    console.error('请求失败:', err);
  }
});
```

#### 2. 真机调试
- 使用微信开发者工具的真机调试功能
- 查看真机环境下的表现差异
- 测试不同网络环境下的性能

#### 3. 网络抓包
- 使用代理工具查看网络请求
- 验证API接口的调用和返回
- 检查请求头和参数是否正确

## 📈 性能优化

### 代码优化
- **按需加载**: 大图片和组件懒加载
- **代码分割**: 减少首屏加载时间
- **缓存策略**: 合理使用本地存储
- **请求优化**: 减少不必要的网络请求

### 图片优化
- 图片压缩处理
- WebP格式支持
- 图片懒加载
- CDN加速

### 用户体验优化
- 加载状态提示
- 错误兜底处理
- 网络异常提示
- 操作反馈优化

## 🔄 版本历史

### v1.2.0 (最新版本)
- ✅ 移除默认用户功能，全面启用JWT认证
- ✅ 新增粉色方块滚动加载动画
- ✅ Logo图片迁移至MinIO云存储
- ✅ 优化用户头像功能和交互体验
- ✅ 修复foodAI页面token获取问题
- ✅ 美化登录页面UI设计

### v1.1.0
- ✅ 集成AI菜品识别功能
- ✅ 添加健康数据统计
- ✅ 优化图片上传处理
- ✅ 增强错误处理机制

### v1.0.0
- ✅ 基础框架搭建
- ✅ 微信登录集成
- ✅ 基本页面结构
- ✅ API接口封装

## 🤝 贡献指南

### 开发规范
- 遵循微信小程序开发规范
- 使用ESLint进行代码检查
- 组件化开发原则
- 统一的代码风格

### 提交规范
```bash
# 功能开发
git commit -m "feat: 添加新功能描述"

# Bug修复
git commit -m "fix: 修复问题描述"

# 样式调整
git commit -m "style: 样式调整描述"

# 文档更新
git commit -m "docs: 文档更新描述"
```

## 📞 技术支持

### 开发文档
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

### 问题反馈
如遇到技术问题，请提供：
1. 详细的问题描述
2. 复现步骤
3. 设备和环境信息
4. 相关错误日志

### 更新日志
定期关注项目更新和功能迭代：
- 查看 `CHANGELOG.md` 了解版本变更
- 关注微信小程序平台政策更新
- 及时更新依赖包和工具版本

---

## 📄 许可证

本项目基于 MIT 许可证开源，详情请查看 [LICENSE](LICENSE) 文件。

---

**🎉 感谢使用食刻卡路里小程序！如有任何问题或建议，欢迎反馈交流。** 