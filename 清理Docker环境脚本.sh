#!/bin/bash

# Docker环境清理脚本 - 为calorietracker.top部署做准备
# 服务器IP: 59.110.150.196

set -e

echo "🧹 开始清理Docker环境，为新域名部署做准备"

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

# 步骤1: 停止所有Docker容器
echo -e "${YELLOW}🛑 步骤1: 停止所有Docker容器...${NC}"
if [ "$(docker ps -q)" ]; then
    docker stop $(docker ps -q)
    echo -e "${GREEN}✅ 所有容器已停止${NC}"
else
    echo -e "${GREEN}✅ 没有运行中的容器${NC}"
fi

# 步骤2: 删除所有Docker容器
echo -e "${YELLOW}🗑️  步骤2: 删除所有Docker容器...${NC}"
if [ "$(docker ps -aq)" ]; then
    docker rm $(docker ps -aq)
    echo -e "${GREEN}✅ 所有容器已删除${NC}"
else
    echo -e "${GREEN}✅ 没有需要删除的容器${NC}"
fi

# 步骤3: 停止docker-compose服务（如果存在）
echo -e "${YELLOW}🔽 步骤3: 停止docker-compose服务...${NC}"
if [ -f "/opt/calorie-app/docker-compose.yml" ]; then
    cd /opt/calorie-app
    # 优先使用内置的docker compose命令
    if docker compose version &> /dev/null; then
        docker compose down -v 2>/dev/null || true
    else
        docker-compose down -v 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ docker-compose服务已停止${NC}"
else
    echo -e "${GREEN}✅ 没有发现docker-compose配置${NC}"
fi

# 步骤4: 备份数据（如果存在）
echo -e "${YELLOW}💾 步骤4: 备份重要数据...${NC}"
if [ -d "/opt/calorie-app/data" ]; then
    BACKUP_DIR="/root/calorie-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r /opt/calorie-app/data "$BACKUP_DIR/" 2>/dev/null || true
    cp /opt/calorie-app/.env "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✅ 数据已备份到: $BACKUP_DIR${NC}"
else
    echo -e "${GREEN}✅ 没有发现需要备份的数据${NC}"
fi

# 步骤5: 删除项目目录
echo -e "${YELLOW}📁 步骤5: 删除旧项目目录...${NC}"
if [ -d "/opt/calorie-app" ]; then
    rm -rf /opt/calorie-app
    echo -e "${GREEN}✅ 旧项目目录已删除${NC}"
else
    echo -e "${GREEN}✅ 项目目录不存在${NC}"
fi

# 步骤6: 清理Docker镜像
echo -e "${YELLOW}🖼️  步骤6: 清理Docker镜像...${NC}"
# 删除悬空镜像
docker image prune -f
echo -e "${GREEN}✅ 悬空镜像已清理${NC}"

# 步骤7: 清理Docker网络
echo -e "${YELLOW}🌐 步骤7: 清理Docker网络...${NC}"
docker network prune -f
echo -e "${GREEN}✅ 未使用的网络已清理${NC}"

# 步骤8: 清理Docker卷
echo -e "${YELLOW}💿 步骤8: 清理Docker卷...${NC}"
docker volume prune -f
echo -e "${GREEN}✅ 未使用的卷已清理${NC}"

# 步骤9: 清理系统缓存
echo -e "${YELLOW}🧽 步骤9: 清理系统缓存...${NC}"
# 清理包缓存
yum clean all 2>/dev/null || true
# 清理临时文件
rm -rf /tmp/* 2>/dev/null || true
echo -e "${GREEN}✅ 系统缓存已清理${NC}"

# 步骤10: 显示清理结果
echo -e "${YELLOW}📊 步骤10: 显示清理结果...${NC}"
echo ""
echo -e "${GREEN}📋 清理完成统计：${NC}"
echo "🐳 Docker容器数量: $(docker ps -a | wc -l | awk '{print $1-1}')"
echo "🖼️  Docker镜像数量: $(docker images | wc -l | awk '{print $1-1}')"
echo "🌐 Docker网络数量: $(docker network ls | wc -l | awk '{print $1-1}')"
echo "💿 Docker卷数量: $(docker volume ls | wc -l | awk '{print $1-1}')"
echo "💾 可用磁盘空间: $(df -h / | awk 'NR==2{print $4}')"

echo ""
echo -e "${GREEN}🎉 Docker环境清理完成！${NC}"
echo ""
echo -e "${YELLOW}📝 接下来的步骤：${NC}"
echo "1. 上传新的部署脚本: 一键部署脚本-calorietracker.top.sh"
echo "2. 执行部署脚本: ./一键部署脚本-calorietracker.top.sh"
echo "3. 等待Cloudflare DNS生效"
echo "4. 测试新域名访问"
echo ""
echo -e "${GREEN}✅ 环境已准备就绪，可以开始新的部署！${NC}" 