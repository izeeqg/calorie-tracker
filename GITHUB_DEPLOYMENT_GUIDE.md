# GitHub部署完整指南

> 本指南将一步一步教你如何将"食刻卡路里"小程序项目上传到GitHub

## 📋 目录

1. [准备工作](#准备工作)
2. [创建GitHub仓库](#创建github仓库)
3. [准备项目文件](#准备项目文件)
4. [初始化Git仓库](#初始化git仓库)
5. [上传代码到GitHub](#上传代码到github)
6. [后续维护](#后续维护)
7. [常见问题解决](#常见问题解决)

## 🛠️ 准备工作

### 1. 注册GitHub账号

如果你还没有GitHub账号：
1. 访问 [GitHub官网](https://github.com)
2. 点击右上角的 "Sign up"
3. 填写用户名、邮箱和密码
4. 验证邮箱完成注册

### 2. 安装Git

#### macOS系统：
```bash
# 使用Homebrew安装（推荐）
brew install git

# 或者从官网下载安装包
# https://git-scm.com/download/mac
```

#### Windows系统：
1. 访问 [Git官网](https://git-scm.com/download/win)
2. 下载Windows版本的Git
3. 按照安装向导完成安装

#### 验证安装：
```bash
git --version
```

### 3. 配置Git用户信息

```bash
# 设置用户名（替换为你的GitHub用户名）
git config --global user.name "你的GitHub用户名"

# 设置邮箱（替换为你的GitHub邮箱）
git config --global user.email "你的邮箱@example.com"

# 验证配置
git config --global --list
```

## 🆕 创建GitHub仓库

### 1. 登录GitHub并创建新仓库

1. 登录你的GitHub账号
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `calorie-tracker`（推荐名称）
   - **Description**: `食刻卡路里 - 基于AI图像识别的微信小程序`
   - **Visibility**: 选择 Public（公开）或 Private（私有）
   - **Initialize this repository with**:
     - ✅ 勾选 "Add a README file"
     - ✅ 勾选 "Add .gitignore"，选择 "Java" 模板
     - ✅ 勾选 "Choose a license"，推荐选择 "MIT License"

4. 点击 "Create repository"

### 2. 获取仓库地址

创建完成后，你会看到仓库页面，复制仓库的HTTPS地址：
```
https://github.com/你的用户名/calorie-tracker.git
```

## 📁 准备项目文件

### 1. 清理不需要的文件

在上传之前，我们需要清理一些不必要的文件：

```bash
# 进入项目根目录
cd /Users/lijiahong/WeChatProjects

# 删除编译产物和临时文件
rm -rf houduan/houduan/target/
rm -rf houduan/houduan/.idea/
rm -rf miniprogram-1/.tea/
```

### 2. 创建配置文件模板

为了保护敏感信息，我们需要创建配置文件模板：

#### 步骤2.1：备份并创建后端配置模板

```bash
# 进入项目根目录
cd /Users/lijiahong/WeChatProjects

# 查看后端配置文件是否存在
ls -la houduan/houduan/src/main/resources/

# 备份原始配置文件（如果存在）
if [ -f "houduan/houduan/src/main/resources/application.yml" ]; then
    cp houduan/houduan/src/main/resources/application.yml houduan/houduan/src/main/resources/application.yml.backup
    echo "✅ 已备份 application.yml"
fi

if [ -f "houduan/houduan/src/main/resources/application-dev.yml" ]; then
    cp houduan/houduan/src/main/resources/application-dev.yml houduan/houduan/src/main/resources/application-dev.yml.backup
    echo "✅ 已备份 application-dev.yml"
fi

if [ -f "houduan/houduan/src/main/resources/application-prod.yml" ]; then
    cp houduan/houduan/src/main/resources/application-prod.yml houduan/houduan/src/main/resources/application-prod.yml.backup
    echo "✅ 已备份 application-prod.yml"
fi
```

#### 步骤2.2：创建application.yml模板

```bash
# 创建主配置文件模板
cat > houduan/houduan/src/main/resources/application.yml.template << 'EOF'
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: calorie-tracker
  profiles:
    active: dev  # 默认使用开发环境
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/your_database_name?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      idle-timeout: 30000
      connection-timeout: 30000
  redis:
    host: localhost
    port: 6379
    database: 0
    password: your_redis_password
    timeout: 10000
    lettuce:
      pool:
        max-active: 8
        max-wait: -1
        max-idle: 8
        min-idle: 0
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB

# 文件上传配置
file:
  upload:
    path: ./uploads
  access:
    path: /files
    
# MinIO对象存储配置
minio:
  endpoint: http://localhost:9000
  access-key: your_minio_access_key
  secret-key: your_minio_secret_key
  bucket-name: calorie-images
  domain: http://localhost:9000

mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  typeAliasesPackage: com.calorie.entity
  global-config:
    db-config:
      id-type: auto
      logic-delete-value: 1
      logic-not-delete-value: 0
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: false
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 微信小程序配置
wx:
  miniapp:
    appid: your_wechat_appid
    secret: your_wechat_secret
    token: 
    aesKey: 
    msgDataFormat: JSON

# 图像识别API配置
image:
  recognition:
    provider: baidu
    baidu:
      app-id: your_baidu_app_id
      api-key: your_baidu_api_key
      secret-key: your_baidu_secret_key

# JWT配置
jwt:
  secret: your_jwt_secret_key_at_least_32_characters
  expire: 604800 # 7天，单位秒
  header: Authorization
EOF

echo "✅ 已创建 application.yml.template"
```

#### 步骤2.3：创建开发环境配置模板

```bash
cat > houduan/houduan/src/main/resources/application-dev.yml.template << 'EOF'
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/calorie_tracker_dev?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: your_dev_username
    password: your_dev_password
  redis:
    host: localhost
    port: 6379
    password: your_dev_redis_password

# MinIO开发环境配置
minio:
  endpoint: http://localhost:9000
  access-key: your_dev_minio_access_key
  secret-key: your_dev_minio_secret_key
  bucket-name: calorie-images-dev
  domain: http://localhost:9000

# 开发环境日志配置
logging:
  level:
    com.calorie: debug
    org.springframework.web: debug
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

# 微信小程序开发环境配置
wx:
  miniapp:
    appid: your_dev_wechat_appid
    secret: your_dev_wechat_secret

# 百度AI开发环境配置
image:
  recognition:
    baidu:
      app-id: your_dev_baidu_app_id
      api-key: your_dev_baidu_api_key
      secret-key: your_dev_baidu_secret_key
EOF

echo "✅ 已创建 application-dev.yml.template"
```

#### 步骤2.4：创建生产环境配置模板

```bash
cat > houduan/houduan/src/main/resources/application-prod.yml.template << 'EOF'
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://your_prod_host:3306/calorie_tracker?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: your_prod_username
    password: your_prod_password
    hikari:
      minimum-idle: 10
      maximum-pool-size: 50
  redis:
    host: your_prod_redis_host
    port: 6379
    password: your_prod_redis_password

# MinIO生产环境配置
minio:
  endpoint: https://your_domain.com
  access-key: your_prod_minio_access_key
  secret-key: your_prod_minio_secret_key
  bucket-name: calorie-images
  domain: https://your_domain.com/files

# 生产环境日志配置
logging:
  level:
    root: warn
    com.calorie: info
  file:
    path: /var/log/calorie-tracker
    max-size: 100MB
    max-history: 30

# 微信小程序生产环境配置
wx:
  miniapp:
    appid: your_prod_wechat_appid
    secret: your_prod_wechat_secret

# 百度AI生产环境配置
image:
  recognition:
    baidu:
      app-id: your_prod_baidu_app_id
      api-key: your_prod_baidu_api_key
      secret-key: your_prod_baidu_secret_key

# JWT生产环境配置
jwt:
  secret: your_production_jwt_secret_key_must_be_very_secure_and_at_least_32_characters
  expire: 604800
EOF

echo "✅ 已创建 application-prod.yml.template"
```

#### 步骤2.5：创建小程序配置模板

```bash
# 备份原始小程序配置文件
if [ -f "miniprogram-1/project.config.json" ]; then
    cp miniprogram-1/project.config.json miniprogram-1/project.config.json.backup
    echo "✅ 已备份 project.config.json"
fi

if [ -f "miniprogram-1/project.private.config.json" ]; then
    cp miniprogram-1/project.private.config.json miniprogram-1/project.private.config.json.backup
    echo "✅ 已备份 project.private.config.json"
fi

# 创建小程序项目配置模板
cat > miniprogram-1/project.config.json.template << 'EOF'
{
  "description": "项目配置文件",
  "packOptions": {
    "ignore": [
      {
        "type": "file",
        "value": ".eslintrc.js"
      }
    ]
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "your_wechat_appid_here",
  "projectname": "calorie-tracker",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
EOF

echo "✅ 已创建 project.config.json.template"
```

#### 步骤2.6：创建小程序私有配置模板

```bash
cat > miniprogram-1/project.private.config.json.template << 'EOF'
{
  "setting": {},
  "condition": {
    "plugin": {
      "list": []
    },
    "game": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  },
  "description": "项目私有配置文件。此文件中的内容将覆盖 project.config.json 中的相同字段。项目的改动优先同步到此文件中。详见文档：https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html",
  "projectname": "calorie-tracker",
  "appid": "your_wechat_appid_here"
}
EOF

echo "✅ 已创建 project.private.config.json.template"
```

#### 步骤2.7：创建API配置模板

```bash
# 备份原始API配置文件
if [ -f "miniprogram-1/utils/constants.js" ]; then
    cp miniprogram-1/utils/constants.js miniprogram-1/utils/constants.js.backup
    echo "✅ 已备份 constants.js"
fi

# 创建API配置模板
cat > miniprogram-1/utils/constants.js.template << 'EOF'
/**
 * 应用常量定义模板
 * 使用时请复制为 constants.js 并修改相应配置
 */

/**
 * 餐食类型枚举
 * @enum {number}
 */
const MEAL_TYPE = {
  /** 早餐 */
  BREAKFAST: 1,
  /** 午餐 */
  LUNCH: 2,
  /** 晚餐 */
  DINNER: 3,
  /** 宵夜 */
  MIDNIGHT_SNACK: 4,
  /** 零食 */
  SNACK: 5
};

/**
 * 餐食类型映射表
 * @type {Object}
 */
const MEAL_TYPE_TEXT = {
  1: '早餐',
  2: '午餐',
  3: '晚餐',
  4: '宵夜',
  5: '零食'
};

/**
 * 存储键名
 * @enum {string}
 */
const STORAGE_KEY = {
  /** 用户信息 */
  USER_INFO: 'user_info',
  /** 食物记录 */
  FOOD_RECORDS: 'food_records',
  /** 设置信息 */
  SETTINGS: 'settings',
  /** 用户令牌 */
  TOKEN: 'user_token',
  /** 游客模式标记 */
  GUEST_MODE: 'guest_mode'
};

/**
 * 默认目标卡路里值
 * @type {number}
 */
const DEFAULT_TARGET_CALORIES = 2000;

/**
 * 默认食物图片
 * @type {string}
 */
const DEFAULT_FOOD_IMAGE = '/images/food-default.png';

/**
 * 默认头像
 * @type {string}
 */
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

/**
 * 营养素类型
 * @enum {string}
 */
const NUTRIENT_TYPE = {
  /** 蛋白质 */
  PROTEIN: 'protein',
  /** 脂肪 */
  FAT: 'fat',
  /** 碳水化合物 */
  CARBS: 'carbs'
};

/**
 * 应用版本
 * @type {string}
 */
const APP_VERSION = '1.0.0';

/**
 * API基础URL - 请根据部署环境修改
 * @type {string}
 */
// 开发环境配置
const API_BASE_URL = 'http://localhost:8080/api';

// 生产环境配置 - 请替换为你的实际域名
// const API_BASE_URL = 'https://your_domain.com/api';

/**
 * MinIO基础URL - 请根据部署环境修改
 * @type {string}
 */
// 开发环境配置
const MINIO_BASE_URL = 'http://localhost:9000';

// 生产环境配置 - 请替换为你的实际域名
// const MINIO_BASE_URL = 'https://your_domain.com/files';

/**
 * 错误提示信息
 * @type {Object}
 */
const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络状态',
  AUTH_FAILED: '认证失败，请重新登录',
  UPLOAD_FAILED: '上传失败，请重试',
  RECOGNITION_FAILED: '识别失败，请重新拍照'
};

module.exports = {
  MEAL_TYPE,
  MEAL_TYPE_TEXT,
  STORAGE_KEY,
  DEFAULT_TARGET_CALORIES,
  DEFAULT_FOOD_IMAGE,
  DEFAULT_AVATAR,
  NUTRIENT_TYPE,
  APP_VERSION,
  API_BASE_URL,
  MINIO_BASE_URL,
  ERROR_MESSAGES
};
EOF

echo "✅ 已创建 constants.js.template"
```

### 3. 创建部署文档

#### 步骤3.1：创建详细的部署说明文档

```bash
cat > DEPLOYMENT.md << 'EOF'
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
EOF

echo "✅ 已创建详细的部署说明文档"
```

#### 步骤3.2：创建环境变量配置示例

```bash
cat > .env.example << 'EOF'
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=calorie_tracker
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# MinIO配置
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_BUCKET_NAME=calorie-images

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 百度AI配置
BAIDU_APP_ID=your_baidu_app_id
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key

# JWT配置
JWT_SECRET=your_jwt_secret_key_at_least_32_characters

# 应用配置
APP_ENV=development
API_BASE_URL=http://localhost:8080/api
MINIO_BASE_URL=http://localhost:9000
EOF

echo "✅ 已创建环境变量配置示例"
```

#### 步骤3.3：验证配置文件创建

```bash
# 检查所有模板文件是否创建成功
echo "📋 检查配置文件模板创建状态："

files_to_check=(
    "houduan/houduan/src/main/resources/application.yml.template"
    "houduan/houduan/src/main/resources/application-dev.yml.template"
    "houduan/houduan/src/main/resources/application-prod.yml.template"
    "miniprogram-1/project.config.json.template"
    "miniprogram-1/project.private.config.json.template"
    "miniprogram-1/utils/constants.js.template"
    "DEPLOYMENT.md"
    ".env.example"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 创建失败"
    fi
done

echo ""
echo "🎉 配置文件模板创建完成！"
echo ""
echo "📝 接下来的步骤："
echo "1. 将这些模板文件复制为实际配置文件"
echo "2. 修改配置文件中的占位符为实际值"
echo "3. 添加配置文件到 .gitignore 以保护敏感信息"
```

### 生产部署
详见主README.md文档
```

## 🚀 初始化Git仓库

### 1. 在项目根目录初始化Git

```bash
# 进入项目根目录
cd /Users/lijiahong/WeChatProjects

# 初始化Git仓库
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/calorie-tracker.git
```

### 2. 添加文件到Git

```bash
# 查看文件状态
git status

# 添加所有文件到暂存区
git add .

# 查看将要提交的文件
git status
```

### 3. 提交代码

```bash
# 提交代码到本地仓库
git commit -m "🎉 初始提交：食刻卡路里小程序项目

- ✨ 添加微信小程序前端代码
- ✨ 添加Spring Boot后端代码  
- 📝 添加项目文档和部署指南
- 🔧 配置Git忽略文件
- 🚀 准备上传到GitHub"
```

## ⬆️ 上传代码到GitHub

### 1. 推送到GitHub

```bash
# 推送到GitHub主分支
git push -u origin main

# 如果遇到分支名称问题，可能需要：
git branch -M main
git push -u origin main
```

### 2. 验证上传成功

1. 打开你的GitHub仓库页面
2. 刷新页面，确认文件已经上传
3. 检查README.md是否正确显示

## 🔄 后续维护

### 日常开发流程

```bash
# 1. 修改代码后，查看变更
git status
git diff

# 2. 添加变更到暂存区
git add .
# 或者添加特定文件
git add 文件名

# 3. 提交变更
git commit -m "描述你的变更"

# 4. 推送到GitHub
git push origin main
```

### 提交信息规范

建议使用以下格式的提交信息：

```bash
# 新功能
git commit -m "✨ 添加用户登录功能"

# 修复Bug
git commit -m "🐛 修复卡路里计算错误"

# 更新文档
git commit -m "📝 更新API文档"

# 性能优化
git commit -m "⚡ 优化图片上传性能"

# 重构代码
git commit -m "♻️ 重构用户服务层代码"

# 更新依赖
git commit -m "⬆️ 更新Spring Boot版本"
```

### 创建分支进行开发

```bash
# 创建并切换到新分支
git checkout -b feature/新功能名称

# 在新分支上开发...
# 提交代码
git add .
git commit -m "✨ 实现新功能"

# 推送分支到GitHub
git push origin feature/新功能名称

# 在GitHub上创建Pull Request合并到主分支
```

## ❗ 常见问题解决

### 1. 推送时要求输入用户名密码

**问题**：`git push` 时提示输入用户名和密码

**解决方案**：
```bash
# 方案1：使用Personal Access Token
# 1. 在GitHub设置中创建Personal Access Token
# 2. 使用Token作为密码

# 方案2：配置SSH密钥（推荐）
# 1. 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "你的邮箱@example.com"

# 2. 添加SSH密钥到GitHub账号
cat ~/.ssh/id_rsa.pub
# 复制输出内容，在GitHub设置中添加SSH密钥

# 3. 修改远程仓库地址为SSH格式
git remote set-url origin git@github.com:你的用户名/calorie-tracker.git
```

### 2. 文件太大无法上传

**问题**：某些文件超过GitHub的100MB限制

**解决方案**：
```bash
# 1. 查看大文件
find . -size +50M -type f

# 2. 删除大文件或添加到.gitignore
echo "大文件路径" >> .gitignore

# 3. 如果已经提交了大文件，需要从历史中删除
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch 大文件路径' --prune-empty --tag-name-filter cat -- --all
```

### 3. 合并冲突

**问题**：多人协作时出现合并冲突

**解决方案**：
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 如果有冲突，手动解决冲突文件
# 编辑冲突文件，删除冲突标记<<<<<<< ======= >>>>>>>

# 3. 添加解决后的文件
git add 冲突文件名

# 4. 提交合并
git commit -m "🔀 解决合并冲突"

# 5. 推送
git push origin main
```

### 4. 撤销错误的提交

**问题**：提交了错误的代码需要撤销

**解决方案**：
```bash
# 撤销最后一次提交（保留文件修改）
git reset --soft HEAD~1

# 撤销最后一次提交（不保留文件修改）
git reset --hard HEAD~1

# 如果已经推送到远程，需要强制推送（谨慎使用）
git push --force origin main
```

## 🎯 最佳实践建议

### 1. 代码组织
- 保持清晰的目录结构
- 使用有意义的文件和变量命名
- 添加必要的代码注释

### 2. 提交规范
- 频繁提交，每个功能点一次提交
- 写清楚的提交信息
- 提交前测试代码

### 3. 分支管理
- `main` 分支保持稳定
- 新功能在 `feature/` 分支开发
- 修复Bug在 `hotfix/` 分支进行

### 4. 文档维护
- 及时更新README.md
- 记录重要的配置变更
- 提供清晰的部署说明

### 5. 安全考虑
- 不要提交敏感信息（密码、密钥等）
- 使用配置文件模板
- 定期更新依赖包

---

## 📞 需要帮助？

如果在部署过程中遇到问题：

1. **查看GitHub文档**：[GitHub官方文档](https://docs.github.com/)
2. **查看Git文档**：[Git官方文档](https://git-scm.com/doc)
3. **搜索相关问题**：在GitHub Issues或Stack Overflow搜索
4. **联系项目维护者**：在项目仓库中创建Issue

祝你部署顺利！🎉 