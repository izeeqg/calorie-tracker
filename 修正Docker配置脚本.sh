#!/bin/bash

# 修正Docker Compose配置脚本
# 将后端服务从源码构建改为JAR包运行

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔧 修正Docker Compose配置 - 使用JAR包运行后端"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root用户执行此脚本${NC}"
    exit 1
fi

# 检查项目目录
if [ ! -d "/opt/calorie-app" ]; then
    echo -e "${RED}❌ 项目目录 /opt/calorie-app 不存在${NC}"
    exit 1
fi

cd /opt/calorie-app

# 检查JAR包是否存在
if [ ! -f "/root/calorie-app/app.jar" ]; then
    echo -e "${RED}❌ JAR包 /root/calorie-app/app.jar 不存在${NC}"
    echo -e "${YELLOW}请确保JAR包已上传到正确位置${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 找到JAR包: /root/calorie-app/app.jar${NC}"

# 备份原配置
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup
    echo -e "${GREEN}✅ 已备份原配置到 docker-compose.yml.backup${NC}"
fi

# 创建修正的docker-compose.yml
echo -e "${YELLOW}🔧 创建修正的Docker Compose配置...${NC}"
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

  # Spring Boot后端（使用JAR包）
  calorie-backend:
    image: openjdk:17-jre-slim
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
      JAVA_OPTS: "-Xms512m -Xmx1024m"
    ports:
      - "8080:8080"
    volumes:
      - /root/calorie-app/app.jar:/app/app.jar:ro
      - ./uploads:/app/uploads
      - ./logs:/var/log/calorie-tracker
    command: ["java", "-jar", "/app/app.jar"]
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

echo -e "${GREEN}✅ Docker Compose配置已修正${NC}"

# 检查配置文件语法
echo -e "${YELLOW}🔍 检查配置文件语法...${NC}"
if docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 配置文件语法正确${NC}"
else
    echo -e "${RED}❌ 配置文件语法错误${NC}"
    docker compose config
    exit 1
fi

# 检查Java镜像是否存在
echo -e "${YELLOW}🔍 检查Java运行时镜像...${NC}"
if docker images openjdk:17-jre-slim | grep -q "17-jre-slim"; then
    echo -e "${GREEN}✅ Java镜像已存在${NC}"
else
    echo -e "${YELLOW}📥 拉取Java运行时镜像...${NC}"
    docker pull openjdk:17-jre-slim
fi

echo ""
echo -e "${GREEN}🎉 配置修正完成！${NC}"
echo ""
echo -e "${YELLOW}📋 修正内容：${NC}"
echo "• 后端服务改为使用JAR包运行"
echo "• 使用 openjdk:17-jre-slim 镜像"
echo "• JAR包路径: /root/calorie-app/app.jar"
echo "• 已设置Java内存参数: -Xms512m -Xmx1024m"
echo ""
echo -e "${YELLOW}📝 接下来执行：${NC}"
echo "docker compose up -d"
echo ""
echo -e "${GREEN}✅ 现在可以正常启动服务了！${NC}" 