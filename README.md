<<<<<<< HEAD
# 食刻卡路里 - 微信小程序

> 一款基于AI图像识别的卡路里计算记录小程序，帮助用户轻松管理饮食健康

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-WeChat%20Mini%20Program-green.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![Backend](https://img.shields.io/badge/backend-Spring%20Boot-brightgreen.svg)](https://spring.io/projects/spring-boot)

## 📱 项目简介

食刻卡路里是一款智能的饮食管理小程序，通过AI图像识别技术，用户只需拍照即可快速获取食物的卡路里信息，并自动记录饮食数据，帮助用户科学管理饮食健康。

### ✨ 主要功能

- 📸 **智能拍照识别**：使用百度AI技术识别食物类型
- 🔢 **卡路里计算**：自动计算食物卡路里含量
- 📊 **饮食记录**：记录每日饮食摄入情况
- 📈 **数据统计**：提供日/周/月统计报表
- 👤 **用户管理**：微信登录，个人信息管理
- 🎯 **目标设定**：设置每日卡路里目标

### 🏗️ 技术架构

```
食刻卡路里项目
├── miniprogram-1/          # 微信小程序前端
│   ├── pages/              # 页面文件
│   ├── components/         # 自定义组件
│   ├── utils/              # 工具函数
│   └── miniprogram_npm/    # npm依赖包
└── houduan/               # 后端服务
    └── houduan/           # Spring Boot项目
        ├── src/           # 源代码
        ├── target/        # 编译输出
        └── uploads/       # 文件存储
```

## 🛠️ 技术栈

### 前端（微信小程序）
- **框架**：微信小程序原生框架
- **UI组件**：Vant Weapp
- **状态管理**：页面级状态管理
- **网络请求**：wx.request API
- **图像处理**：微信相机API

### 后端（Spring Boot）
- **框架**：Spring Boot 2.7.x
- **数据库**：MySQL 8.0
- **缓存**：Redis 6.0+
- **ORM**：MyBatis Plus
- **认证**：JWT Token
- **AI服务**：百度AI图像识别
- **文件存储**：MinIO
- **部署**：Docker + Nginx

## 🚀 快速开始

### 环境要求

#### 前端开发
- 微信开发者工具
- Node.js 14+

#### 后端开发
- JDK 11+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+

### 本地开发部署

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/calorie-tracker.git
cd calorie-tracker
```

#### 2. 后端服务部署

```bash
# 进入后端目录
cd houduan/houduan

# 安装依赖并编译
mvn clean install

# 配置数据库
# 1. 创建MySQL数据库
# 2. 执行 src/main/resources/db/init.sql 初始化数据库
# 3. 修改 application-dev.yml 中的数据库连接信息

# 启动Redis服务
redis-server

# 启动后端服务
mvn spring-boot:run
```

#### 3. 前端小程序部署

```bash
# 进入小程序目录
cd miniprogram-1

# 使用微信开发者工具打开项目
# 1. 打开微信开发者工具
# 2. 选择"导入项目"
# 3. 选择 miniprogram-1 目录
# 4. 配置 AppID（测试可使用测试号）
```

#### 4. 配置文件说明

**后端配置文件**：
- `application-dev.yml`：开发环境配置
- `application-prod.yml`：生产环境配置

**小程序配置**：
- 修改 `utils/api.js` 中的后端API地址
- 配置微信小程序的AppID和AppSecret

## 📦 生产环境部署

### Docker部署（推荐）

```bash
# 构建后端镜像
cd houduan/houduan
docker build -t calorie-tracker-backend .

# 使用docker-compose部署
docker-compose up -d
```

### 传统部署

详细的生产环境部署文档请参考：
- [阿里云服务器部署文档](阿里云服务器部署文档.md)
- [AWS EC2部署文档](houduan/houduan/AWS_EC2_DEPLOYMENT_README.md)

## 📚 API文档

### 用户相关接口
- `POST /api/user/login` - 微信登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息

### 食物识别相关接口
- `POST /api/recognition/upload` - 上传图片进行识别
- `GET /api/recognition/history` - 获取历史识别记录

### 饮食记录相关接口
- `POST /api/meal` - 创建饮食记录
- `GET /api/meal/list` - 获取饮食记录列表
- `GET /api/meal/daily/{date}` - 获取指定日期的饮食记录

完整API文档请查看：[后端README](houduan/houduan/README.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- 项目维护者：[Your Name](https://github.com/your-username)

## 🙏 致谢

- 感谢微信小程序平台提供的开发框架
- 感谢百度AI开放平台提供的图像识别服务
- 感谢所有开源项目的贡献者

## ❗ 常见问题解决

### 登录问题："系统繁忙，请稍后再试"

如果遇到登录失败，请按以下步骤排查：

1. **运行诊断脚本**
   ```bash
   chmod +x diagnose-login-issue.sh
   ./diagnose-login-issue.sh
   ```

2. **检查后端服务状态**
   ```bash
   # 检查Java进程
   ps aux | grep java
   
   # 检查端口监听
   netstat -nlp | grep 8080
   ```

3. **查看详细错误日志**
   ```bash
   tail -f houduan/houduan/logs/spring.log
   ```

4. **检查微信小程序配置**
   - 确认AppID和AppSecret配置正确
   - 验证网络连接和域名配置

**详细解决方案**: 参考 [登录问题排查指南](LOGIN_TROUBLESHOOTING.md)

### 数据库连接问题

```bash
# 启动MySQL服务
sudo systemctl start mysql

# 创建数据库
mysql -u root -p -e "CREATE DATABASE calorie_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Redis连接问题

```bash
# 启动Redis服务
sudo systemctl start redis

# 测试连接
redis-cli ping
```

---

## 📋 GitHub部署完整指南

### 步骤1：准备工作

1. **注册GitHub账号**（如果还没有）
   - 访问 [GitHub官网](https://github.com) 注册账号

2. **安装Git**（如果还没有）
   ```bash
   # macOS
   brew install git
   
   # 或者从官网下载：https://git-scm.com/
   ```

3. **配置Git用户信息**
   ```bash
   git config --global user.name "你的用户名"
   git config --global user.email "你的邮箱@example.com"
   ```

### 步骤2：创建GitHub仓库

1. **登录GitHub**，点击右上角的 "+" 号，选择 "New repository"

2. **填写仓库信息**：
   - Repository name: `calorie-tracker`（或你喜欢的名字）
   - Description: `食刻卡路里 - 微信小程序`
   - 选择 Public（公开）或 Private（私有）
   - ✅ 勾选 "Add a README file"
   - ✅ 勾选 "Add .gitignore"，选择 "Java" 模板
   - ✅ 勾选 "Choose a license"，推荐选择 "MIT License"

3. **点击 "Create repository"**

### 步骤3：准备项目文件

在上传到GitHub之前，我们需要创建一些必要的文件：

#### 3.1 创建根目录的.gitignore文件

```bash
# 进入项目根目录
cd /Users/lijiahong/WeChatProjects

# 给部署脚本添加执行权限
chmod +x deploy-to-github.sh

# 运行自动化部署脚本
./deploy-to-github.sh
```

### 步骤4：手动部署（可选）

如果不使用自动化脚本，可以按以下步骤手动部署：

```bash
# 初始化Git仓库
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/calorie-tracker.git

# 添加所有文件
git add .

# 提交代码
git commit -m "🎉 初始提交：食刻卡路里小程序项目"

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 步骤5：验证部署

1. 访问你的GitHub仓库页面
2. 确认所有文件已正确上传
3. 检查README.md是否正确显示

## 📞 需要帮助？

如果在部署过程中遇到问题：

1. **查看故障排除文档**：
   - [登录问题排查指南](LOGIN_TROUBLESHOOTING.md)
   - [详细部署指南](GITHUB_DEPLOYMENT_GUIDE.md)
   - [环境配置说明](DEPLOYMENT.md)

2. **使用诊断工具**：
   ```bash
   ./diagnose-login-issue.sh  # 登录问题诊断
   ```

3. **查看快速指南**：
   - [3分钟快速部署](QUICK_START.md)

4. **获取社区帮助**：
   - 在GitHub仓库中创建Issue
   - 查看[GitHub官方文档](https://docs.github.com/)
   - 搜索Stack Overflow相关问题

祝你部署顺利！🎉 
