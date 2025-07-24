#!/bin/bash

# 食刻卡路里小程序 - calorietracker.top 专用部署脚本
# 服务器IP: 59.110.150.196
# 域名: calorietracker.top

set -e

echo "🚀 开始部署食刻卡路里小程序到 calorietracker.top"
echo "📍 服务器IP: 59.110.150.196"
echo "🌐 域名: calorietracker.top"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root用户执行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 正在以root用户执行${NC}"

# 步骤1: 更新系统
echo -e "${YELLOW}📦 步骤1: 更新系统包...${NC}"
yum update -y

# 步骤2: 安装Docker（使用轩辕镜像源）
echo -e "${YELLOW}🐳 步骤2: 安装Docker（使用轩辕镜像）...${NC}"
if ! command -v docker &> /dev/null; then
    echo "开始安装Docker..."
    
    # 安装必要的工具
    yum install -y yum-utils device-mapper-persistent-data lvm2
    
    # 使用轩辕镜像源
    yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
    # 更新yum缓存
    yum makecache fast
    
    # 安装Docker CE
    yum install -y docker-ce docker-ce-cli containerd.io
    
    # 启动Docker服务
    systemctl start docker
    systemctl enable docker
    
    # 验证Docker安装
    docker --version
    echo -e "${GREEN}✅ Docker安装完成${NC}"
else
    echo -e "${GREEN}✅ Docker已安装${NC}"
fi

# 步骤3: 检查Docker Compose
echo -e "${YELLOW}🔧 步骤3: 检查Docker Compose...${NC}"
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose (内置版本) 可用${NC}"
    docker compose version
elif command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose (独立版本) 可用${NC}"
    docker-compose --version
else
    echo -e "${YELLOW}⚠️  Docker Compose未找到，安装独立版本...${NC}"
    # 使用轩辕镜像下载Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    # 验证安装
    docker-compose --version
    echo -e "${GREEN}✅ Docker Compose安装完成${NC}"
fi

# 步骤4: 配置Docker镜像加速（使用轩辕镜像）
echo -e "${YELLOW}⚡ 步骤4: 配置Docker镜像加速...${NC}"
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

systemctl daemon-reload
systemctl restart docker
echo -e "${GREEN}✅ Docker镜像加速配置完成${NC}"

# 步骤5: 创建项目目录
echo -e "${YELLOW}📁 步骤5: 创建项目目录结构...${NC}"
mkdir -p /opt/calorie-app
cd /opt/calorie-app
mkdir -p {data/mysql,data/redis,data/minio,logs,uploads,ssl,nginx/conf.d}
chmod 755 /opt/calorie-app
chmod -R 777 data logs uploads
echo -e "${GREEN}✅ 项目目录创建完成${NC}"

# 步骤6: 创建环境变量文件
echo -e "${YELLOW}🔐 步骤6: 创建环境变量文件...${NC}"
cat > .env << 'EOF'
# 数据库配置
MYSQL_ROOT_PASSWORD=CalorieRoot2024!
MYSQL_PASSWORD=CalorieUser2024!

# Redis配置
REDIS_PASSWORD=CalorieRedis2024!

# MinIO配置
MINIO_PASSWORD=CalorieMinio2024!

# 服务器配置
SERVER_DOMAIN=calorietracker.top
SERVER_IP=59.110.150.196
EOF

chmod 600 .env
echo -e "${GREEN}✅ 环境变量文件创建完成${NC}"

# 步骤7: 创建Nginx配置
echo -e "${YELLOW}🌐 步骤7: 创建Nginx配置文件...${NC}"
mkdir -p nginx/conf.d

# 创建主nginx配置
cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 50M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
}
EOF

# 创建Cloudflare优化的站点配置
cat > nginx/conf.d/calorietracker-top.conf << 'EOF'
# calorietracker.top 主站点配置（Cloudflare代理优化）
server {
    listen 80;
    server_name calorietracker.top www.calorietracker.top;

    # 获取真实IP（Cloudflare代理）
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    # 客户端最大上传大小
    client_max_body_size 20M;

    # API接口代理
    location /api/ {
        proxy_pass http://calorie-backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cloudflare特殊头
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-Ray $http_cf_ray;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # MinIO文件访问代理
    location /files/ {
        proxy_pass http://calorie-minio:9000/calorie-images/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 缓存配置（与Cloudflare配合）
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 主页
    location / {
        return 200 '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>食刻卡路里 - 智能饮食健康管理</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { font-size: 3em; margin-bottom: 0.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .subtitle { font-size: 1.2em; margin-bottom: 2em; opacity: 0.9; }
        .feature { margin: 1em 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; }
        .status { margin-top: 2em; padding: 20px; background: rgba(0,255,0,0.2); border-radius: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍎 食刻卡路里</h1>
        <p class="subtitle">智能饮食健康管理小程序</p>
        
        <div class="feature">
            <h3>🤖 AI智能识别</h3>
            <p>一键拍照识别食物，自动计算卡路里含量</p>
        </div>
        
        <div class="feature">
            <h3>📊 健康统计</h3>
            <p>可视化展示饮食数据，科学管理健康</p>
        </div>
        
        <div class="feature">
            <h3>🎯 目标管理</h3>
            <p>个性化设置卡路里目标，轻松达成健康计划</p>
        </div>
        
        <div class="status">
            <h3>✅ 服务状态</h3>
            <p>API服务已启动 - 域名: calorietracker.top</p>
            <p>请在微信中搜索"食刻卡路里"小程序</p>
        </div>
    </div>
</body>
</html>';
        add_header Content-Type text/html;
    }
}
EOF

echo -e "${GREEN}✅ Nginx配置文件创建完成${NC}"

# 步骤8: 创建Docker Compose文件
echo -e "${YELLOW}🐳 步骤8: 创建Docker Compose配置...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: calorie-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: calorie_tracker
      MYSQL_USER: calorie_user
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      TZ: Asia/Shanghai
    ports:
      - "3306:3306"
    volumes:
      - ./data/mysql:/var/lib/mysql
      - ./logs/mysql:/var/log/mysql
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - calorie-network

  # Redis缓存
  redis:
    image: redis:alpine
    container_name: calorie-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data
    networks:
      - calorie-network

  # MinIO对象存储
  minio:
    image: minio/minio:latest
    container_name: calorie-minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
      TZ: Asia/Shanghai
    ports:
      - "9000:9000"
      - "9090:9090"
    volumes:
      - ./data/minio:/data
    command: server /data --console-address ":9090"
    networks:
      - calorie-network

  # Spring Boot后端
  calorie-backend:
    build: ./houduan/houduan
    container_name: calorie-backend
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/calorie_tracker?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
      SPRING_DATASOURCE_USERNAME: calorie_user
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SPRING_REDIS_PASSWORD: ${REDIS_PASSWORD}
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: ${MINIO_PASSWORD}
      MINIO_BUCKET_NAME: calorie-images
      MINIO_DOMAIN: https://calorietracker.top/files
      TZ: Asia/Shanghai
    ports:
      - "8080:8080"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/var/log/calorie-tracker
    depends_on:
      - mysql
      - redis
      - minio
    networks:
      - calorie-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: calorie-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - calorie-backend
      - minio
    networks:
      - calorie-network

networks:
  calorie-network:
    driver: bridge
EOF

echo -e "${GREEN}✅ Docker Compose配置创建完成${NC}"

# 步骤9: 创建数据库初始化脚本
echo -e "${YELLOW}🗄️ 步骤9: 创建数据库初始化脚本...${NC}"
mkdir -p houduan/houduan/src/main/resources/db
cat > houduan/houduan/src/main/resources/db/init.sql << 'EOF'
-- 创建数据库
CREATE DATABASE IF NOT EXISTS calorie_tracker 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE calorie_tracker;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    age INT COMMENT '年龄',
    height DECIMAL(5,2) COMMENT '身高(cm)',
    weight DECIMAL(5,2) COMMENT '体重(kg)',
    target_calories INT DEFAULT 2000 COMMENT '目标卡路里',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 食物记录表
CREATE TABLE IF NOT EXISTS food_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    food_name VARCHAR(200) NOT NULL COMMENT '食物名称',
    calories DECIMAL(10,2) NOT NULL COMMENT '卡路里',
    protein DECIMAL(10,2) COMMENT '蛋白质(g)',
    fat DECIMAL(10,2) COMMENT '脂肪(g)',
    carbs DECIMAL(10,2) COMMENT '碳水化合物(g)',
    image_url VARCHAR(500) COMMENT '食物图片URL',
    meal_type TINYINT DEFAULT 1 COMMENT '餐食类型：1-早餐，2-午餐，3-晚餐，4-宵夜，5-零食',
    record_date DATE NOT NULL COMMENT '记录日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, record_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食物记录表';

-- 插入测试数据
INSERT IGNORE INTO users (openid, nickname, target_calories) 
VALUES ('test_openid', '测试用户', 2000);
EOF

echo -e "${GREEN}✅ 数据库初始化脚本创建完成${NC}"

# 步骤10: 拉取Docker镜像
echo -e "${YELLOW}📥 步骤10: 拉取Docker镜像...${NC}"
docker pull nginx:alpine
docker pull mysql:8.0
docker pull redis:alpine
docker pull minio/minio:latest
echo -e "${GREEN}✅ Docker镜像拉取完成${NC}"

# 完成提示
echo -e "${GREEN}"
echo "🎉 基础环境部署完成！"
echo ""
echo "📋 部署信息总结："
echo "🌐 域名: https://calorietracker.top"
echo "🖥️  服务器IP: 59.110.150.196"
echo "🐳 Docker: $(docker --version)"
if docker compose version &> /dev/null; then
    echo "🔧 Docker Compose: $(docker compose version --short)"
else
    echo "🔧 Docker Compose: $(docker-compose --version)"
fi
echo ""
echo "🔗 服务访问地址："
echo "✅ 主站: https://calorietracker.top"
echo "✅ API: https://calorietracker.top/api"
echo "✅ 文件: https://calorietracker.top/files"
echo "✅ MinIO控制台: http://59.110.150.196:9090"
echo ""
echo "📝 接下来的步骤："
echo "1. 配置Cloudflare DNS解析"
echo "2. 上传项目源码到 /opt/calorie-app/houduan/houduan/"
echo "3. 执行 docker compose up -d 或 docker-compose up -d 启动服务"
echo "4. 更新小程序配置并重新发布"
echo ""
echo "🎯 Cloudflare DNS配置："
echo "A记录: @ → 59.110.150.196 (已代理)"
echo "A记录: www → 59.110.150.196 (已代理)"
echo "CNAME记录: * → calorietracker.top (已代理)"
echo ""
echo -e "${NC}"

echo -e "${YELLOW}🔧 温馨提示：${NC}"
echo "- 请确保在Cloudflare中正确配置DNS解析"
echo "- SSL/TLS加密模式建议选择'完全'"
echo "- 开启'始终使用HTTPS'功能"
echo "- 记得在微信小程序后台添加服务器域名白名单" 