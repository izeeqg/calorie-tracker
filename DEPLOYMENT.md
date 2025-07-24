# 📚 食刻卡路里项目部署指南

## 🎯 部署前准备

### 环境要求
- **JDK**: 11或以上版本
- **Maven**: 3.6+
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **MinIO**: 最新版本
- **微信开发者工具**: 最新版本

### 获取必要的配置信息
在开始部署前，请准备以下信息：

1. **数据库配置**
   - MySQL数据库地址、用户名、密码
   - Redis服务器地址、密码

2. **微信小程序配置**
   - AppID和AppSecret（从微信公众平台获取）

3. **百度AI配置**
   - App ID、API Key、Secret Key（从百度AI开放平台获取）

4. **MinIO配置**
   - 服务器地址、Access Key、Secret Key

## 🔧 环境配置

### 后端环境配置

#### 步骤1：复制配置文件
```bash
# 进入后端项目目录
cd houduan/houduan/src/main/resources/

# 复制主配置文件
cp application.yml.template application.yml

# 复制开发环境配置文件
cp application-dev.yml.template application-dev.yml

# 复制生产环境配置文件
cp application-prod.yml.template application-prod.yml
```

#### 步骤2：修改开发环境配置
编辑 `application-dev.yml` 文件：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/calorie_tracker_dev?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: 你的MySQL用户名
    password: 你的MySQL密码
  redis:
    host: localhost
    port: 6379
    password: 你的Redis密码（如果有）

minio:
  endpoint: http://localhost:9000
  access-key: 你的MinIO Access Key
  secret-key: 你的MinIO Secret Key
  bucket-name: calorie-images-dev
  domain: http://localhost:9000

wx:
  miniapp:
    appid: 你的微信小程序AppID
    secret: 你的微信小程序AppSecret

image:
  recognition:
    baidu:
      app-id: 你的百度AI App ID
      api-key: 你的百度AI API Key
      secret-key: 你的百度AI Secret Key
```

#### 步骤3：修改生产环境配置
编辑 `application-prod.yml` 文件：

```yaml
spring:
  datasource:
    url: jdbc:mysql://你的生产数据库地址:3306/calorie_tracker?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: 你的生产MySQL用户名
    password: 你的生产MySQL密码
  redis:
    host: 你的生产Redis地址
    port: 6379
    password: 你的生产Redis密码

minio:
  endpoint: https://你的域名.com
  access-key: 你的生产MinIO Access Key
  secret-key: 你的生产MinIO Secret Key
  bucket-name: calorie-images
  domain: https://你的域名.com/files

wx:
  miniapp:
    appid: 你的微信小程序AppID
    secret: 你的微信小程序AppSecret

image:
  recognition:
    baidu:
      app-id: 你的百度AI App ID
      api-key: 你的百度AI API Key
      secret-key: 你的百度AI Secret Key

jwt:
  secret: 请设置一个至少32位的安全密钥
```

### 前端环境配置

#### 步骤1：复制配置文件
```bash
# 进入小程序项目目录
cd miniprogram-1/

# 复制项目配置文件
cp project.config.json.template project.config.json
cp project.private.config.json.template project.private.config.json

# 复制API配置文件
cp utils/constants.js.template utils/constants.js
```

#### 步骤2：修改项目配置
编辑 `project.config.json` 文件：
```json
{
  "appid": "你的微信小程序AppID",
  "projectname": "calorie-tracker"
}
```

编辑 `project.private.config.json` 文件：
```json
{
  "appid": "你的微信小程序AppID",
  "projectname": "calorie-tracker"
}
```

#### 步骤3：修改API配置
编辑 `utils/constants.js` 文件：

**开发环境配置：**
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
const MINIO_BASE_URL = 'http://localhost:9000';
```

**生产环境配置：**
```javascript
const API_BASE_URL = 'https://你的域名.com/api';
const MINIO_BASE_URL = 'https://你的域名.com/files';
```

## 🚀 本地开发部署

### 后端启动

#### 方式1：使用Maven命令
```bash
# 进入后端项目目录
cd houduan/houduan

# 编译项目
mvn clean compile

# 运行项目（开发环境）
mvn spring-boot:run

# 或者指定环境
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### 方式2：使用IDE运行
1. 用IntelliJ IDEA或Eclipse打开后端项目
2. 找到 `CalorieApplication.java` 主类
3. 右键选择"Run"或"Debug"

### 前端启动

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram-1` 目录
4. 填写项目信息：
   - AppID：你的微信小程序AppID
   - 项目名称：食刻卡路里
5. 点击"导入"

### 验证部署

1. **后端验证**：
   - 访问 http://localhost:8080/api/health
   - 应该返回健康状态信息

2. **前端验证**：
   - 在微信开发者工具中预览小程序
   - 测试登录功能
   - 测试拍照识别功能

## 🐳 生产环境部署

### 使用Docker部署
```bash
# 构建后端镜像
cd houduan/houduan
docker build -t calorie-tracker-backend .

# 运行Docker容器
docker run -d \
  --name calorie-tracker \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  calorie-tracker-backend
```

### 使用JAR包部署
```bash
# 打包项目
cd houduan/houduan
mvn clean package -DskipTests

# 运行JAR包
java -jar target/calorie-tracker-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 🔍 常见问题解决

### 1. 数据库连接失败
**错误信息**：`Cannot connect to database`

**解决方案**：
- 检查数据库服务是否启动
- 验证数据库连接信息是否正确
- 确认数据库已创建

### 2. Redis连接失败
**错误信息**：`Cannot connect to Redis`

**解决方案**：
- 检查Redis服务是否启动
- 验证Redis连接信息是否正确
- 检查Redis密码配置

### 3. 微信登录失败
**错误信息**：`WeChat login failed`

**解决方案**：
- 检查微信小程序AppID和AppSecret是否正确
- 确认服务器域名已在微信后台配置
- 检查网络连接是否正常

### 4. 百度AI识别失败
**错误信息**：`Image recognition failed`

**解决方案**：
- 检查百度AI配置信息是否正确
- 确认百度AI账户余额充足
- 检查上传的图片格式和大小

## 📱 微信小程序发布

### 1. 配置服务器域名
在微信公众平台小程序后台：
1. 进入"开发" -> "开发管理" -> "开发设置"
2. 配置服务器域名：
   - request合法域名：`https://你的域名.com`
   - uploadFile合法域名：`https://你的域名.com`
   - downloadFile合法域名：`https://你的域名.com`

### 2. 上传代码
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 上传完成后在微信公众平台提交审核

### 3. 发布小程序
1. 等待微信审核通过
2. 在微信公众平台点击"发布"
3. 小程序正式上线

## 📞 获取帮助

如果在部署过程中遇到问题：
1. 查看项目README.md文档
2. 检查日志文件排查错误
3. 在GitHub Issues中提交问题
4. 联系项目维护者
