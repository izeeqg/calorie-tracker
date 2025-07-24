# 卡路里拍照计算记录小程序后端

## 项目介绍
这是卡路里拍照计算记录小程序的后端服务，提供用户管理、食物识别、卡路里计算、饮食记录等功能的API接口。

## 技术栈
- Spring Boot 2.7.x
- MySQL 8.0
- Redis
- MyBatis Plus
- JWT认证

## 开发环境
- JDK 11+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+

## 项目结构
```
src/main/java/com/calorie/
├── config/           # 配置类
├── controller/       # 控制器
├── service/          # 服务层
│   └── impl/         # 服务实现
├── mapper/           # MyBatis映射器
├── entity/           # 实体类
├── dto/              # 数据传输对象
├── vo/               # 视图对象
├── util/             # 工具类
├── exception/        # 异常处理
├── common/           # 通用类
└── CalorieApplication.java  # 启动类
```

## 模块说明
1. **用户模块**：用户登录、个人信息管理
2. **拍照识别模块**：调用相机拍照或从相册选择图片，识别食物
3. **卡路里计算模块**：基于识别结果计算食物的卡路里含量
4. **饮食记录模块**：保存用户的饮食记录，包括食物名称、卡路里、日期时间等
5. **数据统计模块**：统计用户的饮食习惯、卡路里摄入情况等

## API接口说明

### 用户相关接口
- `POST /api/user/login`：微信登录
- `GET /api/user/profile`：获取用户信息
- `PUT /api/user/profile`：更新用户信息
- `GET /api/user/statistics`：获取用户统计数据

### 食物识别相关接口
- `POST /api/recognition/upload`：上传图片进行识别
- `GET /api/recognition/{id}`：获取识别结果
- `GET /api/recognition/history`：获取历史识别记录

### 食物数据相关接口
- `GET /api/food/categories`：获取食物分类
- `GET /api/food/list`：获取食物列表
- `GET /api/food/{id}`：获取食物详情
- `POST /api/food/custom`：创建自定义食物
- `PUT /api/food/custom/{id}`：更新自定义食物

### 饮食记录相关接口
- `POST /api/meal`：创建饮食记录
- `GET /api/meal/{id}`：获取饮食记录详情
- `GET /api/meal/list`：获取饮食记录列表
- `DELETE /api/meal/{id}`：删除饮食记录
- `GET /api/meal/daily/{date}`：获取指定日期的饮食记录
- `GET /api/meal/monthly/{year}/{month}`：获取指定月份的饮食统计

### 数据统计相关接口
- `GET /api/statistics/calories/daily`：获取每日卡路里统计
- `GET /api/statistics/calories/weekly`：获取周卡路里统计
- `GET /api/statistics/calories/monthly`：获取月卡路里统计
- `GET /api/statistics/nutrition`：获取营养素摄入统计

## 部署说明

### 本地开发环境
1. 克隆项目到本地
2. 创建MySQL数据库，执行`src/main/resources/db/init.sql`初始化数据库
3. 修改`application-dev.yml`中的数据库连接信息
4. 启动本地Redis服务
5. 运行`CalorieApplication.java`启动应用

### 生产环境部署
1. 执行`mvn clean package`打包应用
2. 将生成的jar包上传到服务器
3. 创建MySQL数据库，执行初始化脚本
4. 修改`application-prod.yml`中的配置信息
5. 执行`java -jar calorie-tracker.jar --spring.profiles.active=prod`启动应用 