#!/bin/bash

# 智能启动脚本 - 兼容版本
# 适用于 calorietracker.top 部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 启动食刻卡路里服务 - calorietracker.top"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root用户执行此脚本${NC}"
    exit 1
fi

# 进入项目目录
if [ ! -d "/opt/calorie-app" ]; then
    echo -e "${RED}❌ 项目目录 /opt/calorie-app 不存在${NC}"
    echo -e "${YELLOW}请先运行部署脚本创建项目环境${NC}"
    exit 1
fi

cd /opt/calorie-app

# 检查docker-compose.yml文件
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml 文件不存在${NC}"
    echo -e "${YELLOW}请先运行部署脚本创建配置文件${NC}"
    exit 1
fi

# 智能检测Docker Compose命令
COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    echo -e "${GREEN}✅ 使用内置 Docker Compose: $(docker compose version --short)${NC}"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    echo -e "${GREEN}✅ 使用独立 Docker Compose: $(docker-compose --version)${NC}"
else
    echo -e "${RED}❌ 未找到 Docker Compose${NC}"
    exit 1
fi

# 停止现有服务
echo -e "${YELLOW}🛑 停止现有服务...${NC}"
$COMPOSE_CMD down 2>/dev/null || true

# 启动服务（使用本地镜像）
echo -e "${YELLOW}🚀 启动所有服务...${NC}"
$COMPOSE_CMD up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 15

# 检查服务状态
echo -e "${YELLOW}📊 检查服务状态...${NC}"
$COMPOSE_CMD ps

# 检查服务健康状态
echo -e "${YELLOW}🔍 检查服务健康状态...${NC}"

# 等待MySQL启动
echo -e "${YELLOW}⏳ 等待MySQL启动...${NC}"
sleep 10

# 检查MySQL
if $COMPOSE_CMD exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL 服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL 服务启动中...${NC}"
fi

# 检查Redis
if $COMPOSE_CMD exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo -e "${GREEN}✅ Redis 服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  Redis 服务启动中...${NC}"
fi

# 检查MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MinIO 服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  MinIO 服务启动中...${NC}"
fi

# 检查Nginx
if curl -s http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx 服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx 服务启动中...${NC}"
fi

# 检查后端API（等待更长时间）
echo -e "${YELLOW}⏳ 等待后端API启动...${NC}"
sleep 10
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端API服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端API服务启动中，请稍等...${NC}"
    # 再等待一些时间
    sleep 10
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端API服务正常${NC}"
    else
        echo -e "${RED}❌ 后端API服务可能有问题，请检查日志${NC}"
        echo -e "${YELLOW}查看后端日志: docker compose logs calorie-backend${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 服务启动完成！${NC}"
echo ""
echo -e "${YELLOW}📋 服务访问地址：${NC}"
echo "🌐 主站: https://calorietracker.top"
echo "🔗 API: https://calorietracker.top/api"
echo "📁 文件: https://calorietracker.top/files"
echo "🎛️  MinIO控制台: http://59.110.150.196:9090"
echo ""
echo -e "${YELLOW}📝 常用管理命令：${NC}"
echo "• 查看状态: $COMPOSE_CMD ps"
echo "• 查看日志: $COMPOSE_CMD logs -f"
echo "• 查看后端日志: $COMPOSE_CMD logs calorie-backend"
echo "• 重启服务: $COMPOSE_CMD restart"
echo "• 停止服务: $COMPOSE_CMD down"
echo ""
echo -e "${GREEN}✅ 食刻卡路里服务已成功启动！${NC}" 