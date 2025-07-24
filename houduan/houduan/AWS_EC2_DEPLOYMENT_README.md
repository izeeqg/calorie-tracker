# 食刻卡路里 - AWS EC2 部署指南 (Ubuntu系统)

## 📋 项目简介

食刻卡路里是一款基于AI识别的智能卡路里记录小程序，帮助用户轻松记录和管理日常饮食摄入。

### 🏗️ 技术栈

**后端技术栈：**
- Spring Boot 3.x
- MySQL 8.0
- MinIO 对象存储
- JWT 身份认证
- Docker

**前端技术栈：**
- 微信小程序
- 自定义组件
- 响应式设计

### ✨ 主要功能

- 🤖 AI智能识别菜品和卡路里
- 📱 微信小程序一键登录
- 📊 健康数据统计和可视化
- 🎯 个性化卡路里目标设置
- 📷 拍照识别食物功能
- 📈 历史记录查看和管理
- 🎨 粉色主题UI设计

## 🚀 快速开始

### 前置要求

- AWS 账户
- 域名（推荐）
- 微信小程序开发者账号
- 本地开发环境（Java 17+, Maven）

### 本地构建

```bash
# 克隆项目
git clone <your-repository-url>
cd houduan/houduan

# 构建项目
./mvnw clean package -DskipTests

# 验证构建产物
ls -la target/*.jar
```

## 🏭 AWS EC2 部署

### 第一步：创建EC2实例

#### 1.1 实例配置
- **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
- **实例类型**: 
  - 开发环境：t3.small (2 vCPU, 2 GB RAM)
  - 生产环境：t3.medium+ (2 vCPU, 4+ GB RAM)
- **存储**: 20 GB gp3 SSD (最少)
- **密钥对**: 创建新密钥对并下载 .pem 文件

#### 1.2 安全组配置
```
入站规则：
┌─────────┬─────┬──────┬─────────────┬──────────────────────┐
│ 类型     │ 协议 │ 端口 │ 源          │ 说明                 │
├─────────┼─────┼──────┼─────────────┼──────────────────────┤
│ SSH     │ TCP │ 22   │ 您的IP/32   │ SSH访问              │
│ HTTP    │ TCP │ 80   │ 0.0.0.0/0   │ HTTP访问             │
│ HTTPS   │ TCP │ 443  │ 0.0.0.0/0   │ HTTPS访问            │
│ Custom  │ TCP │ 8080 │ 0.0.0.0/0   │ Spring Boot应用      │
│ Custom  │ TCP │ 9000 │ 0.0.0.0/0   │ MinIO API            │
│ Custom  │ TCP │ 9090 │ 0.0.0.0/0   │ MinIO Console        │
└─────────┴─────┴──────┴─────────────┴──────────────────────┘
```

### 第二步：连接并配置服务器

```bash
# 设置密钥权限
chmod 400 your-key.pem

# 连接到EC2实例 (Ubuntu使用ubuntu用户)
ssh -i "your-key.pem" ubuntu@<your-ec2-public-ip>
```

#### 2.1 系统更新和基础工具
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y wget curl unzip git htop nano vim software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

#### 2.2 安装Java 17
```bash
# 安装OpenJDK 17
sudo apt install -y openjdk-17-jdk

# 设置环境变量
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 验证安装
java -version
javac -version
```

#### 2.3 安装MySQL 8.0
```bash
# 下载MySQL APT仓库配置包
wget https://dev.mysql.com/get/mysql-apt-config_0.8.24-1_all.deb

# 安装MySQL APT仓库
sudo dpkg -i mysql-apt-config_0.8.24-1_all.deb

# 更新包列表
sudo apt update

# 安装MySQL服务器
sudo apt install -y mysql-server

# 启动并启用MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 运行安全配置脚本
sudo mysql_secure_installation

# 检查MySQL状态
sudo systemctl status mysql
```

#### 2.4 配置数据库
```sql
-- 连接MySQL (Ubuntu下MySQL 8.0默认使用unix_socket认证)
sudo mysql

-- 创建数据库和用户
CREATE DATABASE calorie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'calorie_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON calorie_db.* TO 'calorie_user'@'localhost';
FLUSH PRIVILEGES;

-- 如果需要使用密码登录root用户
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourRootPassword123!';
FLUSH PRIVILEGES;
EXIT;
```

#### 2.5 安装Docker
```bash
# 卸载旧版本Docker（如果存在）
sudo apt remove -y docker docker-engine docker.io containerd runc

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加Docker APT仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新包索引
sudo apt update

# 安装Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到docker组
sudo usermod -aG docker ubuntu
newgrp docker

# 验证Docker安装
docker --version
sudo docker run hello-world
```

#### 2.6 安装Nginx
```bash
# 安装Nginx
sudo apt install -y nginx

# 启动并启用Nginx服务
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx

# 测试Nginx配置
sudo nginx -t
```

### 第三步：应用部署

#### 3.1 创建应用目录
```bash
# 创建目录结构
sudo mkdir -p /opt/calorie-app
sudo mkdir -p /var/log/calorie-app
sudo mkdir -p /opt/backups

# 设置权限 (Ubuntu用户)
sudo chown ubuntu:ubuntu /opt/calorie-app
sudo chown ubuntu:ubuntu /var/log/calorie-app
sudo chown ubuntu:ubuntu /opt/backups
```

#### 3.2 上传应用文件
```bash
# 在本地机器上执行
# 上传JAR文件 (注意Ubuntu使用ubuntu用户)
scp -i "your-key.pem" target/calorie-*.jar ubuntu@<your-ec2-ip>:/opt/calorie-app/

# 上传配置文件
scp -i "your-key.pem" src/main/resources/application.yml ubuntu@<your-ec2-ip>:/opt/calorie-app/

# 上传脚本文件
scp -i "your-key.pem" *.sh ubuntu@<your-ec2-ip>:/opt/calorie-app/
```

#### 3.3 创建生产环境配置
```bash
cd /opt/calorie-app
nano application-prod.yml
```

```yaml
# application-prod.yml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: prod
  
  datasource:
    url: jdbc:mysql://localhost:3306/calorie_db?useSSL=true&serverTimezone=Asia/Shanghai&characterEncoding=utf8
    username: calorie_user
    password: StrongPassword123!
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: false

  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

# MinIO配置
minio:
  endpoint: http://localhost:9000
  access-key: calorie-minio-admin
  secret-key: CalorieMinIO2024!StrongKey
  bucket-name: calorie-images
  domain: https://minio.yourdomain.com  # 替换为实际域名

# 微信小程序配置
wechat:
  appid: your-wechat-appid
  secret: your-wechat-secret

# 日志配置
logging:
  level:
    com.calorie: INFO
    org.springframework.web: WARN
  file:
    name: /var/log/calorie-app/application.log
    max-size: 100MB
    max-history: 30
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

#### 3.4 创建系统服务
```bash
sudo nano /etc/systemd/system/calorie-app.service
```

```ini
[Unit]
Description=Calorie Application
Documentation=https://github.com/your-repo
After=network.target mysql.service docker.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/calorie-app

# JVM优化参数
ExecStart=/usr/bin/java \
    -Xms1g \
    -Xmx2g \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseJVMCICompiler \
    -Dspring.profiles.active=prod \
    -jar /opt/calorie-app/calorie-*.jar

Restart=always
RestartSec=10
KillSignal=SIGTERM
TimeoutStopSec=30

# 日志配置
StandardOutput=journal
StandardError=journal
SyslogIdentifier=calorie-app

# 环境变量
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=LANG=zh_CN.UTF-8

[Install]
WantedBy=multi-user.target
```

```bash
# 重新加载服务
sudo systemctl daemon-reload
sudo systemctl enable calorie-app
```

### 第四步：MinIO配置

#### 4.1 启动MinIO服务
```bash
# 创建数据目录
sudo mkdir -p /opt/minio-data
sudo chown ubuntu:ubuntu /opt/minio-data

# 启动MinIO容器
docker run -d \
  --name minio \
  --restart unless-stopped \
  -p 9000:9000 \
  -p 9090:9090 \
  -e "MINIO_ROOT_USER=calorie-minio-admin" \
  -e "MINIO_ROOT_PASSWORD=CalorieMinIO2024!StrongKey" \
  -v /opt/minio-data:/data \
  minio/minio server /data --console-address ":9090"
```

#### 4.2 配置MinIO桶
```bash
# 安装MinIO客户端
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# 配置客户端别名
mc alias set local http://localhost:9000 calorie-minio-admin CalorieMinIO2024!StrongKey

# 创建桶并设置策略
mc mb local/calorie-images
mc anonymous set public local/calorie-images

# 验证配置
mc ls local/
```

### 第五步：Nginx和SSL配置

#### 5.1 配置Nginx
```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 上游服务器配置
    upstream calorie_app {
        server 127.0.0.1:8080;
    }

    upstream minio_api {
        server 127.0.0.1:9000;
    }

    upstream minio_console {
        server 127.0.0.1:9090;
    }

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com minio.yourdomain.com console.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # 主应用服务器
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL配置会由Certbot自动添加

        # API代理
        location /api/ {
            proxy_pass http://calorie_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # 默认页面
        location / {
            return 200 "Calorie API Server is running";
            add_header Content-Type text/plain;
        }
    }

    # MinIO API服务器
    server {
        listen 443 ssl http2;
        server_name minio.yourdomain.com;

        location / {
            proxy_pass http://minio_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # MinIO控制台
    server {
        listen 443 ssl http2;
        server_name console.yourdomain.com;

        location / {
            proxy_pass http://minio_console;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### 5.2 安装SSL证书
```bash
# 安装Certbot (Ubuntu)
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d minio.yourdomain.com -d console.yourdomain.com

# 设置自动续期
echo "0 2 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# 测试自动续期
sudo certbot renew --dry-run
```

### 第六步：启动服务

```bash
# 启动所有服务
sudo systemctl start calorie-app
sudo systemctl restart nginx

# 检查服务状态
sudo systemctl status calorie-app
sudo systemctl status nginx
sudo systemctl status mysql
docker ps

# 查看日志
sudo journalctl -u calorie-app -f
tail -f /var/log/calorie-app/application.log
```

## 📊 监控和维护

### 监控脚本

创建监控脚本 `/opt/calorie-app/monitor.sh`：

```bash
#!/bin/bash
# 服务监控脚本

echo "=== 食刻卡路里服务监控 ===" 
echo "检查时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo

# 检查Spring Boot应用
echo "📱 Spring Boot应用状态:"
if sudo systemctl is-active calorie-app >/dev/null; then
    echo "✅ 服务运行中"
    if curl -s http://localhost:8080/api/health >/dev/null; then
        echo "✅ 健康检查通过"
    else
        echo "❌ 健康检查失败"
    fi
else
    echo "❌ 服务已停止"
fi
echo

# 检查MySQL
echo "🗄️ MySQL状态:"
if sudo systemctl is-active mysql >/dev/null; then
    echo "✅ MySQL运行中"
else
    echo "❌ MySQL已停止"
fi
echo

# 检查MinIO
echo "📦 MinIO状态:"
if docker ps --filter name=minio --filter status=running -q | grep -q .; then
    echo "✅ MinIO容器运行中"
    if curl -s http://localhost:9000/minio/health/live >/dev/null; then
        echo "✅ MinIO健康检查通过"
    else
        echo "❌ MinIO健康检查失败"
    fi
else
    echo "❌ MinIO容器未运行"
fi
echo

# 检查Nginx
echo "🌐 Nginx状态:"
if sudo systemctl is-active nginx >/dev/null; then
    echo "✅ Nginx运行中"
else
    echo "❌ Nginx已停止"
fi
echo

# 系统资源检查
echo "💻 系统资源:"
echo "磁盘使用: $(df -h / | awk 'NR==2{print $5}')"
echo "内存使用: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "CPU负载: $(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | xargs)"
echo

# 检查端口监听
echo "🔌 端口监听状态:"
for port in 80 443 8080 9000 9090 3306; do
    if sudo ss -tlnp | grep ":$port " >/dev/null; then
        echo "✅ 端口 $port 正在监听"
    else
        echo "❌ 端口 $port 未在监听"
    fi
done
echo

echo "=== 监控完成 ==="
```

```bash
chmod +x /opt/calorie-app/monitor.sh

# 设置定时监控
crontab -e
# 添加以下行：
*/5 * * * * /opt/calorie-app/monitor.sh >> /var/log/calorie-app/monitor.log 2>&1
```

### 备份脚本

创建数据库备份脚本 `/opt/calorie-app/backup.sh`：

```bash
#!/bin/bash
# 自动备份脚本

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="calorie_db"
DB_USER="calorie_user"
DB_PASS="StrongPassword123!"

echo "开始备份 - $(date)"

# 数据库备份
echo "备份数据库..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql
if [ $? -eq 0 ]; then
    echo "✅ 数据库备份成功: db_backup_$DATE.sql"
    gzip $BACKUP_DIR/db_backup_$DATE.sql
else
    echo "❌ 数据库备份失败"
fi

# MinIO数据备份
echo "备份MinIO数据..."
mc mirror local/calorie-images $BACKUP_DIR/minio_backup_$DATE
if [ $? -eq 0 ]; then
    echo "✅ MinIO备份成功: minio_backup_$DATE"
    tar -czf $BACKUP_DIR/minio_backup_$DATE.tar.gz -C $BACKUP_DIR minio_backup_$DATE
    rm -rf $BACKUP_DIR/minio_backup_$DATE
else
    echo "❌ MinIO备份失败"
fi

# 清理7天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "minio_backup_*.tar.gz" -mtime +7 -delete

echo "备份完成 - $(date)"
```

```bash
chmod +x /opt/calorie-app/backup.sh

# 设置每日凌晨2点自动备份
crontab -e
# 添加：
0 2 * * * /opt/calorie-app/backup.sh >> /var/log/calorie-app/backup.log 2>&1
```

## 🛠️ 故障排除

### 常见问题

#### 应用无法启动
```bash
# 查看详细日志
sudo journalctl -u calorie-app -f --no-pager

# 检查配置文件
java -jar /opt/calorie-app/calorie-*.jar --spring.config.location=/opt/calorie-app/application-prod.yml --debug

# 检查端口占用
sudo ss -tlnp | grep 8080
```

#### 数据库连接失败
```bash
# 测试数据库连接
mysql -u calorie_user -p -h localhost calorie_db

# 检查数据库状态
sudo systemctl status mysql

# 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log
```

#### MinIO无法访问
```bash
# 查看容器日志
docker logs minio

# 重启MinIO容器
docker restart minio

# 检查MinIO健康状态
curl http://localhost:9000/minio/health/live
```

#### SSL证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 测试证书续期
sudo certbot renew --dry-run

# 验证Nginx配置
sudo nginx -t
```

#### 权限问题
```bash
# 检查文件所有者
ls -la /opt/calorie-app/

# 修复权限 (Ubuntu)
sudo chown -R ubuntu:ubuntu /opt/calorie-app/
sudo chown -R ubuntu:ubuntu /var/log/calorie-app/
```

## 📱 小程序配置

部署完成后，需要更新小程序配置：

### 1. 更新 constants.js
```javascript
// utils/constants.js
const API_BASE_URL = 'https://yourdomain.com/api';
const MINIO_BASE_URL = 'https://minio.yourdomain.com';
```

### 2. 微信小程序后台配置
在微信公众平台小程序后台添加以下服务器域名：

- **request合法域名**: `https://yourdomain.com`
- **uploadFile合法域名**: `https://yourdomain.com`
- **downloadFile合法域名**: `https://minio.yourdomain.com`

## 📈 性能优化

### JVM优化
```bash
# 在服务文件中添加JVM参数
ExecStart=/usr/bin/java \
    -Xms2g -Xmx4g \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseCompressedOops \
    -Dspring.profiles.active=prod \
    -jar /opt/calorie-app/calorie-*.jar
```

### MySQL优化
```sql
-- 在 /etc/mysql/mysql.conf.d/mysqld.cnf 中添加
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
bind-address = 127.0.0.1
```

### Nginx缓存
```nginx
# 在nginx配置中添加
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔐 安全建议

1. **定期更新系统**：
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **限制SSH访问**：
   - 修改安全组，只允许特定IP访问22端口
   - 使用密钥认证，禁用密码登录

3. **数据库安全**：
   - 定期更换数据库密码
   - 限制数据库用户权限

4. **防火墙配置**：
   ```bash
   # Ubuntu使用ufw防火墙
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 8080
   sudo ufw allow 9000
   sudo ufw allow 9090
   ```

## 📞 支持与维护

### 日志文件位置
- 应用日志：`/var/log/calorie-app/application.log`
- 系统日志：`sudo journalctl -u calorie-app`
- Nginx日志：`/var/log/nginx/`
- MySQL日志：`/var/log/mysql/error.log`

### 维护命令
```bash
# 重启应用
sudo systemctl restart calorie-app

# 查看实时日志
tail -f /var/log/calorie-app/application.log

# 重启所有服务
sudo systemctl restart calorie-app nginx mysql
docker restart minio
```

## 📝 部署检查清单

部署完成后，请确认以下项目：

- [ ] ✅ EC2实例运行正常 (Ubuntu 22.04)
- [ ] ✅ 安全组配置正确
- [ ] ✅ Java 17安装成功
- [ ] ✅ MySQL服务运行中
- [ ] ✅ 数据库和用户创建完成
- [ ] ✅ Spring Boot应用启动成功
- [ ] ✅ MinIO服务运行中
- [ ] ✅ MinIO桶创建并配置完成
- [ ] ✅ Nginx配置正确
- [ ] ✅ SSL证书安装成功
- [ ] ✅ 域名DNS解析正确
- [ ] ✅ 应用API接口测试通过
- [ ] ✅ 小程序配置更新完成
- [ ] ✅ 监控脚本配置完成
- [ ] ✅ 备份策略实施完成

## 🌐 访问地址

部署成功后的访问地址：

| 服务 | 地址 | 用途 |
|-----|------|------|
| 主应用API | `https://yourdomain.com/api/` | 小程序后端接口 |
| MinIO控制台 | `https://console.yourdomain.com` | 文件存储管理 |
| MinIO API | `https://minio.yourdomain.com` | 文件访问接口 |
| 健康检查 | `https://yourdomain.com/health` | 服务状态检查 |

---

## ⚠️ 重要提醒

1. **替换配置信息**：请将文档中的示例域名、密码、IP地址等替换为您的实际信息
2. **安全第一**：生产环境中请使用强密码，并定期更新
3. **监控告警**：建议配置CloudWatch或其他监控服务
4. **备份验证**：定期测试备份文件的完整性
5. **性能监控**：关注应用性能指标，及时优化

## 📧 技术支持

如遇到部署问题，请检查：
1. 日志文件中的错误信息
2. 网络连接和端口开放情况
3. 配置文件的正确性
4. 服务依赖关系

### Ubuntu系统特殊注意事项：
- 使用`ubuntu`用户而非`ec2-user`
- 使用`apt`包管理器而非`yum`
- MySQL日志位置：`/var/log/mysql/error.log`
- 使用`ss`命令查看端口而非`netstat`
- 防火墙使用`ufw`而非`iptables`

---

**🎉 恭喜！您已成功完成食刻卡路里应用的AWS EC2 Ubuntu部署！** 